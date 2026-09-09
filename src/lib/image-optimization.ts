import "server-only";
import sharp from "sharp";

interface OptimizeImageOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
}

export async function optimizeImageToWebp(
  input: Uint8Array,
  { maxWidth, maxHeight, quality = 82 }: OptimizeImageOptions,
) {
  return sharp(input, {
    animated: false,
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4, smartSubsample: true })
    .toBuffer();
}
