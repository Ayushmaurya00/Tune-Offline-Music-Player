export interface TagSuggestion {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number | null;
  coverArt: string | null;
}

export function cleanSearchQuery(rawName: string): string {
  return rawName
    .replace(/\.(mp3|m4a|wav|flac|ogg|aac|opus)$/i, '') // remove extension
    .replace(/^\d+[\s._-]+/g, '') // remove leading track numbers like "01 - " or "01_"
    .replace(/\[.*?\]/g, '') // remove brackets like [Official Video]
    .replace(/\(.*?\)/g, '') // remove parentheses
    .replace(/(320kbps|128kbps|kbps|hq|audio|video|lyrics)/gi, '') // remove quality junk
    .replace(/[._-]+/g, ' ') // replace dots/dashes with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchSuggestedMetadata(query: string): Promise<TagSuggestion[]> {
  const cleaned = cleanSearchQuery(query);
  if (!cleaned) return [];

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleaned)}&entity=song&limit=6`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
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
    console.warn('Auto-tagger fetch error:', err);
    return [];
  }
}

