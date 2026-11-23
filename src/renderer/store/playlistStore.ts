import { create } from 'zustand';
import { Playlist, Song } from '@/types/music';

interface PlaylistStore {
  playlists: Playlist[];
  likedSongIds: Set<string>;

  // Actions
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylistSongs: (playlistId: string, oldIndex: number, newIndex: number) => void;
  toggleLikeSong: (song: Song) => void;
  isSongLiked: (songId: string) => boolean;
}

const STORAGE_PLAYLISTS_KEY = 'tune_playlists_v1';
const STORAGE_LIKES_KEY = 'tune_liked_songs_v1';

function loadPersistedPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_PLAYLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadPersistedLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_LIKES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: loadPersistedPlaylists(),
  likedSongIds: loadPersistedLikes(),

  createPlaylist: (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Playlist',
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      songIds: []
    };

    set((state) => {
      const updated = [...state.playlists, newPlaylist];
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });

    return newPlaylist;
  },

  deletePlaylist: (id: string) => {
    set((state) => {
      const updated = state.playlists.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });
  },

  renamePlaylist: (id: string, name: string) => {
    set((state) => {
      const updated = state.playlists.map((p) =>
        p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p
      );
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });
  },

  addSongToPlaylist: (playlistId: string, songId: string) => {
    set((state) => {
      const updated = state.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.songIds.includes(songId)) return p;
        return { ...p, songIds: [...p.songIds, songId], updatedAt: Date.now() };
      });
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });
  },

  removeSongFromPlaylist: (playlistId: string, songId: string) => {
    set((state) => {
      const updated = state.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, songIds: p.songIds.filter((id) => id !== songId), updatedAt: Date.now() };
      });
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });
  },

  reorderPlaylistSongs: (playlistId: string, oldIndex: number, newIndex: number) => {
    set((state) => {
      const updated = state.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        const songIds = [...p.songIds];
        const [moved] = songIds.splice(oldIndex, 1);
        songIds.splice(newIndex, 0, moved);
        return { ...p, songIds, updatedAt: Date.now() };
      });
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(updated));
      return { playlists: updated };
    });
  },

  toggleLikeSong: (song: Song) => {
    set((state) => {
      const nextLikes = new Set(state.likedSongIds);
      if (nextLikes.has(song.id)) {
        nextLikes.delete(song.id);
      } else {
        nextLikes.add(song.id);
      }
      localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(Array.from(nextLikes)));
      return { likedSongIds: nextLikes };
    });
  },

  isSongLiked: (songId: string) => {
    return get().likedSongIds.has(songId);
  }
}));
