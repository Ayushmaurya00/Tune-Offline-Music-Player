import { Howl } from 'howler';
import { Song } from '@/types/music';

class AudioController {
  private howl: Howl | null = null;
  private onTimeUpdateCallback?: (currentTime: number) => void;
  private onEndCallback?: () => void;
  private timerId: number | null = null;

  public playSong(
    song: Song,
    volume: number,
    onEnd: () => void,
    onTimeUpdate: (currentTime: number) => void
  ) {
    this.stop();
    this.onEndCallback = onEnd;
    this.onTimeUpdateCallback = onTimeUpdate;

    const normalizedPath = song.filePath.replace(/\\/g, '/');
    const mediaUrl = `tune-media://local/${encodeURI(normalizedPath)}`;

    this.howl = new Howl({
      src: [mediaUrl],
      html5: true,
      volume: volume,
      onend: () => {
        this.stopTimer();
        if (this.onEndCallback) this.onEndCallback();
      },
      onplay: () => {
        this.startTimer();
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
