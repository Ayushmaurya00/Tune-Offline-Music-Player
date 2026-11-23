import { Song } from '@/types/music';
import { isElectron } from '../services/platform';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac', '.opus'];

export interface PickFolderResult {
  folderPath: string;
  songs: Song[];
}

export async function pickFolderOrFiles(): Promise<PickFolderResult | null> {
  // If in Electron, use native dialog and scanner
  if (isElectron()) {
    const folderPath = await window.tuneAPI.selectFolderDialog();
    if (!folderPath) return null;
    const songs = await window.tuneAPI.scanFolder(folderPath);
    return { folderPath, songs };
  }

  // Web / Mobile: Use HTML5 File Picker
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.accept = 'audio/*,' + AUDIO_EXTENSIONS.join(',');

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) {
        resolve(null);
        return;
      }

      const folderName =
        files[0].webkitRelativePath?.split('/')[0] || 'Selected Music';

      const songs: Song[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const lower = file.name.toLowerCase();
        const isAudio = AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));

        if (!isAudio) continue;

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/^[0-9]+[\s._-]+/, '');

        const url = URL.createObjectURL(file);

        songs.push({
          id: `web-${file.name}-${file.size}-${file.lastModified}`,
          filePath: url,
          fileName: file.name,
          title: cleanTitle,
          artist: 'Local Audio',
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

      resolve({ folderPath: folderName, songs });
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}
