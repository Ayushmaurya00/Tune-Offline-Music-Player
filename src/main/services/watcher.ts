import chokidar, { FSWatcher } from 'chokidar';
import { BrowserWindow } from 'electron';
import { parseAudioFile } from './scanner';

let watcherInstance: FSWatcher | null = null;

export function setupFolderWatcher(folderPath: string, win: BrowserWindow): boolean {
  if (watcherInstance) {
    watcherInstance.close();
    watcherInstance = null;
  }

  try {
    watcherInstance = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      depth: 3,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1500,
        pollInterval: 100
      }
    });

    watcherInstance.on('add', async (filePath: string) => {
      const song = await parseAudioFile(filePath);
      if (song && !win.isDestroyed()) {
        win.webContents.send('tune:file-added', song);
      }
    });

    watcherInstance.on('unlink', (filePath: string) => {
      if (!win.isDestroyed()) {
        win.webContents.send('tune:file-removed', filePath);
      }
    });

    return true;
  } catch (err) {
    console.error('Failed to setup file watcher:', err);
    return false;
  }
}

export function stopFolderWatcher(): boolean {
  if (watcherInstance) {
    watcherInstance.close();
    watcherInstance = null;
    return true;
  }
  return false;
}

