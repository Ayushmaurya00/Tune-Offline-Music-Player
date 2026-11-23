import { Song } from '@/types/music';
import { isElectron } from '../services/platform';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac', '.opus'];

export interface PickFolderResult {
  folderPath: string;
  songs: Song[];
}

export async function pickFolder(): Promise<PickFolderResult | null> {
  if (isElectron()) {
    const folderPath = await window.tuneAPI.selectFolderDialog();
    if (!folderPath) return null;
    const songs = await window.tuneAPI.scanFolder(folderPath);
    return { folderPath, songs };
  }

  // Web / Mobile HTML5 Folder Picker
  return pickWebFiles(true);
}

export async function pickAudioFiles(): Promise<PickFolderResult | null> {
  if (isElectron()) {
    const filePaths = await window.tuneAPI.selectFilesDialog();
    if (!filePaths || filePaths.length === 0) return null;

    const songs: Song[] = [];
    for (const filePath of filePaths) {
      const song = await window.tuneAPI.parseAudioFile(filePath);
      if (song) songs.push(song);
    }

    const parentDir = filePaths[0].replace(/\\/g, '/').split('/').slice(0, -1).join('/') || 'Selected Files';
    return { folderPath: parentDir, songs };
  }

  // Web / Mobile HTML5 File Picker
  return pickWebFiles(false);
}

function pickWebFiles(isFolder: boolean): Promise<PickFolderResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    if (isFolder) {
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
    }
    input.accept = 'audio/*,' + AUDIO_EXTENSIONS.join(',');

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) {
        resolve(null);
        return;
      }
      resolve(convertFileListToSongs(files));
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

export function convertFileListToSongs(files: File[]): PickFolderResult {
  const folderName = files[0].webkitRelativePath?.split('/')[0] || 'Selected Music';
  const songs: Song[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lower = file.name.toLowerCase();
    const isAudio = AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!isAudio) continue;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[\s._-]+/, '');
    const url = URL.createObjectURL(file);

    songs.push({
      id: `file-${file.name}-${file.size}-${file.lastModified}`,
      filePath: url,
      fileName: file.name,
      title: cleanTitle,
      artist: 'Local Artist',
      album: folderName,
      duration: 180,
      format: file.name.split('.').pop() || 'mp3',
      fileSize: file.size,
      dateAdded: Date.now(),
      fileModified: file.lastModified,
      playCount: 0,
      coverArt: null
    });
  }

  return { folderPath: folderName, songs };
}
