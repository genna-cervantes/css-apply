import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { roles } from "@/data/ebRoles";
import { PUBLIC_EB_ROLES_CACHE_TAG } from "@/lib/cache-tags";
import { getPositionTitle } from "@/lib/eb-mapping";
import { prisma } from "@/lib/prisma";

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadEbRoleData() {
  const profilesPromise = prisma.eBProfile
    .findMany({
      where: {
        isActive: true,
        recruitmentCycle: { isActive: true },
      },
      select: {
        position: true,
        meetingLink: true,
        imagePath: true,
        user: { select: { name: true } },
      },
    })
    .catch(async (error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === "P2022") {
        console.warn(
          "EBProfile.recruitmentCycleId is missing. Falling back to active EB profiles. Run `npx prisma db push` to enable AY-specific EB roles.",
        );
        return prisma.eBProfile.findMany({
          where: { isActive: true },
          select: {
            position: true,
            meetingLink: true,
            imagePath: true,
            user: { select: { name: true } },
          },
        });
      }
      throw error;
    });

  const [activeCycle, ebProfiles, availabilityConfig] = await Promise.all([
    prisma.recruitmentCycle.findFirst({
      where: { isActive: true },
      select: { id: true, schoolYear: true },
    }),
    profilesPromise,
    prisma.systemConfig.findUnique({
      where: { key: "available_executive_associate_roles" },
      select: { value: true },
    }),
  ]);

  return {
    activeCycle,
    ebProfiles,
    availabilityValue: availabilityConfig?.value ?? null,
  };
}

const getCachedEbRoleData = unstable_cache(
  loadEbRoleData,
  ["public-eb-role-data-v1"],
  { revalidate: 300, tags: [PUBLIC_EB_ROLES_CACHE_TAG] },
);

export async function GET() {
  try {
    const { activeCycle, ebProfiles, availabilityValue } =
      await getCachedEbRoleData();
    const availability = availabilityValue
      ? (JSON.parse(availabilityValue) as Record<string, boolean>)
      : {};
    const profileByPosition = new Map(
      ebProfiles.map((profile) => [profile.position, profile]),
    );

    const dynamicRoles = roles
      .filter((role) => availability[role.id] !== false)
      .map((role) => {
        const profile = profileByPosition.get(getPositionTitle(role.id));

        return {
          ...role,
          ebName: profile?.user.name ? toTitleCase(profile.user.name) : "-",
          meetingLink: profile?.meetingLink || null,
          imageUrl: profile?.imagePath
            ? `/api/eb-roles/${encodeURIComponent(role.id)}/image?v=${encodeURIComponent(profile.imagePath)}`
            : null,
          schoolYear: activeCycle?.schoolYear || null,
        };
      });

    return NextResponse.json(
      { roles: dynamicRoles, activeCycle },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Get EB roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
