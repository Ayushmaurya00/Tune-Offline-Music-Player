import { Howler } from 'howler';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export interface EQPreset {
  name: string;
  gains: number[]; // 10 numbers from -12 to +12 dB
}

export const EQ_PRESETS: EQPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [7, 6, 4, 1, 0, -1, 0, 1, 2, 3] },
  { name: 'Vocal Boost', gains: [-2, -1, 0, 1, 2, 4, 3, 2, 1, 0] },
  { name: 'Electronic', gains: [5, 5, 2, 0, -2, 1, 2, 3, 4, 5] },
  { name: 'Rock', gains: [4, 3, 1, 0, -1, 1, 2, 3, 4, 4] },
  { name: 'Acoustic', gains: [2, 3, 2, 1, 1, 1, 2, 3, 3, 2] },
  { name: 'Treble Boost', gains: [-2, -2, -1, 0, 0, 1, 2, 4, 6, 7] }
];

const STORAGE_EQ_KEY = 'tune_eq_config_v1';

class EqualizerService {
  private filters: BiquadFilterNode[] = [];
  private isInitialized = false;
  private isEnabled = true;
  private currentGains: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private activePreset = 'Flat';
  private crossfadeDuration = 3; // default 3 seconds
  private songChangeDelayMs = 250; // default 250ms transition delay on song change

  constructor() {
    this.loadSettings();
  }

  public init() {
    if (this.isInitialized) return;

    try {
      const ctx = Howler.ctx;
      if (!ctx) return;

      this.filters = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = this.isEnabled ? this.currentGains[idx] : 0;
        return filter;
      });

      // Chain filters in series: masterGain -> filter[0] -> filter[1] ... -> destination
      const masterGain = Howler.masterGain;
      masterGain.disconnect();

      let prevNode: AudioNode = masterGain;
      for (const filter of this.filters) {
        prevNode.connect(filter);
        prevNode = filter;
      }
      prevNode.connect(ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Could not initialize EQ chain:', err);
    }
  }

  public setBandGain(index: number, db: number) {
    if (index < 0 || index >= this.currentGains.length) return;
    this.currentGains[index] = Math.max(-12, Math.min(12, db));
    this.activePreset = 'Custom';

    if (this.filters[index] && this.isEnabled) {
      this.filters[index].gain.value = this.currentGains[index];
    }
    this.saveSettings();
  }

  public applyPreset(name: string) {
    const preset = EQ_PRESETS.find((p) => p.name === name);
    if (!preset) return;

    this.activePreset = preset.name;
    this.currentGains = [...preset.gains];

    this.currentGains.forEach((gain, idx) => {
      if (this.filters[idx]) {
        this.filters[idx].gain.value = this.isEnabled ? gain : 0;
      }
    });
    this.saveSettings();
  }

  public toggleEnabled(): boolean {
    this.isEnabled = !this.isEnabled;

    this.filters.forEach((filter, idx) => {
      filter.gain.value = this.isEnabled ? this.currentGains[idx] : 0;
    });

    this.saveSettings();
    return this.isEnabled;
  }

  public getSettings() {
    return {
      isEnabled: this.isEnabled,
      activePreset: this.activePreset,
      currentGains: [...this.currentGains],
      crossfadeDuration: this.crossfadeDuration,
      songChangeDelayMs: this.songChangeDelayMs
    };
  }

  public setCrossfadeDuration(sec: number) {
    this.crossfadeDuration = Math.max(0, Math.min(12, sec));
    this.saveSettings();
  }

  public setSongChangeDelay(ms: number) {
    this.songChangeDelayMs = Math.max(0, Math.min(2000, ms));
    this.saveSettings();
  }

  private saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_EQ_KEY,
        JSON.stringify({
          isEnabled: this.isEnabled,
          activePreset: this.activePreset,
          currentGains: this.currentGains,
          crossfadeDuration: this.crossfadeDuration,
          songChangeDelayMs: this.songChangeDelayMs
        })
      );
    } catch {
      // ignore
    }
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_EQ_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.isEnabled === 'boolean') this.isEnabled = parsed.isEnabled;
        if (parsed.activePreset) this.activePreset = parsed.activePreset;
        if (Array.isArray(parsed.currentGains) && parsed.currentGains.length === 10) {
          this.currentGains = parsed.currentGains;
        }
        if (typeof parsed.crossfadeDuration === 'number') {
          this.crossfadeDuration = parsed.crossfadeDuration;
        }
        if (typeof parsed.songChangeDelayMs === 'number') {
          this.songChangeDelayMs = parsed.songChangeDelayMs;
        }
      }
    } catch {
      // ignore
    }
  }
}

export const eqService = new EqualizerService();

