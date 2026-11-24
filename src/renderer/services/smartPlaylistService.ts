import { Song } from '@/types/music';

export interface PlayHistoryEvent {
  songId: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  duration: number;
  timestamp: number;
}

const STATS_STORAGE_KEY = 'tune_play_history_v1';

export function getPlayHistoryEvents(): PlayHistoryEvent[] {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Returns library songs ranked by listening count (most played first)
 */
export function getMostPlayedSongs(allSongs: Song[]): Song[] {
  if (allSongs.length === 0) return [];

  const events = getPlayHistoryEvents();
  const playCounts = new Map<string, number>();

  for (const ev of events) {
    const key = ev.songId || ev.title.toLowerCase();
    playCounts.set(key, (playCounts.get(key) || 0) + 1);
  }

  const songsWithPlays = allSongs.map((song) => {
    const byId = playCounts.get(song.id) || 0;
    const byTitle = playCounts.get(song.title.toLowerCase()) || 0;
    const totalPlays = Math.max(byId, byTitle, song.playCount || 0);
    return { song, totalPlays };
  });

  // Sort descending by play count
  songsWithPlays.sort((a, b) => b.totalPlays - a.totalPlays);

  // Return ranked songs
  return songsWithPlays.map((item) => item.song);
}

/**
 * Returns library songs sorted by date added / file modified (newest first)
 */
export function getRecentlyAddedSongs(allSongs: Song[], limit = 60): Song[] {
  if (allSongs.length === 0) return [];

  return [...allSongs]
    .sort((a, b) => {
      const timeA = a.fileModified || a.dateAdded || 0;
      const timeB = b.fileModified || b.dateAdded || 0;
      return timeB - timeA;
    })
    .slice(0, limit);
}

/**
 * Returns library songs ordered by most recent listening timestamp
 */
export function getRecentlyPlayedSongs(allSongs: Song[], limit = 60): Song[] {
  if (allSongs.length === 0) return [];

  const events = getPlayHistoryEvents();
  if (events.length === 0) {
    return allSongs.slice(0, 20);
  }

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const recentSongs: Song[] = [];

  for (const ev of events) {
    if (recentSongs.length >= limit) break;

    const matched = allSongs.find(
      (s) =>
        s.id === ev.songId ||
        s.title.toLowerCase() === ev.title.toLowerCase()
    );

    if (matched && !seenIds.has(matched.id) && !seenTitles.has(matched.title.toLowerCase())) {
      seenIds.add(matched.id);
      seenTitles.add(matched.title.toLowerCase());
      recentSongs.push(matched);
    }
  }

  return recentSongs.length > 0 ? recentSongs : allSongs.slice(0, 20);
}
