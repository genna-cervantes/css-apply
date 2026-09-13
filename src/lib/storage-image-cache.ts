import "server-only";
import { supabase } from "@/lib/supabase";

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_ENTRY_LIMIT = 32;

interface CachedImage {
  data: Blob;
  expiresAt: number;
}

const imageCache = new Map<string, CachedImage>();
const pendingDownloads = new Map<string, Promise<Blob | null>>();

function cacheKey(bucket: string, path: string) {
  return `${bucket}:${path}`;
}

function storeImage(key: string, data: Blob) {
  imageCache.delete(key);
  imageCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });

  while (imageCache.size > CACHE_ENTRY_LIMIT) {
    const oldestKey = imageCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    imageCache.delete(oldestKey);
  }
}

export async function getCachedStorageImage(bucket: string, path: string) {
  const key = cacheKey(bucket, path);
  const cached = imageCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    imageCache.delete(key);
    imageCache.set(key, cached);
    return cached.data;
  }
  if (cached) imageCache.delete(key);

  const pending = pendingDownloads.get(key);
  if (pending) return pending;

  const download = (async () => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) return null;
    storeImage(key, data);
    return data;
  })();
  pendingDownloads.set(key, download);

  try {
    return await download;
  } finally {
    pendingDownloads.delete(key);
  }
}
