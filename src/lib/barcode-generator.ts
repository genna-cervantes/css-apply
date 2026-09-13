/**
 * Pure TypeScript Code 128 Barcode Generator
 * Generates crisp vector SVG barcodes for Member IDs and badges.
 */

// Code 128 patterns (index 0 to 106)
// Each pattern is a 6-digit string representing widths of 3 bars and 3 spaces (sum = 11 modules),
// except stop character (sum = 13 modules).
const CODE128_PATTERNS: string[] = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export function generateBarcodeSvg(
  text: string,
  options?: {
    height?: number;
    color?: string;
    showText?: boolean;
  },
): string {
  const safeText = text.trim() || "CSS-MEMBER";
  const height = options?.height ?? 40;
  const color = options?.color ?? "#134687";
  const showText = options?.showText ?? true;

  // Code 128 Set B mapping (ASCII 32 to 126 maps to values 0 to 94)
  const codes: number[] = [START_CODE_B];
  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    if (code >= 0 && code <= 94) {
      codes.push(code);
    } else {
      codes.push(0); // Space fallback
    }
  }

  // Calculate checksum
  let sum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    sum += codes[i] * i;
  }
  const checksum = sum % 103;
  codes.push(checksum);
  codes.push(STOP_CODE);

  // Convert codes to widths
  let totalWidth = 0;
  const bars: { x: number; w: number }[] = [];
  let currentX = 10; // Left quiet zone

  for (const c of codes) {
    const pattern = CODE128_PATTERNS[c];
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10);
      if (isBar) {
        bars.push({ x: currentX, w });
      }
      currentX += w;
      isBar = !isBar;
    }
  }
  totalWidth = currentX + 10; // Right quiet zone

  const barHeight = showText ? height - 12 : height;
  let barElements = "";
  for (const b of bars) {
    barElements += `<rect x="${b.x}" y="2" width="${b.w}" height="${barHeight}" fill="${color}" />`;
  }

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height - 2}" text-anchor="middle" font-family="monospace" font-size="9" font-weight="bold" fill="${color}" letter-spacing="1">${safeText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" shape-rendering="crispEdges" style="width: 100%; height: auto;">
    ${barElements}
    ${textElement}
  </svg>`;
}
