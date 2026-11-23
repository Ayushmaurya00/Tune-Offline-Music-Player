import { Song } from '@/types/music';

interface MediaSessionCallbacks {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  seekForward: (offset: number) => void;
  seekBackward: (offset: number) => void;
}

class MediaSessionService {
  private isSupported = typeof window !== 'undefined' && 'mediaSession' in navigator;
  private callbacks: MediaSessionCallbacks | null = null;

  public init(callbacks: MediaSessionCallbacks) {
    if (!this.isSupported) return;
    this.callbacks = callbacks;

    const ms = navigator.mediaSession;

    try {
      ms.setActionHandler('play', () => this.callbacks?.play());
      ms.setActionHandler('pause', () => this.callbacks?.pause());
      ms.setActionHandler('nexttrack', () => this.callbacks?.next());
      ms.setActionHandler('previoustrack', () => this.callbacks?.prev());
      ms.setActionHandler('seekforward', (details) => {
        this.callbacks?.seekForward(details.seekOffset || 10);
      });
      ms.setActionHandler('seekbackward', (details) => {
        this.callbacks?.seekBackward(details.seekOffset || 10);
      });
      ms.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          this.callbacks?.seek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('Could not register media session action handlers:', err);
    }
  }

  public updateMetadata(song: Song | null, isPlaying: boolean) {
    if (!this.isSupported) return;

    if (!song) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    const artwork: MediaImage[] = [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ];

    if (song.coverArt) {
      artwork.unshift({
        src: song.coverArt,
        sizes: '512x512',
        type: 'image/jpeg'
      });
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || 'Tune Music',
        artwork
      });
    } catch (err) {
      console.warn('Could not set media session metadata:', err);
    }
  }

  public updatePositionState(duration: number, currentTime: number, playbackRate = 1.0) {
    if (!this.isSupported) return;
    if (!navigator.mediaSession.setPositionState || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: Math.max(0.5, playbackRate),
        position: Math.max(0, Math.min(currentTime, duration))
      });
    } catch {
      // Ignore timing boundary exceptions
    }
  }
}

export const mediaSessionService = new MediaSessionService();
