import { NextRequest, NextResponse } from "next/server";
import { EXCLUSIVE_PERKS_BUCKET } from "@/lib/exclusive-perks";
import { getCachedStorageImage } from "@/lib/storage-image-cache";

const VERSIONED_PARTNER_IMAGE_PATH =
  /^partners\/[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i;

export async function GET(request: NextRequest) {
  try {
    const imagePath = request.nextUrl.searchParams.get("v");
    if (!imagePath || !VERSIONED_PARTNER_IMAGE_PATH.test(imagePath)) {
      return NextResponse.json(
        { error: "Invalid partner image path" },
        { status: 400 },
      );
    }

    const data = await getCachedStorageImage(EXCLUSIVE_PERKS_BUCKET, imagePath);
    if (!data) {
      return NextResponse.json(
        { error: "Partner image not found" },
        { status: 404 },
      );
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": data.type || "image/webp",
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Get partner image failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Unable to load partner image" },
      { status: 500 },
    );
  }
}
