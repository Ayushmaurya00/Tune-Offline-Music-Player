import { Capacitor } from '@capacitor/core';
import { isElectron } from '../services/platform';

export function resolveMediaUrl(filePath: string): string {
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
    return filePath;
  }

  if (isElectron()) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `tune-media://local/${encodeURI(normalizedPath)}`;
  }

  return Capacitor.convertFileSrc(filePath);
}

