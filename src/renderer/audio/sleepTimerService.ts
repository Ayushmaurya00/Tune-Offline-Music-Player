import { audioController } from './audioController';
import { usePlayerStore } from '../store/playerStore';

export type SleepTimerListener = (state: SleepTimerState) => void;

export interface SleepTimerState {
  isActive: boolean;
  isEndOfTrack: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  fadeOut: boolean;
}

class SleepTimerService {
  private timerId: number | null = null;
  private fadeIntervalId: number | null = null;
  private originalVolume: number = 0.8;
  private listeners: Set<SleepTimerListener> = new Set();

  private state: SleepTimerState = {
    isActive: false,
    isEndOfTrack: false,
    totalDurationSeconds: 0,
    remainingSeconds: 0,
    fadeOut: true
  };

  public getState(): SleepTimerState {
    return { ...this.state };
  }

  public subscribe(listener: SleepTimerListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  public startTimer(minutes: number, fadeOut: boolean = true) {
    this.cancelTimer();

    const totalSeconds = Math.round(minutes * 60);
    this.originalVolume = usePlayerStore.getState().volume;

    this.state = {
      isActive: true,
      isEndOfTrack: false,
      totalDurationSeconds: totalSeconds,
      remainingSeconds: totalSeconds,
      fadeOut
    };
    this.notify();

    this.timerId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  public startEndOfTrack(fadeOut: boolean = true) {
    this.cancelTimer();
    this.originalVolume = usePlayerStore.getState().volume;

    this.state = {
      isActive: true,
      isEndOfTrack: true,
      totalDurationSeconds: 0,
      remainingSeconds: 0,
      fadeOut
    };
    this.notify();
  }

  public onTrackEnded() {
    if (this.state.isActive && this.state.isEndOfTrack) {
      this.triggerSleep();
    }
  }

  private tick() {
    if (!this.state.isActive) return;

    const remaining = this.state.remainingSeconds - 1;

    if (remaining <= 0) {
      this.triggerSleep();
      return;
    }

    this.state.remainingSeconds = remaining;

    // Handle smooth fade out over last 15 seconds
    if (this.state.fadeOut && remaining <= 15) {
      const fraction = remaining / 15;
      const targetVolume = this.originalVolume * Math.max(0, fraction);
      audioController.setVolume(targetVolume);
    }

    this.notify();
  }

  private triggerSleep() {
    const playerStore = usePlayerStore.getState();
    playerStore.togglePlay(); // pause
    audioController.stop();

    // Restore volume in store if it was faded
    if (this.state.fadeOut) {
      audioController.setVolume(this.originalVolume);
    }

    this.cancelTimer();
  }

  public cancelTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.fadeIntervalId !== null) {
      clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    if (this.state.isActive && this.state.fadeOut) {
      audioController.setVolume(this.originalVolume);
    }

    this.state = {
      isActive: false,
      isEndOfTrack: false,
      totalDurationSeconds: 0,
      remainingSeconds: 0,
      fadeOut: true
    };
    this.notify();
  }
}

export const sleepTimerService = new SleepTimerService();

