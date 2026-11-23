import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import path from 'node:path';
import url, { fileURLToPath } from 'node:url';
import { scanDirectory, scanDirectoryDetailed, parseAudioFile } from './services/scanner';
import { setupFolderWatcher, stopFolderWatcher } from './services/watcher';
import { deleteFileToTrash, showFileInFolder, selectFolder, selectAudioFiles } from './services/fileOps';
import { fetchSpotifyPlaylistTracks } from './services/spotifyService';
import { initDiscordRPC, setDiscordPresence, clearDiscordPresence } from './services/discordService';
import { fetchSuggestedMetadata } from './services/autoTagger';
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './services/shortcuts';
import { setupSystemTray, destroySystemTray } from './services/tray';
import { setMiniPlayerMode, isMiniPlayer } from './services/miniPlayer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null = null;

// Register custom protocol for streaming local audio securely
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'tune-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true
    }
  }
]);

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#0a0a0a',
      symbolColor: '#b3b3b3',
      height: 36
    } : false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Handle local audio file streaming through tune-media://
  protocol.handle('tune-media', (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let filePath = decodeURIComponent(parsedUrl.pathname);

      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }

      return net.fetch(url.pathToFileURL(filePath).toString());
    } catch (err) {
      console.error('tune-media protocol error:', err);
      return new Response('File not found', { status: 404 });
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'));
  }

  registerGlobalShortcuts(() => win);
  setupSystemTray(
    () => win,
    () => {
      if (win) setMiniPlayerMode(win);
    }
  );
}

// IPC Handlers
ipcMain.handle('tune:get-downloads-path', () => {
  return app.getPath('downloads');
});

ipcMain.handle('tune:scan-folder', async (_, folderPath: string) => {
  return await scanDirectory(folderPath);
});

ipcMain.handle('tune:scan-folder-detailed', async (_, folderPath: string) => {
  return await scanDirectoryDetailed(folderPath);
});

ipcMain.handle('tune:start-watching', async (_, folderPath: string) => {
  if (!win) return false;
  return setupFolderWatcher(folderPath, win);
});

ipcMain.handle('tune:stop-watching', async () => {
  return stopFolderWatcher();
});

ipcMain.handle('tune:delete-song-file', async (_, filePath: string) => {
  return await deleteFileToTrash(filePath);
});

ipcMain.handle('tune:show-in-folder', async (_, filePath: string) => {
  await showFileInFolder(filePath);
});

ipcMain.handle('tune:select-folder-dialog', async () => {
  return await selectFolder(win);
});

ipcMain.handle('tune:select-files-dialog', async () => {
  return await selectAudioFiles(win);
});

ipcMain.handle('tune:parse-audio-file', async (_, filePath: string) => {
  return await parseAudioFile(filePath);
});

ipcMain.handle('tune:fetch-spotify-playlist', async (_, url: string) => {
  return await fetchSpotifyPlaylistTracks(url);
});

ipcMain.handle('tune:update-discord-presence', (_, data) => {
  setDiscordPresence(data);
});

ipcMain.handle('tune:suggest-metadata', async (_, query: string) => {
  return await fetchSuggestedMetadata(query);
});

ipcMain.handle('tune:toggle-mini-player', (_, enable?: boolean) => {
  if (!win) return false;
  return setMiniPlayerMode(win, enable);
});

ipcMain.handle('tune:is-mini-player', () => {
  return isMiniPlayer();
});

app.on('window-all-closed', () => {
  unregisterGlobalShortcuts();
  destroySystemTray();
  clearDiscordPresence();
  stopFolderWatcher();
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  initDiscordRPC();
  createWindow();
});
