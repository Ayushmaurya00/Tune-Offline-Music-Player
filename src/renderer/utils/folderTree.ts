import { Song } from '@/types/music';

export interface FolderNode {
  name: string;
  fullPath: string;
  subfolders: FolderNode[];
  songs: Song[];
  totalSongsCount: number;
}

export function buildFolderTree(songs: Song[], rootPath: string): FolderNode {
  const normalizedRoot = (rootPath || '').replace(/\\/g, '/').replace(/\/+$/, '');
  const rootNode: FolderNode = {
    name: normalizedRoot.split('/').pop() || 'Downloads',
    fullPath: normalizedRoot,
    subfolders: [],
    songs: [],
    totalSongsCount: 0
  };

  // Map of fullPath -> FolderNode
  const nodeMap = new Map<string, FolderNode>();
  nodeMap.set(normalizedRoot, rootNode);

  function getOrCreateNode(dirPath: string): FolderNode {
    const norm = dirPath.replace(/\\/g, '/').replace(/\/+$/, '');
    if (nodeMap.has(norm)) return nodeMap.get(norm)!;

    const parentDir = norm.substring(0, norm.lastIndexOf('/'));
    const parentNode = norm !== normalizedRoot && parentDir.startsWith(normalizedRoot)
      ? getOrCreateNode(parentDir)
      : rootNode;

    const folderName = norm.split('/').pop() || 'Folder';
    const newNode: FolderNode = {
      name: folderName,
      fullPath: norm,
      subfolders: [],
      songs: [],
      totalSongsCount: 0
    };

    parentNode.subfolders.push(newNode);
    nodeMap.set(norm, newNode);
    return newNode;
  }

  for (const song of songs) {
    const normSongPath = song.filePath.replace(/\\/g, '/');
    const songDir = normSongPath.substring(0, normSongPath.lastIndexOf('/'));

    let targetNode = rootNode;
    if (songDir.startsWith(normalizedRoot) && songDir !== normalizedRoot) {
      targetNode = getOrCreateNode(songDir);
    }

    targetNode.songs.push(song);
  }

  // Calculate total songs recursively
  function calculateTotals(node: FolderNode): number {
    let count = node.songs.length;
    for (const sub of node.subfolders) {
      count += calculateTotals(sub);
    }
    node.totalSongsCount = count;
    // Sort subfolders alphabetically
    node.subfolders.sort((a, b) => a.name.localeCompare(b.name));
    return count;
  }

  calculateTotals(rootNode);
  return rootNode;
}

