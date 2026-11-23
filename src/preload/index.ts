import { contextBridge, ipcRenderer } from 'electron';
import { Song, TuneAPI } from '../types/music';

const api: TuneAPI = {
  getDownloadsPath: () => ipcRenderer.invoke('tune:get-downloads-path'),
  scanFolder: (folderPath: string) => ipcRenderer.invoke('tune:scan-folder', folderPath),
  startWatching: (folderPath: string) => ipcRenderer.invoke('tune:start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('tune:stop-watching'),
  deleteSongFile: (filePath: string) => ipcRenderer.invoke('tune:delete-song-file', filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke('tune:show-in-folder', filePath),
  selectFolderDialog: () => ipcRenderer.invoke('tune:select-folder-dialog'),
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

