import { Howl } from 'howler';
import { Song } from '@/types/music';
import { eqService } from './eqService';

class AudioController {
  private howl: Howl | null = null;
  private onTimeUpdateCallback?: (currentTime: number) => void;
  private onEndCallback?: () => void;
  private timerId: number | null = null;
  private playbackRate: number = 1.0;

  public playSong(
    song: Song,
    volume: number,
    onEnd: () => void,
    onTimeUpdate: (currentTime: number) => void
  ) {
    this.onEndCallback = onEnd;
    this.onTimeUpdateCallback = onTimeUpdate;

    const normalizedPath = song.filePath.replace(/\\/g, '/');
    const mediaUrl = `tune-media://local/${encodeURI(normalizedPath)}`;

    const { crossfadeDuration } = eqService.getSettings();
    const shouldCrossfade = crossfadeDuration > 0 && this.howl && this.howl.playing();
    const fadeMs = Math.min(5000, crossfadeDuration * 1000);

    // Fade out previous track smoothly if crossfade is enabled
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
        oldHowl.stop();
        oldHowl.unload();
      }
    }

    const initialVolume = shouldCrossfade ? 0 : volume;

    this.howl = new Howl({
      src: [mediaUrl],
      html5: true,
      volume: initialVolume,
      rate: this.playbackRate,
      onend: () => {
        this.stopTimer();
        if (this.onEndCallback) this.onEndCallback();
      },
      onplay: () => {
        this.startTimer();
        eqService.init();

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
  }

  public pause() {
    this.howl?.pause();
    this.stopTimer();
  }

  public resume() {
    this.howl?.play();
    this.startTimer();
  }

  public stop() {
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
      if (this.howl && this.howl.playing() && this.onTimeUpdateCallback) {
        const seek = this.howl.seek();
        if (typeof seek === 'number') {
          this.onTimeUpdateCallback(seek);
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
