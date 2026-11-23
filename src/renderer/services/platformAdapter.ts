import { Filesystem, Directory } from '@capacitor/filesystem';
import { TuneAPI, Song, SpotifyPlaylistResult, TagSuggestion } from '@/types/music';
import { isCapacitor } from './platform';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac', '.opus'];

async function scanMobileDirectory(dir: Directory, path = ''): Promise<Song[]> {
  const songs: Song[] = [];
  try {
    const result = await Filesystem.readdir({
      directory: dir,
      path
    });

    for (const file of result.files) {
      const lower = file.name.toLowerCase();
      const isAudio = AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));

      if (isAudio) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[\s._-]+/, '');
        songs.push({
          id: `mob-${file.uri || file.name}-${Date.now()}`,
          filePath: file.uri,
          fileName: file.name,
          title: cleanTitle,
          artist: 'Mobile Audio',
          album: 'Device Music',
          duration: 180,
          format: file.name.split('.').pop() || 'mp3',
          fileSize: file.size || 0,
          dateAdded: Date.now(),
          fileModified: file.mtime || Date.now(),
          playCount: 0,
          coverArt: null
        });
      }
    }
  } catch (err) {
    console.warn('Mobile filesystem scan warning:', err);
  }
  return songs;
}

export const mobileTuneAPI: TuneAPI = {
  getDownloadsPath: async () => 'Local Music',

  scanFolder: async (_folderPath: string) => {
    if (isCapacitor()) {
      return await scanMobileDirectory(Directory.Documents);
    }
    return [];
  },

  scanFolderDetailed: async (_folderPath: string) => {
    if (isCapacitor()) {
      const songs = await scanMobileDirectory(Directory.Documents);
      return { songs, rejectedCount: 0, rejectedNames: [] };
    }
    return { songs: [], rejectedCount: 0, rejectedNames: [] };
  },

  startWatching: async () => true,
  stopWatching: async () => true,

  deleteSongFile: async (filePath: string) => {
    try {
      if (isCapacitor()) {
        await Filesystem.deleteFile({ path: filePath });
      }
      return true;
    } catch {
      return false;
    }
  },

  showInFolder: async () => {},

  selectFolderDialog: async () => null,
  selectFilesDialog: async () => [],
  parseAudioFile: async () => null,

  fetchSpotifyPlaylist: async (url: string): Promise<SpotifyPlaylistResult> => {
    try {
      const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
      if (!match) return { id: '', name: 'Spotify Import', tracks: [] };
      const embedUrl = `https://open.spotify.com/embed/playlist/${match[1]}`;
      const res = await fetch(embedUrl);
      const html = await res.text();
      const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      if (!scriptMatch) return { id: match[1], name: 'Spotify Playlist', tracks: [] };
      const data = JSON.parse(scriptMatch[1]);
      const entity = data?.props?.pageProps?.state?.data?.entity;
      const name = entity?.name || 'Spotify Playlist';
      const rawTrackList = entity?.trackList || [];
      const tracks = rawTrackList.map((t: { title: string; subtitle: string; duration: number }) => ({
        title: t.title,
        artist: t.subtitle,
        duration: Math.round((t.duration || 0) / 1000)
      }));
      return { id: match[1], name, tracks };
    } catch {
      return { id: '', name: 'Spotify Playlist', tracks: [] };
    }
  },

  updateDiscordPresence: async () => {},

  suggestMetadata: async (query: string): Promise<TagSuggestion[]> => {
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`;
      const res = await fetch(itunesUrl);
      const data = await res.json();
      return (data.results || []).map((item: Record<string, string | number>) => ({
        title: (item.trackName as string) || '',
        artist: (item.artistName as string) || '',
        album: (item.collectionName as string) || '',
        genre: (item.primaryGenreName as string) || 'Music',
        year: item.releaseDate ? new Date(item.releaseDate as string).getFullYear() : null,
        coverArt: ((item.artworkUrl100 as string) || '').replace('100x100bb', '600x600bb')
      }));
    } catch {
      return [];
    }
  },

  toggleMiniPlayer: async () => false,
  isMiniPlayer: async () => false,
  onMediaKey: () => () => {},
  onMiniPlayerChanged: () => () => {},
  onFileAdded: () => () => {},
  onFileRemoved: () => () => {}
};

export function initPlatformBridge() {
  if (typeof window !== 'undefined' && !window.tuneAPI) {
    window.tuneAPI = mobileTuneAPI;
  }
}
