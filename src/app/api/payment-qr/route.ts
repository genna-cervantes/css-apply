import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { PAYMENT_QR_CACHE_TAG } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

const CONFIG_KEY = "payment_qr_image_path";

const getCachedPaymentQrPath = unstable_cache(
  async () =>
    prisma.systemConfig.findUnique({
      where: { key: CONFIG_KEY },
      select: { value: true },
    }),
  ["payment-qr-path-v1"],
  { revalidate: 300, tags: [PAYMENT_QR_CACHE_TAG] },
);

export async function GET() {
  try {
    const config = await getCachedPaymentQrPath();

    return NextResponse.json(
      {
        url: config?.value?.trim()
          ? `/api/payment-qr/image?v=${encodeURIComponent(config.value)}`
          : "",
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Get payment QR error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
