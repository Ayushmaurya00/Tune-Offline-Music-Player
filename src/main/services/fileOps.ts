import { shell, dialog, BrowserWindow } from 'electron';

export async function deleteFileToTrash(filePath: string): Promise<boolean> {
  try {
    await shell.trashItem(filePath);
    return true;
  } catch (err) {
    console.error(`Failed to move ${filePath} to trash:`, err);
    return false;
  }
}

export async function showFileInFolder(filePath: string): Promise<void> {
  try {
    shell.showItemInFolder(filePath);
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

