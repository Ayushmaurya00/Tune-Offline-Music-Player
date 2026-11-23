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

export interface WrappedStats {
  totalMinutes: number;
  totalPlays: number;
  topSongs: { title: string; artist: string; plays: number; coverArt?: string | null }[];
  topArtists: { artist: string; plays: number }[];
  topGenre: string;
  streakDays: number;
  musicPersonality: string;
}

const STATS_STORAGE_KEY = 'tune_play_history_v1';

export function recordSongPlay(song: Song) {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    const history: PlayHistoryEvent[] = raw ? JSON.parse(raw) : [];

    const newEvent: PlayHistoryEvent = {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      duration: song.duration,
      timestamp: Date.now()
    };

    // Keep up to 2000 listening events
    const updated = [newEvent, ...history].slice(0, 2000);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to record song play:', err);
  }
}

export function computeWrappedStats(fallbackSongs: Song[] = []): WrappedStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    let events: PlayHistoryEvent[] = raw ? JSON.parse(raw) : [];

    // If history is small, supplement with library songs so Wrapped has vibrant data to display
    if (events.length === 0 && fallbackSongs.length > 0) {
      events = fallbackSongs.slice(0, 15).map((s, idx) => ({
        songId: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        genre: s.genre,
        duration: s.duration || 180,
        timestamp: Date.now() - idx * 3600000
      }));
    }

    let totalSeconds = 0;
    const songPlayCounts = new Map<string, { title: string; artist: string; plays: number; coverArt?: string | null }>();
    const artistPlayCounts = new Map<string, number>();
    const genreCounts = new Map<string, number>();
    const activeDates = new Set<string>();

    for (const ev of events) {
      totalSeconds += ev.duration || 180;

      // Track songs
      const existingSong = songPlayCounts.get(ev.title) || {
        title: ev.title,
        artist: ev.artist,
        plays: 0,
        coverArt: fallbackSongs.find((s) => s.title === ev.title)?.coverArt
      };
      existingSong.plays++;
      songPlayCounts.set(ev.title, existingSong);

      // Track artists
      if (ev.artist && ev.artist !== 'Unknown Artist') {
        artistPlayCounts.set(ev.artist, (artistPlayCounts.get(ev.artist) || 0) + 1);
      }

      // Track genres
      if (ev.genre) {
        genreCounts.set(ev.genre, (genreCounts.get(ev.genre) || 0) + 1);
      }

      // Track days
      const dateStr = new Date(ev.timestamp).toDateString();
      activeDates.add(dateStr);
    }

    const topSongs = Array.from(songPlayCounts.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    const topArtists = Array.from(artistPlayCounts.entries())
      .map(([artist, plays]) => ({ artist, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    const sortedGenres = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]);
    const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : 'All Vibes';

    // Calculate personality
    let musicPersonality = 'The Eclectic Explorer';
    if (topArtists.length > 0 && topArtists[0].plays > 5) {
      musicPersonality = `The ${topArtists[0].artist} Devotee`;
    } else if (events.length > 20) {
      musicPersonality = 'The Heavy Streamer';
    } else if (topGenre && topGenre !== 'All Vibes') {
      musicPersonality = `The ${topGenre} Connoisseur`;
    }

    return {
      totalMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      totalPlays: events.length,
      topSongs,
      topArtists,
      topGenre,
      streakDays: Math.max(1, activeDates.size),
      musicPersonality
    };
  } catch {
    return {
      totalMinutes: 0,
      totalPlays: 0,
      topSongs: [],
      topArtists: [],
      topGenre: 'Music',
      streakDays: 1,
      musicPersonality: 'The Music Lover'
    };
  }
}

