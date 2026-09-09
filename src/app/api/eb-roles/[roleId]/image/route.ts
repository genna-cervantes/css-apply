import { NextRequest, NextResponse } from "next/server";
import { roles } from "@/data/ebRoles";
import { getPositionTitle } from "@/lib/eb-mapping";
import { prisma } from "@/lib/prisma";
import { getCachedStorageImage } from "@/lib/storage-image-cache";

const BUCKET_NAME = "eb-profile-images";
const VERSIONED_IMAGE_PATH =
  /^profiles\/[a-zA-Z0-9_-]+\/[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> },
) {
  try {
    const { roleId } = await params;
    if (!roles.some((role) => role.id === roleId)) {
      return NextResponse.json({ error: "EB role not found" }, { status: 404 });
    }

    const versionedImagePath = request.nextUrl.searchParams.get("v");
    let imagePath =
      versionedImagePath && VERSIONED_IMAGE_PATH.test(versionedImagePath)
        ? versionedImagePath
        : null;

    if (!imagePath) {
      const activeCycle = await prisma.recruitmentCycle.findFirst({
        where: { isActive: true },
        select: { id: true },
      });

      if (!activeCycle) {
        return NextResponse.json(
          { error: "No active recruitment cycle" },
          { status: 404 },
        );
      }

      const profile = await prisma.eBProfile.findFirst({
        where: {
          recruitmentCycleId: activeCycle.id,
          position: getPositionTitle(roleId),
          isActive: true,
        },
        select: { imagePath: true },
      });
      imagePath = profile?.imagePath ?? null;
    }

    if (!imagePath) {
      return NextResponse.json(
        { error: "EB image not configured" },
        { status: 404 },
      );
    }

    const data = await getCachedStorageImage(BUCKET_NAME, imagePath);

    if (!data) {
      console.error("Public EB image download failed");
      return NextResponse.json(
        { error: "EB image not found" },
        { status: 404 },
      );
    }

    const isVersionedRequest = versionedImagePath === imagePath;

    return new NextResponse(data, {
      headers: {
        "Content-Type": data.type || "image/jpeg",
        "Cache-Control": isVersionedRequest
          ? "public, max-age=31536000, s-maxage=31536000, immutable"
          : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        ...(isVersionedRequest
          ? {
              "CDN-Cache-Control": "public, max-age=31536000, immutable",
              "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
            }
          : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Get public EB image failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
