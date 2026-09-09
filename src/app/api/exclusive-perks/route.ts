import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { EXCLUSIVE_PERKS_CACHE_TAG } from "@/lib/cache-tags";
import {
  EXCLUSIVE_PERKS_CONFIG_KEY,
  isLocalPerkImagePath,
  parseExclusivePerks,
} from "@/lib/exclusive-perks";
import { prisma } from "@/lib/prisma";

const getCachedExclusivePerksConfig = unstable_cache(
  async () =>
    prisma.systemConfig.findUnique({
      where: { key: EXCLUSIVE_PERKS_CONFIG_KEY },
      select: { value: true },
    }),
  ["public-exclusive-perks-v1"],
  { revalidate: 300, tags: [EXCLUSIVE_PERKS_CACHE_TAG] },
);

export async function GET() {
  try {
    const config = await getCachedExclusivePerksConfig();
    const items = parseExclusivePerks(config?.value);

    return NextResponse.json(
      {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          destinationUrl: item.destinationUrl,
          imageUrl: isLocalPerkImagePath(item.imagePath)
            ? item.imagePath
            : `/api/exclusive-perks/image?v=${encodeURIComponent(item.imagePath)}`,
          shape: item.shape,
          fit: item.fit,
          size: item.size,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error(
      "Get public exclusive perks failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Unable to load exclusive perks" },
      { status: 500 },
    );
  }
}
