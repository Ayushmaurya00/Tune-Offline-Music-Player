import { contextBridge, ipcRenderer } from 'electron';
import { Song, TuneAPI, MediaKeyAction } from '../types/music';

const api: TuneAPI = {
  getDownloadsPath: () => ipcRenderer.invoke('tune:get-downloads-path'),
  scanFolder: (folderPath: string) => ipcRenderer.invoke('tune:scan-folder', folderPath),
  startWatching: (folderPath: string) => ipcRenderer.invoke('tune:start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('tune:stop-watching'),
  deleteSongFile: (filePath: string) => ipcRenderer.invoke('tune:delete-song-file', filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke('tune:show-in-folder', filePath),
  selectFolderDialog: () => ipcRenderer.invoke('tune:select-folder-dialog'),
  selectFilesDialog: () => ipcRenderer.invoke('tune:select-files-dialog'),
  parseAudioFile: (filePath: string) => ipcRenderer.invoke('tune:parse-audio-file', filePath),
  fetchSpotifyPlaylist: (url: string) => ipcRenderer.invoke('tune:fetch-spotify-playlist', url),
  updateDiscordPresence: (data: unknown) => ipcRenderer.invoke('tune:update-discord-presence', data),
  suggestMetadata: (query: string) => ipcRenderer.invoke('tune:suggest-metadata', query),
  toggleMiniPlayer: (enable?: boolean) => ipcRenderer.invoke('tune:toggle-mini-player', enable),
  isMiniPlayer: () => ipcRenderer.invoke('tune:is-mini-player'),
  onMediaKey: (callback: (action: MediaKeyAction) => void) => {
    const handler = (_: unknown, action: MediaKeyAction) => callback(action);
    ipcRenderer.on('tune:media-key', handler);
    return () => ipcRenderer.removeListener('tune:media-key', handler);
  },
  onMiniPlayerChanged: (callback: (isMini: boolean) => void) => {
    const handler = (_: unknown, isMini: boolean) => callback(isMini);
    ipcRenderer.on('tune:mini-player-changed', handler);
    return () => ipcRenderer.removeListener('tune:mini-player-changed', handler);
  },
  onFileAdded: (callback: (song: Song) => void) => {
    const handler = (_: unknown, song: Song) => callback(song);
    ipcRenderer.on('tune:file-added', handler);
    return () => ipcRenderer.removeListener('tune:file-added', handler);
  },
  onFileRemoved: (callback: (filePath: string) => void) => {
    const handler = (_: unknown, filePath: string) => callback(filePath);
    ipcRenderer.on('tune:file-removed', handler);
    return () => ipcRenderer.removeListener('tune:file-removed', handler);
  }
};

contextBridge.exposeInMainWorld('tuneAPI', api);

