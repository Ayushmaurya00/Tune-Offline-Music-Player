import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseFile } from 'music-metadata';
import { Song } from '@/types/music';

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.mp4', '.m4a', '.wav', '.flac', '.ogg', '.aac', '.opus']);

export async function parseAudioFile(filePath: string): Promise<Song | null> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return null;
    }

    const stats = await fs.promises.stat(filePath);
    const id = crypto.createHash('md5').update(filePath).digest('hex');
    const fileName = path.basename(filePath);

    let title = path.parse(fileName).name;
    let artist = 'Unknown Artist';
    let album = 'Unknown Album';
    let duration = 0;
    let coverArt: string | null = null;
    let genre: string | undefined;
    let year: number | null = null;

    try {
      const metadata = await parseFile(filePath, { duration: true, skipCovers: false });
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) artist = metadata.common.artist;
      if (metadata.common.album) album = metadata.common.album;
      if (metadata.common.genre && metadata.common.genre.length > 0) genre = metadata.common.genre[0];
      if (metadata.common.year) year = metadata.common.year;
      if (metadata.format.duration) duration = Math.round(metadata.format.duration);

      const picture = metadata.common.picture?.[0];
      if (picture) {
        const base64 = Buffer.from(picture.data).toString('base64');
        coverArt = `data:${picture.format};base64,${base64}`;
      }
    } catch {
      // Fallback to filename if metadata parse fails
    }

    return {
      id,
      filePath,
      fileName,
      title,
      artist,
      album,
      genre,
      year,
      duration,
      format: ext.replace('.', ''),
      fileSize: stats.size,
      dateAdded: Date.now(),
      fileModified: stats.mtimeMs,
      coverArt,
      playCount: 0
    };
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err);
    return null;
  }
}

export async function scanDirectory(dirPath: string): Promise<Song[]> {
  const songs: Song[] = [];

  async function walk(currentDir: string) {
    try {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            const song = await parseAudioFile(fullPath);
            if (song) {
              songs.push(song);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Could not read dir ${currentDir}:`, err);
    }
  }

  await walk(dirPath);
  return songs;
}
