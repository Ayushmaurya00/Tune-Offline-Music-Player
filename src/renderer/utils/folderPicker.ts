import { Song } from '@/types/music';
import { coverArtService } from '../services/coverArtService';
import { parseFileID3 } from './id3Extractor';
import { isElectron } from '../services/platform';
import { useLibraryStore } from '../store/libraryStore';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac', '.opus'];

export function getAudioFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.preload = 'metadata';
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.removeAttribute('src');
      audio.load();
    };
    audio.onloadedmetadata = () => {
      const d = Math.round(audio.duration);
      cleanup();
      resolve(Number.isFinite(d) && d > 0 ? d : 0);
    };
    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
    audio.src = objectUrl;
  });
}

export interface PickFolderResult {
  folderPath: string;
  songs: Song[];
  rejectedCount?: number;
  rejectedNames?: string[];
}

export async function pickFolder(): Promise<PickFolderResult | null> {
  if (isElectron()) {
    const folderPath = await window.tuneAPI.selectFolderDialog();
    if (!folderPath) return null;
    if (window.tuneAPI.scanFolderDetailed) {
      const detail = await window.tuneAPI.scanFolderDetailed(folderPath);
      return {
        folderPath,
        songs: detail.songs,
        rejectedCount: detail.rejectedCount,
        rejectedNames: detail.rejectedNames
      };
    }
    const songs = await window.tuneAPI.scanFolder(folderPath);
    return { folderPath, songs, rejectedCount: 0, rejectedNames: [] };
  }

  // Web / Mobile HTML5 Folder Picker
  return pickWebFiles(true);
}

export async function pickAudioFiles(): Promise<PickFolderResult | null> {
  if (isElectron()) {
    const filePaths = await window.tuneAPI.selectFilesDialog();
    if (!filePaths || filePaths.length === 0) return null;

    const songs: Song[] = [];
    const rejectedNames: string[] = [];
    for (const filePath of filePaths) {
      const song = await window.tuneAPI.parseAudioFile(filePath);
      if (song) {
        songs.push(song);
      } else {
        rejectedNames.push(filePath.split(/[\\/]/).pop() || filePath);
      }
    }

    const parentDir = filePaths[0].replace(/\\/g, '/').split('/').slice(0, -1).join('/') || 'Selected Files';
    return { folderPath: parentDir, songs, rejectedCount: rejectedNames.length, rejectedNames };
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
  const rejectedNames: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lower = file.name.toLowerCase();
    const isAudio = AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!isAudio) {
      rejectedNames.push(file.name);
      continue;
    }

    const { cleanTitle, cleanArtist } = coverArtService.cleanTrackQuery(file.name);
    const url = URL.createObjectURL(file);

    const songItem: Song = {
      id: `file-${file.name}-${file.size}-${file.lastModified}`,
      filePath: url,
      fileName: file.name,
      title: cleanTitle || file.name.replace(/\.[^/.]+$/, ''),
      artist: cleanArtist || 'Offline Artist',
      album: folderName,
      duration: 0,
      format: file.name.split('.').pop() || 'mp3',
      fileSize: file.size,
      dateAdded: Date.now(),
      fileModified: file.lastModified,
      playCount: 0,
      coverArt: null
    };

    // Asynchronously resolve true audio duration
    getAudioFileDuration(file).then((realDuration) => {
      if (realDuration > 0) {
        songItem.duration = realDuration;
        useLibraryStore.getState().updateSong(songItem.id, { duration: realDuration });
      }
    });

    // Asynchronously extract embedded ID3 picture if available
    parseFileID3(file).then((id3) => {
      if (id3.coverArt) {
        songItem.coverArt = id3.coverArt;
      }
    });

    songs.push(songItem);
  }

  return {
    folderPath: folderName,
    songs,
    rejectedCount: rejectedNames.length,
    rejectedNames
  };
}
