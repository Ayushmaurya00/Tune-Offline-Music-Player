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

export async function selectFolder(win: BrowserWindow): Promise<string | null> {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}
