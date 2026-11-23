export interface SpotifyTrack {
  title: string;
  artist: string;
  duration: number; // in seconds
}

export interface SpotifyPlaylistResult {
  id: string;
  name: string;
  tracks: SpotifyTrack[];
  coverArt?: string | null;
}

export function extractPlaylistId(input: string): string | null {
  const clean = input.trim();
  const match = clean.match(/playlist[\/:]([a-zA-Z0-9]+)/);
  if (match) return match[1];

  // Raw ID check (typically 22 alphanumeric characters)
  if (/^[a-zA-Z0-9]{15,30}$/.test(clean)) {
    return clean;
  }

  return null;
}

export async function fetchSpotifyPlaylistTracks(input: string): Promise<SpotifyPlaylistResult> {
  const playlistId = extractPlaylistId(input);
  if (!playlistId) {
    throw new Error('Invalid Spotify playlist URL or ID.');
  }

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify playlist (HTTP ${response.status})`);
  }

  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);

  if (!match) {
    throw new Error('Could not parse Spotify playlist data.');
  }

  const data = JSON.parse(match[1]);
  const entity = data?.props?.pageProps?.state?.data?.entity;

  if (!entity) {
    throw new Error('Spotify playlist entity not found or is private.');
  }

  const name = entity.name || 'Imported Spotify Playlist';
  const rawTracks = entity.trackList || [];

  const tracks: SpotifyTrack[] = rawTracks.map((t: { title: string; subtitle?: string; duration?: number }) => ({
    title: t.title || 'Unknown Title',
    artist: t.subtitle ? t.subtitle.replace(/\u00a0/g, ' ') : 'Unknown Artist',
    duration: t.duration ? Math.round(t.duration / 1000) : 0
  }));

  return {
    id: playlistId,
    name,
    tracks
  };
}

