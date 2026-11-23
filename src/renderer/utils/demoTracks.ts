import { Song } from '@/types/music';

// Creates a real playable WAV audio buffer in-memory
function createSynthWav(frequency: number, durationSeconds: number, chordType: 'major' | 'minor' | 'ambient'): string {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new Float32Array(numSamples);

  const freq2 = chordType === 'major' ? frequency * 1.25 : frequency * 1.2;
  const freq3 = frequency * 1.5;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope: fade in, sustain, fade out
    const env = Math.min(1, Math.min(t / 0.5, (durationSeconds - t) / 0.8));
    // Melodic chord voices with subtle LFO
    const lfo = 1 + 0.05 * Math.sin(2 * Math.PI * 0.5 * t);
    const s1 = Math.sin(2 * Math.PI * frequency * t * lfo);
    const s2 = 0.6 * Math.sin(2 * Math.PI * freq2 * t);
    const s3 = 0.4 * Math.sin(2 * Math.PI * freq3 * t);
    const sample = (s1 + s2 + s3) * 0.3 * env;
    buffer[i] = Math.max(-1, Math.min(1, sample));
  }

  // Encode to 16-bit PCM WAV
  const wavBytes = new Uint8Array(44 + numSamples * 2);
  const view = new DataView(wavBytes.buffer);

  // RIFF chunk descriptor
  wavBytes.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  wavBytes.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // "fmt " sub-chunk
  wavBytes.set([0x66, 0x6d, 0x74, 0x20], 12);
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" sub-chunk
  wavBytes.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function createCoverArt(title: string, color1: string, color2: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 300, 300);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 300, 300);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 150, 140);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Tune Official Demo', 150, 175);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function generateDemoTracks(): Song[] {
  const now = Date.now();

  return [
    {
      id: 'demo-midnight-horizon',
      filePath: createSynthWav(220, 28, 'minor'), // A3
      fileName: 'Midnight Horizon.wav',
      title: 'Midnight Horizon',
      artist: 'Aura & The Echoes',
      album: 'Neon Dreams (Deluxe)',
      genre: 'Synthwave',
      year: 2026,
      duration: 28,
      format: 'wav',
      fileSize: 1234567,
      dateAdded: now,
      fileModified: now,
      playCount: 1,
      coverArt: createCoverArt('Midnight Horizon', '#1e1b4b', '#7c3aed')
    },
    {
      id: 'demo-coffee-rain',
      filePath: createSynthWav(261.63, 24, 'major'), // C4
      fileName: 'Coffee & Rain.wav',
      title: 'Coffee & Rain',
      artist: 'Luna Chill',
      album: 'Lo-Fi Solitude',
      genre: 'Lo-Fi',
      year: 2026,
      duration: 24,
      format: 'wav',
      fileSize: 1058400,
      dateAdded: now - 3600000,
      fileModified: now - 3600000,
      playCount: 0,
      coverArt: createCoverArt('Coffee & Rain', '#0f766e', '#14b8a6')
    },
    {
      id: 'demo-electric-sunset',
      filePath: createSynthWav(196, 30, 'ambient'), // G3
      fileName: 'Electric Sunset.wav',
      title: 'Electric Sunset',
      artist: 'Kavinsky Vibes',
      album: 'Retro Drive',
      genre: 'Electronic',
      year: 2026,
      duration: 30,
      format: 'wav',
      fileSize: 1323000,
      dateAdded: now - 7200000,
      fileModified: now - 7200000,
      playCount: 0,
      coverArt: createCoverArt('Electric Sunset', '#831843', '#f43f5e')
    }
  ];
}
