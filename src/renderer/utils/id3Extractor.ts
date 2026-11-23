/**
 * Pure JavaScript client-side ID3v2 parser to extract embedded album art and title/artist tags
 * from HTML5 File objects without Node dependencies.
 */

export interface ParsedID3 {
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string | null;
}

export async function parseFileID3(file: File): Promise<ParsedID3> {
  const result: ParsedID3 = {};

  try {
    // Read first 512KB where ID3v2 tag metadata and APIC picture usually reside
    const sliceSize = Math.min(file.size, 512 * 1024);
    const buffer = await file.slice(0, sliceSize).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for "ID3" header
    if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
      return result;
    }

    const version = bytes[3]; // e.g. 3 for ID3v2.3, 4 for ID3v2.4
    if (version < 2 || version > 4) return result;

    // Search for APIC frame (Attached Picture)
    for (let i = 10; i < bytes.length - 30; i++) {
      // Look for "APIC" (0x41, 0x50, 0x49, 0x43)
      if (
        bytes[i] === 0x41 &&
        bytes[i + 1] === 0x50 &&
        bytes[i + 2] === 0x49 &&
        bytes[i + 3] === 0x43
      ) {
        // Frame size (4 bytes)
        let frameSize = 0;
        if (version === 4) {
          // Syncsafe integer for v2.4
          frameSize =
            (bytes[i + 4] << 21) |
            (bytes[i + 5] << 14) |
            (bytes[i + 6] << 7) |
            bytes[i + 7];
        } else {
          // Normal 32-bit big-endian integer for v2.3
          frameSize =
            (bytes[i + 4] << 24) |
            (bytes[i + 5] << 16) |
            (bytes[i + 6] << 8) |
            bytes[i + 7];
        }

        if (frameSize <= 0 || frameSize > bytes.length - i - 10) {
          continue;
        }

        const frameDataOffset = i + 10;
        const frameData = bytes.subarray(frameDataOffset, frameDataOffset + frameSize);

        // Find image magic bytes inside APIC (JPEG starts with 0xFF 0xD8 0xFF, PNG with 0x89 0x50 0x4E 0x47)
        for (let j = 0; j < frameData.length - 4; j++) {
          if (frameData[j] === 0xff && frameData[j + 1] === 0xd8 && frameData[j + 2] === 0xff) {
            const imgBytes = frameData.subarray(j);
            const blob = new Blob([imgBytes], { type: 'image/jpeg' });
            result.coverArt = URL.createObjectURL(blob);
            break;
          } else if (
            frameData[j] === 0x89 &&
            frameData[j + 1] === 0x50 &&
            frameData[j + 2] === 0x4e &&
            frameData[j + 3] === 0x47
          ) {
            const imgBytes = frameData.subarray(j);
            const blob = new Blob([imgBytes], { type: 'image/png' });
            result.coverArt = URL.createObjectURL(blob);
            break;
          }
        }

        if (result.coverArt) break;
      }
    }
  } catch (err) {
    console.debug('Could not parse ID3 from file:', err);
  }

  return result;
}

