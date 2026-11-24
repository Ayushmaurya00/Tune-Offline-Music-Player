import { Howl } from 'howler';
import { Song } from '@/types/music';
import { eqService } from './eqService';
import { resolveMediaUrl } from '../utils/mediaUrl';

class AudioController {
  private howl: Howl | null = null;
  private onTimeUpdateCallback?: (currentTime: number) => void;
  private onEndCallback?: () => void;
  private onDurationLoadCallback?: (duration: number) => void;
  private timerId: number | null = null;
  private playbackRate: number = 1.0;
  private pendingPlayTimeout: ReturnType<typeof setTimeout> | null = null;

  public playSong(
    song: Song,
    volume: number,
    onEnd: () => void,
    onTimeUpdate: (currentTime: number) => void,
    onDurationLoad?: (duration: number) => void
  ) {
    if (this.pendingPlayTimeout) {
      clearTimeout(this.pendingPlayTimeout);
      this.pendingPlayTimeout = null;
    }

    this.onEndCallback = onEnd;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onDurationLoadCallback = onDurationLoad;

    const mediaUrl = resolveMediaUrl(song.filePath);

    const { crossfadeDuration, songChangeDelayMs } = eqService.getSettings();
    const shouldCrossfade = crossfadeDuration > 0 && this.howl && this.howl.playing();
    const fadeMs = Math.min(5000, crossfadeDuration * 1000);

    // Fade out / stop previous track smoothly
    if (this.howl) {
      const oldHowl = this.howl;
      this.stopTimer();

      if (shouldCrossfade) {
        try {
          oldHowl.fade(oldHowl.volume(), 0, fadeMs);
          setTimeout(() => {
            oldHowl.stop();
            oldHowl.unload();
          }, fadeMs + 100);
        } catch {
          oldHowl.stop();
          oldHowl.unload();
        }
      } else {
        try {
          oldHowl.fade(oldHowl.volume(), 0, 40);
          setTimeout(() => {
            oldHowl.stop();
            oldHowl.unload();
          }, 50);
        } catch {
          oldHowl.stop();
          oldHowl.unload();
        }
      }
      this.howl = null;
    }

    const startPlayback = () => {
      const initialVolume = shouldCrossfade ? 0 : volume;

      this.howl = new Howl({
        src: [mediaUrl],
        html5: true,
        volume: initialVolume,
        rate: this.playbackRate,
        onload: () => {
          const actualDuration = Math.round(this.howl?.duration() || 0);
          if (actualDuration > 0 && this.onDurationLoadCallback) {
            this.onDurationLoadCallback(actualDuration);
          }
        },
        onend: () => {
          this.stopTimer();
          if (this.onEndCallback) this.onEndCallback();
        },
        onplay: () => {
          this.startTimer();
          eqService.init();

          // Sync real duration on play in case onload already completed
          const actualDuration = Math.round(this.howl?.duration() || 0);
          if (actualDuration > 0 && this.onDurationLoadCallback) {
            this.onDurationLoadCallback(actualDuration);
          }

          // Fade in new track
          if (shouldCrossfade && this.howl) {
            this.howl.fade(0, volume, fadeMs);
          }
        },
        onpause: () => {
          this.stopTimer();
        },
        onstop: () => {
          this.stopTimer();
        },
        onloaderror: (_id, err) => {
          console.error('Audio load error:', err, 'on URL:', mediaUrl);
        },
        onplayerror: (_id, err) => {
          console.error('Audio play error:', err);
          this.howl?.once('unlock', () => {
            this.howl?.play();
          });
        }
      });

      this.howl.play();
    };

    const delayMs = songChangeDelayMs ?? 250;
    if (delayMs > 0) {
      this.pendingPlayTimeout = setTimeout(() => {
        this.pendingPlayTimeout = null;
        startPlayback();
      }, delayMs);
    } else {
      startPlayback();
    }
  }

  public pause() {
    if (this.pendingPlayTimeout) {
      clearTimeout(this.pendingPlayTimeout);
      this.pendingPlayTimeout = null;
    }
    this.howl?.pause();
    this.stopTimer();
  }

  public resume() {
    this.howl?.play();
    this.startTimer();
  }

  public stop() {
    if (this.pendingPlayTimeout) {
      clearTimeout(this.pendingPlayTimeout);
      this.pendingPlayTimeout = null;
    }
    this.stopTimer();
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
  }

  public seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds);
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(seconds);
      }
    }
  }

  public setVolume(volume: number) {
    if (this.howl) {
      this.howl.volume(volume);
    }
  }

  public setRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.howl) {
      this.howl.rate(this.playbackRate);
    }
  }

  public getRate(): number {
    return this.playbackRate;
  }

  public getSeek(): number {
    if (this.howl && typeof this.howl.seek() === 'number') {
      return this.howl.seek() as number;
    }
    return 0;
  }

  private startTimer() {
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.howl && this.howl.playing()) {
        const seek = this.howl.seek();
        if (typeof seek === 'number' && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(seek);
        }
        const dur = Math.round(this.howl.duration() || 0);
        if (dur > 0 && this.onDurationLoadCallback) {
          this.onDurationLoadCallback(dur);
        }
      }
    }, 250);
  }

  private stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const audioController = new AudioController();
