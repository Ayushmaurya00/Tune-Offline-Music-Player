export interface LyricLine {
  time: number; // in seconds
  text: string;
}

const lyricsCache = new Map<string, LyricLine[]>();
const CUSTOM_LYRICS_PREFIX = 'tune_custom_lyrics_';

export function getCustomLyricsRaw(songId: string): string {
  try {
    return localStorage.getItem(CUSTOM_LYRICS_PREFIX + songId) || '';
  } catch {
    return '';
  }
}

export function getCustomLyrics(songId: string, duration = 180): LyricLine[] | null {
  const raw = getCustomLyricsRaw(songId);
  if (!raw.trim()) return null;

  const parsed = parseLRC(raw);
  if (parsed.length > 0) return parsed;

  // If plain text without timestamps, evenly distribute across duration
  const plainLines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (plainLines.length === 0) return null;

  return plainLines.map((text, idx, arr) => ({
    time: (duration / Math.max(1, arr.length)) * idx,
    text
  }));
}

export function saveCustomLyrics(
  songId: string,
  rawContent: string,
  duration = 180
): LyricLine[] {
  try {
    localStorage.setItem(CUSTOM_LYRICS_PREFIX + songId, rawContent);
  } catch {
    // ignore
  }

  const parsed = getCustomLyrics(songId, duration) || [];
  lyricsCache.set(songId, parsed);
  return parsed;
}

export function clearCustomLyrics(songId: string): void {
  try {
    localStorage.removeItem(CUSTOM_LYRICS_PREFIX + songId);
  } catch {
    // ignore
  }
  lyricsCache.delete(songId);
}

export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let match: RegExpExecArray | null;
    const timestamps: number[] = [];

    while ((match = timeRegex.exec(line)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const millis = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
      const timeInSeconds = mins * 60 + secs + millis / 1000;
      timestamps.push(timeInSeconds);
    }

    const cleanText = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();

    if (cleanText) {
      for (const time of timestamps) {
        result.push({ time, text: cleanText });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export async function fetchLyrics(
  songId: string,
  title: string,
  artist: string,
  duration: number
): Promise<LyricLine[]> {
  // Check custom user-provided lyrics first
  const custom = getCustomLyrics(songId, duration);
  if (custom && custom.length > 0) {
    lyricsCache.set(songId, custom);
    return custom;
  }

  if (lyricsCache.has(songId)) {
    return lyricsCache.get(songId)!;
  }

  try {
    // 1. Try exact match on LRCLib
    const cleanTitle = encodeURIComponent(title.replace(/\.(mp3|m4a|flac|wav)$/i, '').trim());
    const cleanArtist = encodeURIComponent(artist !== 'Unknown Artist' ? artist.trim() : '');
    const durParam = Math.round(duration);

    const url = `https://lrclib.net/api/get?track_name=${cleanTitle}&artist_name=${cleanArtist}&duration=${durParam}`;
    let res = await fetch(url);

    if (!res.ok) {
      // 2. Fallback to search query
      const searchUrl = `https://lrclib.net/api/search?q=${cleanTitle}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const firstWithSynced = results.find((r: { syncedLyrics?: string }) => r.syncedLyrics);
          if (firstWithSynced && firstWithSynced.syncedLyrics) {
            const parsed = parseLRC(firstWithSynced.syncedLyrics);
            lyricsCache.set(songId, parsed);
            return parsed;
          }
        }
      }
      return [];
    }

    const data = await res.json();
    if (data.syncedLyrics) {
      const parsed = parseLRC(data.syncedLyrics);
      lyricsCache.set(songId, parsed);
      return parsed;
    } else if (data.plainLyrics) {
      // Create artificial timed lines if only plain lyrics exist
      const plainLines: LyricLine[] = data.plainLyrics
        .split('\n')
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((text: string, idx: number, arr: string[]) => ({
          time: (duration / arr.length) * idx,
          text
        }));
      lyricsCache.set(songId, plainLines);
      return plainLines;
    }

    return [];
  } catch (err) {
    console.warn('Could not fetch lyrics:', err);
    return [];
  }
}

