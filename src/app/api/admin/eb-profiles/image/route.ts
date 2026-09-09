import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { after, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { PUBLIC_EB_ROLES_CACHE_TAG } from "@/lib/cache-tags";
import { optimizeImageToWebp } from "@/lib/image-optimization";

const BUCKET_NAME = "eb-profile-images";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const BUCKET_CHECK_TTL_MS = 10 * 60 * 1000;

let bucketReadyUntil = 0;
let bucketSetupPromise: Promise<void> | null = null;

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const EXTENSION_BY_TYPE: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isSuperAdmin(role?: string) {
  return role === "super_admin" || role === "super-admin";
}

async function authorizeSuperAdmin() {
  const session = await getServerSession(authOptions);
  return session && isSuperAdmin(session.user.role);
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

async function ensureBucket() {
  if (bucketReadyUntil > Date.now()) return;
  if (bucketSetupPromise) return bucketSetupPromise;

  bucketSetupPromise = (async () => {
    const { data } = await supabase.storage.getBucket(BUCKET_NAME);
    if (data) {
      const { error } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: false,
        allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
        fileSizeLimit: MAX_IMAGE_SIZE,
      });
      if (error) throw new Error("Unable to update EB image storage settings");
    } else {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
        fileSizeLimit: MAX_IMAGE_SIZE,
      });

      if (error && !error.message.toLowerCase().includes("already")) {
        throw new Error("Unable to initialize EB image storage");
      }
    }

    // Cache the verified private bucket configuration instead of repeating
    // these management calls during every phase of every picture transfer.
    bucketReadyUntil = Date.now() + BUCKET_CHECK_TTL_MS;
  })();

  try {
    await bucketSetupPromise;
  } finally {
    bucketSetupPromise = null;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await authorizeSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const profile = await prisma.eBProfile.findUnique({
      where: { userId },
      select: { imagePath: true },
    });

    if (!profile?.imagePath) {
      return NextResponse.json(
        { error: "EB image not configured" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(profile.imagePath);

    if (error || !data) {
      console.error("EB image download failed");
      return NextResponse.json(
        { error: "EB image not found" },
        { status: 404 },
      );
    }

    const isVersionedRequest =
      request.nextUrl.searchParams.get("v") === profile.imagePath;

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
      "Get EB image failed",
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
    if (!(await authorizeSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const payload = body as Record<string, unknown>;
    const action = payload.action;
    const userId = typeof payload.userId === "string" ? payload.userId : "";
    if (!userId || (action !== "prepare" && action !== "complete")) {
      return NextResponse.json(
        { error: "Invalid upload request" },
        { status: 400 },
      );
    }

    const profile = await prisma.eBProfile.findUnique({
      where: { userId },
      select: { id: true, imagePath: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "EB profile not found" },
        { status: 404 },
      );
    }

    if (action === "prepare") {
      await ensureBucket();
      const fileType =
        typeof payload.fileType === "string" ? payload.fileType : "";
      const fileSize =
        typeof payload.fileSize === "number" ? payload.fileSize : 0;
      if (!ALLOWED_IMAGE_TYPES.includes(fileType as AllowedImageType)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, and WebP images are allowed" },
          { status: 400 },
        );
      }
      if (
        !Number.isSafeInteger(fileSize) ||
        fileSize <= 0 ||
        fileSize > MAX_IMAGE_SIZE
      ) {
        return NextResponse.json(
          { error: "Image must be 10MB or smaller" },
          { status: 400 },
        );
      }

      const extension = EXTENSION_BY_TYPE[fileType as AllowedImageType];
      const imagePath = `profiles/${profile.id}/${randomUUID()}.${extension}`;
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(imagePath);

      if (error || !data) {
        console.error("EB signed upload creation failed");
        return NextResponse.json(
          { error: "Unable to prepare image upload" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        imagePath,
        signedUrl: data.signedUrl,
      });
    }

    const imagePath =
      typeof payload.imagePath === "string" ? payload.imagePath : "";
    const fileType =
      typeof payload.fileType === "string" ? payload.fileType : "";
    const expectedPrefix = `profiles/${profile.id}/`;
    if (
      !imagePath.startsWith(expectedPrefix) ||
      imagePath.includes("..") ||
      !ALLOWED_IMAGE_TYPES.includes(fileType as AllowedImageType) ||
      !imagePath.endsWith(`.${EXTENSION_BY_TYPE[fileType as AllowedImageType]}`)
    ) {
      return NextResponse.json(
        { error: "Invalid uploaded image" },
        { status: 400 },
      );
    }

    const storage = supabase.storage.from(BUCKET_NAME);
    const { data: uploadedImage, error: downloadError } =
      await storage.download(imagePath);
    if (downloadError || !uploadedImage) {
      return NextResponse.json(
        { error: "Uploaded image was not found" },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await uploadedImage.arrayBuffer());
    if (
      bytes.length === 0 ||
      bytes.length > MAX_IMAGE_SIZE ||
      !hasValidImageSignature(bytes, fileType as AllowedImageType)
    ) {
      await storage.remove([imagePath]);
      return NextResponse.json(
        { error: "The uploaded file is not a valid image" },
        { status: 400 },
      );
    }

    let optimizedImage: Buffer;
    try {
      optimizedImage = await optimizeImageToWebp(bytes, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 82,
      });
    } catch {
      await storage.remove([imagePath]);
      return NextResponse.json(
        { error: "The uploaded image could not be optimized" },
        { status: 400 },
      );
    }

    const optimizedImagePath = `profiles/${profile.id}/${randomUUID()}.webp`;
    const { error: optimizedUploadError } = await storage.upload(
      optimizedImagePath,
      optimizedImage,
      {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      },
    );
    if (optimizedUploadError) {
      await storage.remove([imagePath]);
      throw new Error("Unable to store optimized EB image");
    }

    try {
      await prisma.eBProfile.update({
        where: { userId },
        data: { imagePath: optimizedImagePath },
      });
    } catch (error) {
      await storage.remove([imagePath, optimizedImagePath]);
      throw error;
    }

    const obsoletePaths = [imagePath, profile.imagePath].filter(
      (path): path is string => Boolean(path) && path !== optimizedImagePath,
    );
    if (obsoletePaths.length > 0) {
      after(async () => {
        const { error: removeError } = await storage.remove(obsoletePaths);
        if (removeError) console.error("Previous EB image cleanup failed");
      });
    }

    revalidateTag(PUBLIC_EB_ROLES_CACHE_TAG);
    return NextResponse.json({
      success: true,
      imageUrl: `/api/admin/eb-profiles/image?userId=${encodeURIComponent(userId)}&v=${encodeURIComponent(optimizedImagePath)}`,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error(
      "Update EB image failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await authorizeSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const profile = await prisma.eBProfile.findUnique({
      where: { userId },
      select: { imagePath: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "EB profile not found" },
        { status: 404 },
      );
    }

    await prisma.eBProfile.update({
      where: { userId },
      data: { imagePath: null },
    });

    if (profile.imagePath) {
      const previousImagePath = profile.imagePath;
      after(async () => {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([previousImagePath]);
        if (error) console.error("EB image cleanup failed");
      });
    }

    revalidateTag(PUBLIC_EB_ROLES_CACHE_TAG);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Remove EB image failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
