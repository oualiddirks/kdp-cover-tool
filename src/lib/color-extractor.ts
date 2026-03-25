/**
 * Canvas-based dominant color extractor (no external deps).
 * Loads the image in a hidden canvas, samples pixels, clusters by hue/brightness.
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 50; // downsample for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve("#6d28d9"); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Build color buckets (6-bit quantisation per channel)
        const buckets: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]   & 0xf8; // mask to 5 bits
          const g = data[i+1] & 0xf8;
          const b = data[i+2] & 0xf8;
          const a = data[i+3];
          if (a < 128) continue; // skip transparent
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }

        // Find most frequent bucket
        let bestKey = "100,100,200";
        let bestCount = 0;
        for (const [key, count] of Object.entries(buckets)) {
          if (count > bestCount) { bestCount = count; bestKey = key; }
        }

        const [r, g, b] = bestKey.split(",").map(Number);
        resolve(rgbToHex(r, g, b));
      } catch {
        resolve("#6d28d9");
      }
    };
    img.onerror = () => resolve("#6d28d9");
    img.src = imageUrl;
  });
}

export function getDarkerShade(hex: string, amount = 40): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "#1e1b4b";
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return rgbToHex(r, g, b);
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
