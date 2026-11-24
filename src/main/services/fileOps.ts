import { shell, dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.m4a',
  '.wav',
  '.flac',
  '.ogg',
  '.aac',
  '.opus',
  '.mp4'
]);

/**
 * Moves an audio file to the OS trash bin with strict path validation
 * to prevent deletion of arbitrary or system files.
 */
export async function deleteFileToTrash(filePath: string): Promise<boolean> {
  try {
    if (!filePath || typeof filePath !== 'string') {
      console.warn('Rejected delete: invalid path argument');
      return false;
    }

    const resolved = path.resolve(filePath.trim());
    const ext = path.extname(resolved).toLowerCase();

    // Security check: Only permit deleting recognized audio files
    if (!ALLOWED_AUDIO_EXTENSIONS.has(ext)) {
      console.warn(`Rejected delete of non-audio file: ${resolved}`);
      return false;
    }

    if (!fs.existsSync(resolved)) {
      console.warn(`Delete target does not exist: ${resolved}`);
      return false;
    }

    await shell.trashItem(resolved);
    return true;
  } catch (err) {
    console.error(`Failed to move ${filePath} to trash:`, err);
    return false;
  }
}

/**
 * Safely displays a verified file in the system file explorer
 */
export async function showFileInFolder(filePath: string): Promise<void> {
  try {
    if (!filePath || typeof filePath !== 'string') return;
    const resolved = path.resolve(filePath.trim());

    if (!fs.existsSync(resolved)) {
      console.warn(`Cannot show file in folder, file does not exist: ${resolved}`);
      return;
    }

    shell.showItemInFolder(resolved);
  } catch (err) {
    console.error(`Failed to show item in folder ${filePath}:`, err);
  }
}

export async function selectFolder(win?: BrowserWindow | null): Promise<string | null> {
  const options: Electron.OpenDialogOptions = {
    title: 'Select Music Folder',
    properties: ['openDirectory']
  };

  const result =
    win && !win.isDestroyed()
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export async function selectAudioFiles(win?: BrowserWindow | null): Promise<string[]> {
  const options: Electron.OpenDialogOptions = {
    title: 'Select Audio Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a', 'mp4', 'ogg', 'aac', 'opus'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  };

  const result =
    win && !win.isDestroyed()
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);

  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }

  return result.filePaths;
}

