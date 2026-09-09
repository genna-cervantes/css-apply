import { randomUUID } from "crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { optimizeImageToWebp } from "@/lib/image-optimization";

const BUCKET_NAME = "member-id-photos";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const BUCKET_CHECK_TTL_MS = 10 * 60 * 1000;

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

let bucketReadyUntil = 0;
let bucketSetupPromise: Promise<void> | null = null;

function photoUrl(photoPath: string) {
  return `/api/user/digital-id/photo?v=${encodeURIComponent(photoPath)}`;
}

function hasValidImageSignature(bytes: Uint8Array, type: AllowedImageType) {
  if (type === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return (
      bytes.length >= signature.length &&
      signature.every((value, index) => bytes[index] === value)
    );
  }

  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

function parsePhotoDataUrl(value: unknown) {
  if (typeof value !== "string") return null;

  const match = value.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/,
  );
  if (!match) return null;

  const type = match[1] as AllowedImageType;
  const bytes = Buffer.from(match[2], "base64");
  if (
    bytes.length === 0 ||
    bytes.length > MAX_IMAGE_SIZE ||
    !hasValidImageSignature(bytes, type)
  ) {
    return null;
  }

  return { type, bytes };
}

async function ensureBucket() {
  if (bucketReadyUntil > Date.now()) return;
  if (bucketSetupPromise) return bucketSetupPromise;

  bucketSetupPromise = (async () => {
    const settings = {
      public: false,
      allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
      fileSizeLimit: MAX_IMAGE_SIZE,
    };
    const { data } = await supabase.storage.getBucket(BUCKET_NAME);

    if (data) {
      const { error } = await supabase.storage.updateBucket(
        BUCKET_NAME,
        settings,
      );
      if (error) throw new Error("Unable to secure member photo storage");
    } else {
      const { error } = await supabase.storage.createBucket(
        BUCKET_NAME,
        settings,
      );
      if (error && !error.message.toLowerCase().includes("already")) {
        throw new Error("Unable to initialize member photo storage");
      }
    }

    bucketReadyUntil = Date.now() + BUCKET_CHECK_TTL_MS;
  })();

  try {
    await bucketSetupPromise;
  } finally {
    bucketSetupPromise = null;
  }
}

async function getActiveMembership(email: string) {
  return prisma.membership.findFirst({
    where: {
      user: { email },
      recruitmentCycle: { isActive: true },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, photoPath: true },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getActiveMembership(session.user.email);
    if (!membership?.photoPath) {
      return NextResponse.json(
        { error: "Member ID photo not configured" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(membership.photoPath);
    if (error || !data) {
      console.error("Member ID photo download failed");
      return NextResponse.json(
        { error: "Member ID photo not found" },
        { status: 404 },
      );
    }

    const isVersionedRequest =
      request.nextUrl.searchParams.get("v") === membership.photoPath;

    return new NextResponse(data, {
      headers: {
        "Content-Type": data.type || "image/jpeg",
        "Cache-Control": isVersionedRequest
          ? "private, max-age=31536000, immutable"
          : "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Get member ID photo failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const photo =
      body && typeof body === "object"
        ? parsePhotoDataUrl((body as Record<string, unknown>).photo)
        : null;
    if (!photo) {
      return NextResponse.json(
        { error: "A valid JPEG, PNG, or WebP photo under 2MB is required" },
        { status: 400 },
      );
    }

    const membership = await getActiveMembership(session.user.email);
    if (!membership) {
      return NextResponse.json(
        { error: "An active membership is required to upload an ID photo" },
        { status: 403 },
      );
    }

    await ensureBucket();

    let optimizedPhoto: Buffer;
    try {
      optimizedPhoto = await optimizeImageToWebp(photo.bytes, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 85,
      });
    } catch {
      return NextResponse.json(
        { error: "The selected ID photo could not be optimized" },
        { status: 400 },
      );
    }

    const imagePath = `memberships/${membership.id}/${randomUUID()}.webp`;
    const storage = supabase.storage.from(BUCKET_NAME);
    const { error: uploadError } = await storage.upload(
      imagePath,
      optimizedPhoto,
      {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      },
    );

    if (uploadError) {
      console.error("Member ID photo upload failed");
      return NextResponse.json(
        { error: "Failed to store the member ID photo" },
        { status: 500 },
      );
    }

    try {
      await prisma.membership.update({
        where: { id: membership.id },
        data: { photoPath: imagePath },
      });
    } catch (error) {
      await storage.remove([imagePath]);
      throw error;
    }

    if (membership.photoPath && membership.photoPath !== imagePath) {
      const previousPhotoPath = membership.photoPath;
      after(async () => {
        const { error } = await storage.remove([previousPhotoPath]);
        if (error) console.error("Previous member ID photo cleanup failed");
      });
    }

    return NextResponse.json({
      success: true,
      image: photoUrl(imagePath),
      message: "1x1 ID photo updated successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error(
      "Update member ID photo failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Failed to update the member ID photo" },
      { status: 500 },
    );
  }
}
