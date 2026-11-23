export interface Song {
  id: string;               // Unique hash or path id
  filePath: string;
  fileName: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  year?: number | null;
  duration: number;         // In seconds
  format: string;
  fileSize: number;         // In bytes
  dateAdded: number;        // Timestamp
  fileModified: number;     // OS mtime timestamp
  coverArt?: string | null; // Base64 data URL
  playCount: number;
  lastPlayed?: number | null;
  isLiked?: boolean;
}

export type RepeatMode = 'none' | 'all' | 'one';

export interface QueueItem {
  queueId: string;          // Unique per queue slot
  song: Song;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  songIds: string[];
  coverArt?: string | null;
}

export type SortField = 'dateAdded' | 'fileModified' | 'title' | 'artist' | 'duration' | 'album';
export type SortOrder = 'asc' | 'desc';

export type ViewType = 'library' | 'playlist' | 'liked' | 'folders';

export interface SpotifyTrack {
  title: string;
  artist: string;
  duration: number;
}

export interface SpotifyPlaylistResult {
  id: string;
  name: string;
  tracks: SpotifyTrack[];
  coverArt?: string | null;
}

export interface DiscordPresenceData {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

export interface TagSuggestion {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number | null;
  coverArt: string | null;
}

export type MediaKeyAction = 'play-pause' | 'next' | 'prev';

export interface TuneAPI {
  getDownloadsPath: () => Promise<string>;
  scanFolder: (folderPath: string) => Promise<Song[]>;
  scanFolderDetailed?: (folderPath: string) => Promise<{ songs: Song[]; rejectedCount: number; rejectedNames: string[] }>;
  startWatching: (folderPath: string) => Promise<boolean>;
  stopWatching: () => Promise<boolean>;
  deleteSongFile: (filePath: string) => Promise<boolean>;
  showInFolder: (filePath: string) => Promise<void>;
  selectFolderDialog: () => Promise<string | null>;
  selectFilesDialog: () => Promise<string[]>;
  parseAudioFile: (filePath: string) => Promise<Song | null>;
  fetchSpotifyPlaylist: (url: string) => Promise<SpotifyPlaylistResult>;
  updateDiscordPresence: (data: DiscordPresenceData) => Promise<void>;
  suggestMetadata: (query: string) => Promise<TagSuggestion[]>;
  toggleMiniPlayer: (enable?: boolean) => Promise<boolean>;
  isMiniPlayer: () => Promise<boolean>;
  onMediaKey: (callback: (action: MediaKeyAction) => void) => () => void;
  onMiniPlayerChanged: (callback: (isMini: boolean) => void) => () => void;
  onFileAdded: (callback: (song: Song) => void) => () => void;
  onFileRemoved: (callback: (filePath: string) => void) => () => void;
}

