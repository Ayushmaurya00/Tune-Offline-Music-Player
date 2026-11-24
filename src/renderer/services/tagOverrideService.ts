import { Song, TagSuggestion } from '@/types/music';

export interface TagOverride {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number | null;
  coverArt?: string | null;
}

const TAG_OVERRIDES_STORAGE_KEY = 'tune_tag_overrides_v1';

export function getTagOverrides(): Record<string, TagOverride> {
  try {
    const raw = localStorage.getItem(TAG_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTagOverride(songId: string, override: TagOverride): void {
  try {
    const all = getTagOverrides();
    all[songId] = { ...(all[songId] || {}), ...override };
    localStorage.setItem(TAG_OVERRIDES_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to save tag override:', err);
  }
}

export function applyTagOverrides(songs: Song[]): Song[] {
  const overrides = getTagOverrides();
  if (Object.keys(overrides).length === 0) return songs;

  return songs.map((song) => {
    const override = overrides[song.id];
    if (!override) return song;
    return {
      ...song,
      title: override.title !== undefined ? override.title : song.title,
      artist: override.artist !== undefined ? override.artist : song.artist,
      album: override.album !== undefined ? override.album : song.album,
      genre: override.genre !== undefined ? override.genre : song.genre,
      year: override.year !== undefined ? override.year : song.year,
      coverArt: override.coverArt !== undefined ? override.coverArt : song.coverArt
    };
  });
}

export function cleanSongQuery(rawName: string): string {
  return rawName
    .replace(/\.(mp3|m4a|wav|flac|ogg|aac|opus)$/i, '')
    .replace(/^\d+[\s._-]+/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/(320kbps|128kbps|kbps|hq|audio|video|lyrics)/gi, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchMetadataSuggestions(query: string): Promise<TagSuggestion[]> {
  const cleaned = cleanSongQuery(query);
  if (!cleaned) return [];

  // 1. If in Electron, use tuneAPI suggestMetadata
  if (window.tuneAPI?.suggestMetadata) {
    try {
      const results = await window.tuneAPI.suggestMetadata(cleaned);
      if (results && results.length > 0) return results;
    } catch {
      // Fallback to fetch
    }
  }

  // 2. Web / Mobile direct fetch from iTunes search API
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleaned)}&entity=song&limit=6`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: {
      trackName?: string;
      artistName?: string;
      collectionName?: string;
      primaryGenreName?: string;
      releaseDate?: string;
      artworkUrl100?: string;
    }) => {
      let highResArt = item.artworkUrl100 || null;
      if (highResArt) {
        highResArt = highResArt.replace('100x100bb', '600x600bb');
      }

      let year: number | null = null;
      if (item.releaseDate) {
        year = new Date(item.releaseDate).getFullYear();
      }

      return {
        title: item.trackName || cleaned,
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Unknown Album',
        genre: item.primaryGenreName || 'Music',
        year,
        coverArt: highResArt
      };
    });
  } catch (err) {
    console.warn('Failed to fetch metadata suggestions:', err);
    return [];
  }
}
