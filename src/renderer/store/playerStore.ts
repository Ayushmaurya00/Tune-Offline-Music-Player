import { create } from 'zustand';
import { Song, QueueItem, RepeatMode } from '@/types/music';
import { useLibraryStore } from './libraryStore';
import { audioController } from '../audio/audioController';
import { sleepTimerService } from '../audio/sleepTimerService';
import { mediaSessionService } from '../services/mediaSession';

function syncDiscordRPC(song: Song | null, isPlaying: boolean, currentTime: number) {
  if (window.tuneAPI) {
    if (!song || !isPlaying) {
      window.tuneAPI.updateDiscordPresence({
        title: '',
        artist: '',
        duration: 0,
        currentTime: 0,
        isPlaying: false
      });
      return;
    }

    window.tuneAPI.updateDiscordPresence({
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      currentTime,
      isPlaying: true
    });
  }
}

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isQueueOpen: boolean;
  queue: QueueItem[];
  history: Song[];
  activeContextSongs: Song[];

  // Actions
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  seekForward: (offset?: number) => void;
  seekBackward: (offset?: number) => void;
  setVolume: (val: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleQueue: () => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (queueId: string) => void;
  reorderQueue: (oldIndex: number, newIndex: number) => void;
  clearQueue: () => void;
}

const savedVol = typeof localStorage !== 'undefined' ? localStorage.getItem('tune_volume_v1') : null;
const initialVolume = savedVol !== null && !isNaN(parseFloat(savedVol)) ? parseFloat(savedVol) : 0.8;
const savedMuted = typeof localStorage !== 'undefined' ? localStorage.getItem('tune_muted_v1') === 'true' : false;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: initialVolume,
  playbackRate: 1.0,
  isMuted: savedMuted,
  repeatMode: 'none',
  isShuffled: false,
  isQueueOpen: false,
  queue: [],
  history: [],
  activeContextSongs: [],

  playSong: (song: Song, newQueue?: Song[]) => {
    const { volume, isMuted } = get();

    if (newQueue) {
      const items: QueueItem[] = newQueue
        .filter((s) => s.id !== song.id)
        .map((s) => ({ queueId: `${s.id}-${Math.random().toString(36).substring(2, 9)}`, song: s }));
      set({ queue: items, activeContextSongs: newQueue });
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
      () => {
        const timerState = sleepTimerService.getState();
        if (timerState.isActive && timerState.isEndOfTrack) {
          sleepTimerService.onTrackEnded();
          set({ isPlaying: false });
          return;
        }
        get().nextTrack();
      },
      (currentTime) => {
        set({ currentTime });
        mediaSessionService.updatePositionState(get().duration || song.duration, currentTime, get().playbackRate);
      },
      (actualDuration) => {
        if (actualDuration > 0 && get().duration !== actualDuration) {
          set({ duration: actualDuration });
          const current = get().currentSong;
          if (current && current.id === song.id && current.duration !== actualDuration) {
            set({ currentSong: { ...current, duration: actualDuration } });
          }
          useLibraryStore.getState().updateSong(song.id, { duration: actualDuration });
          mediaSessionService.updatePositionState(actualDuration, get().currentTime, get().playbackRate);
        }
      }
    );

    syncDiscordRPC(song, true, 0);
    mediaSessionService.updateMetadata(song, true);
  },

  togglePlay: () => {
    const { currentSong, isPlaying, currentTime } = get();
    if (!currentSong) return;

    if (isPlaying) {
      audioController.pause();
      set({ isPlaying: false });
      syncDiscordRPC(currentSong, false, currentTime);
      mediaSessionService.updateMetadata(currentSong, false);
    } else {
      audioController.resume();
      set({ isPlaying: true });
      syncDiscordRPC(currentSong, true, currentTime);
      mediaSessionService.updateMetadata(currentSong, true);
    }
  },

  nextTrack: () => {
    const { queue, repeatMode, currentSong, activeContextSongs } = get();

    if (repeatMode === 'one' && currentSong) {
      get().playSong(currentSong);
      return;
    }

    if (queue.length === 0) {
      if (repeatMode === 'all' && activeContextSongs.length > 0) {
        const first = activeContextSongs[0];
        const rest = activeContextSongs.filter((s) => s.id !== first.id);
        const newItems: QueueItem[] = rest.map((s) => ({
          queueId: `${s.id}-${Math.random().toString(36).substring(2, 9)}`,
          song: s
        }));
        set({ queue: newItems });
        get().playSong(first);
        return;
      }

      set({ isPlaying: false, currentTime: 0 });
      audioController.stop();
      syncDiscordRPC(null, false, 0);
      mediaSessionService.updateMetadata(null, false);
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
    const clamped = Math.max(0, Math.min(get().duration || 0, seconds));
    audioController.seek(clamped);
    set({ currentTime: clamped });
    mediaSessionService.updatePositionState(get().duration, clamped, get().playbackRate);
  },

  seekForward: (offset = 10) => {
    const { currentTime, duration } = get();
    get().seek(Math.min(duration || 0, currentTime + offset));
  },

  seekBackward: (offset = 10) => {
    const { currentTime } = get();
    get().seek(Math.max(0, currentTime - offset));
  },

  setVolume: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('tune_volume_v1', String(clamped));
    } catch {
      // ignore
    }
    audioController.setVolume(clamped);
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  setPlaybackRate: (rate: number) => {
    audioController.setRate(rate);
    set({ playbackRate: rate });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const nextMuted = !isMuted;
    try {
      localStorage.setItem('tune_muted_v1', String(nextMuted));
    } catch {
      // ignore
    }
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

  playNext: (song: Song) => {
    const newItem: QueueItem = {
      queueId: `${song.id}-${Math.random().toString(36).substring(2, 9)}`,
      song
    };
    set((state) => ({ queue: [newItem, ...state.queue] }));
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
