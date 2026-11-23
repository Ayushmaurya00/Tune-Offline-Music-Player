import { create } from 'zustand';
import { Song, SortField, SortOrder, ViewType } from '@/types/music';

interface LibraryStore {
  songs: Song[];
  watchedFolderPath: string;
  isLoading: boolean;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  activeView: ViewType;
  selectedPlaylistId: string | null;

  // Actions
  setSongs: (songs: Song[]) => void;
  addSong: (song: Song) => void;
  updateSong: (songId: string, updatedFields: Partial<Song>) => void;
  removeSong: (filePath: string) => void;
  setWatchedFolder: (folderPath: string) => void;
  setIsLoading: (val: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  setActiveView: (view: ViewType, playlistId?: string | null) => void;
  getFilteredAndSortedSongs: () => Song[];
}

const savedFolder = typeof localStorage !== 'undefined' ? localStorage.getItem('tune_watched_folder_v1') || '' : '';
const savedSortField = (typeof localStorage !== 'undefined' ? localStorage.getItem('tune_sort_field_v1') : null) as SortField || 'fileModified';
const savedSortOrder = (typeof localStorage !== 'undefined' ? localStorage.getItem('tune_sort_order_v1') : null) as SortOrder || 'desc';

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  songs: [],
  watchedFolderPath: savedFolder,
  isLoading: false,
  searchQuery: '',
  sortField: savedSortField,
  sortOrder: savedSortOrder,
  activeView: 'library',
  selectedPlaylistId: null,

  setSongs: (songs: Song[]) => set({ songs }),

  addSong: (song: Song) => {
    set((state) => {
      const exists = state.songs.some((s) => s.id === song.id || s.filePath === song.filePath);
      if (exists) return state;
      return { songs: [song, ...state.songs] };
    });
  },

  updateSong: (songId: string, updatedFields: Partial<Song>) => {
    set((state) => ({
      songs: state.songs.map((s) => (s.id === songId ? { ...s, ...updatedFields } : s))
    }));
  },

  removeSong: (filePath: string) => {
    set((state) => ({ songs: state.songs.filter((s) => s.filePath !== filePath) }));
  },

  setWatchedFolder: (watchedFolderPath: string) => {
    try {
      localStorage.setItem('tune_watched_folder_v1', watchedFolderPath);
    } catch {
      // ignore
    }
    set({ watchedFolderPath });
  },

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setSort: (field: SortField, order?: SortOrder) => {
    const { sortField, sortOrder } = get();
    if (!order) {
      if (sortField === field) {
        order = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        order = field === 'fileModified' || field === 'dateAdded' ? 'desc' : 'asc';
      }
    }
    try {
      localStorage.setItem('tune_sort_field_v1', field);
      localStorage.setItem('tune_sort_order_v1', order);
    } catch {
      // ignore
    }
    set({ sortField: field, sortOrder: order });
  },

  setActiveView: (activeView: ViewType, selectedPlaylistId = null) => {
    set({ activeView, selectedPlaylistId });
  },

  getFilteredAndSortedSongs: () => {
    const { songs, searchQuery, sortField, sortOrder } = get();

    let list = songs;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.fileName.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? comp : -comp;
      }

      valA = (valA ?? 0) as number;
      valB = (valB ?? 0) as number;
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }
}));
