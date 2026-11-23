const waveformCache = new Map<string, number[]>();

export function generatePseudoWaveform(seedString: string, barsCount = 80): number[] {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const bars: number[] = [];
  for (let i = 0; i < barsCount; i++) {
    // Generate organic-looking music envelope (intro, verse, chorus swells, outro)
    const pos = i / barsCount;
    const envelope = Math.sin(pos * Math.PI) * 0.5 + 0.35;
    const wave = Math.sin((i + Math.abs(hash % 50)) * 0.4) * 0.25;
    const jitter = ((Math.sin(i * 12.9898 + hash) * 43758.5453) % 1 + 1) * 0.15;

    const height = Math.max(0.15, Math.min(0.98, envelope + wave + jitter));
    bars.push(parseFloat(height.toFixed(3)));
  }

  return bars;
}

export async function getWaveformForSong(
  songId: string,
  filePath: string,
  barsCount = 80
): Promise<number[]> {
  if (waveformCache.has(songId)) {
    return waveformCache.get(songId)!;
  }

  try {
    // Attempt real audio amplitude extraction using Web Audio API
    const normalizedPath = filePath.replace(/\\/g, '/');
    const mediaUrl = `tune-media://local/${encodeURI(normalizedPath)}`;

    const response = await fetch(mediaUrl, { headers: { Range: 'bytes=0-1000000' } });
    if (!response.ok) throw new Error('Range fetch failed');

    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / barsCount);
    const peaks: number[] = [];

    for (let i = 0; i < barsCount; i++) {
      const start = i * blockSize;
      let max = 0;
      for (let j = 0; j < blockSize; j += 4) {
        const val = Math.abs(channelData[start + j] || 0);
        if (val > max) max = val;
      }
      peaks.push(Math.max(0.15, Math.min(1.0, max * 1.8)));
    }

    audioCtx.close();
    waveformCache.set(songId, peaks);
    return peaks;
  } catch {
    // Fallback to organic deterministic waveform
    const fallback = generatePseudoWaveform(`${songId}-${filePath}`, barsCount);
    waveformCache.set(songId, fallback);
    return fallback;
  }
}
