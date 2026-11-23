export interface ExtractedPalette {
  primaryHex: string;
  rgb: [number, number, number];
  ambientGradient: string;
}

const DEFAULT_PALETTE: ExtractedPalette = {
  primaryHex: '#1db954',
  rgb: [29, 185, 84],
  ambientGradient: 'radial-gradient(ellipse at top left, rgba(29, 185, 84, 0.15), transparent 70%)'
};

export async function extractDominantColor(imageSrc?: string | null): Promise<ExtractedPalette> {
  if (!imageSrc) return DEFAULT_PALETTE;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(DEFAULT_PALETTE);

        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

        // Collect color samples, rejecting extreme black / extreme white
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;

          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;

          // Prefer colors with some saturation that are not completely washed out or pure black
          if (brightness > 30 && brightness < 230 && saturation > 0.15) {
            rTotal += r;
            gTotal += g;
            bTotal += b;
            count++;
          }
        }

        if (count === 0) return resolve(DEFAULT_PALETTE);

        const rAvg = Math.round(rTotal / count);
        const gAvg = Math.round(gTotal / count);
        const bAvg = Math.round(bTotal / count);

        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const primaryHex = `#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`;

        const ambientGradient = `radial-gradient(ellipse at top, rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.22) 0%, rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.05) 50%, transparent 80%)`;

        resolve({
          primaryHex,
          rgb: [rAvg, gAvg, bAvg],
          ambientGradient
        });
      } catch {
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => resolve(DEFAULT_PALETTE);
    img.src = imageSrc;
  });
}

