import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedStorageImage } from "@/lib/storage-image-cache";

const CONFIG_KEY = "payment_qr_image_path";
const BUCKET_NAME = "payment";
const VERSIONED_PAYMENT_QR_PATH =
  /^payment\/payment-qr-\d+\.(?:jpe?g|png|webp)$/i;

export async function GET(request: NextRequest) {
  try {
    const versionedImagePath = request.nextUrl.searchParams.get("v");
    let imagePath =
      versionedImagePath && VERSIONED_PAYMENT_QR_PATH.test(versionedImagePath)
        ? versionedImagePath
        : null;

    if (!imagePath) {
      const config = await prisma.systemConfig.findUnique({
        where: { key: CONFIG_KEY },
        select: { value: true },
      });
      imagePath = config?.value ?? null;
    }

    if (!imagePath) {
      return NextResponse.json(
        { error: "Payment QR not configured" },
        { status: 404 },
      );
    }

    const data = await getCachedStorageImage(BUCKET_NAME, imagePath);

    if (!data) {
      console.error("Payment QR download failed");
      return NextResponse.json(
        { error: "Payment QR not found" },
        { status: 404 },
      );
    }

    const isVersionedRequest = versionedImagePath === imagePath;

    return new NextResponse(data, {
      headers: {
        "Content-Type": data.type || "image/png",
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
    console.error("Payment QR image error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
