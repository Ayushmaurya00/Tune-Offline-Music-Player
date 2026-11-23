import { create } from 'zustand';
import { Song, QueueItem, RepeatMode } from '@/types/music';
import { audioController } from '../audio/audioController';

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isQueueOpen: boolean;
  queue: QueueItem[];
  history: Song[];

  // Actions
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleQueue: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (queueId: string) => void;
  reorderQueue: (oldIndex: number, newIndex: number) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'none',
  isShuffled: false,
  isQueueOpen: false,
  queue: [],
  history: [],

  playSong: (song: Song, newQueue?: Song[]) => {
    const { volume, isMuted } = get();

    if (newQueue) {
      const items: QueueItem[] = newQueue
        .filter((s) => s.id !== song.id)
        .map((s) => ({ queueId: `${s.id}-${Math.random().toString(36).substring(2, 9)}`, song: s }));
      set({ queue: items });
    }

    set({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
      duration: song.duration
    });

    audioController.playSong(
      song,
      isMuted ? 0 : volume,
      () => get().nextTrack(),
      (currentTime) => set({ currentTime })
    );
  },

  togglePlay: () => {
    const { currentSong, isPlaying } = get();
    if (!currentSong) return;

    if (isPlaying) {
      audioController.pause();
      set({ isPlaying: false });
    } else {
      audioController.resume();
      set({ isPlaying: true });
    }
  },

  nextTrack: () => {
    const { queue, repeatMode, currentSong } = get();

    if (repeatMode === 'one' && currentSong) {
      audioController.seek(0);
      set({ currentTime: 0, isPlaying: true });
      audioController.resume();
      return;
    }

    if (queue.length === 0) {
      set({ isPlaying: false, currentTime: 0 });
      audioController.stop();
      return;
    }

    const nextItem = queue[0];
    const remainingQueue = queue.slice(1);

    if (currentSong) {
      set((state) => ({ history: [currentSong, ...state.history.slice(0, 49)] }));
    }

    set({ queue: remainingQueue });
    get().playSong(nextItem.song);
  },

  prevTrack: () => {
    const { currentTime, history, currentSong } = get();

    if (currentTime > 3 || history.length === 0) {
      audioController.seek(0);
      set({ currentTime: 0 });
      return;
    }

    const prevSong = history[0];
    const remainingHistory = history.slice(1);

    if (currentSong) {
      const currentItem: QueueItem = {
        queueId: `${currentSong.id}-${Math.random().toString(36).substring(2, 9)}`,
        song: currentSong
      };
      set((state) => ({ queue: [currentItem, ...state.queue] }));
    }

    set({ history: remainingHistory });
    get().playSong(prevSong);
  },

  seek: (seconds: number) => {
    audioController.seek(seconds);
    set({ currentTime: seconds });
  },

  setVolume: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    audioController.setVolume(clamped);
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      audioController.setVolume(volume > 0 ? volume : 0.8);
      set({ isMuted: false, volume: volume > 0 ? volume : 0.8 });
    } else {
      audioController.setVolume(0);
      set({ isMuted: true });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  toggleShuffle: () => {
    const { isShuffled, queue } = get();
    if (!isShuffled) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      set({ isShuffled: true, queue: shuffled });
    } else {
      set({ isShuffled: false });
    }
  },

  toggleQueue: () => {
    set((state) => ({ isQueueOpen: !state.isQueueOpen }));
  },

  addToQueue: (song: Song) => {
    const newItem: QueueItem = {
      queueId: `${song.id}-${Math.random().toString(36).substring(2, 9)}`,
      song
    };
    set((state) => ({ queue: [...state.queue, newItem] }));
  },

  removeFromQueue: (queueId: string) => {
    set((state) => ({ queue: state.queue.filter((item) => item.queueId !== queueId) }));
  },

  reorderQueue: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const updated = [...state.queue];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return { queue: updated };
    });
  },

  clearQueue: () => {
    set({ queue: [] });
  }
}));
