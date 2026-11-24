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
  private bassBoostFilter: BiquadFilterNode | null = null;
  private virtualizerFilter: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;

  private isInitialized = false;
  private isEnabled = true;
  private currentGains: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private activePreset = 'Flat';
  private crossfadeDuration = 3; // default 3 seconds
  private songChangeDelayMs = 250; // default 250ms transition delay on song change
  private bassBoost = 0; // 0 to 100%
  private virtualizer = 0; // 0 to 100%
  private volumeNormalization = true; // smart dynamics leveling

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

      // Bass boost filter (80 Hz lowshelf, up to +12 dB)
      this.bassBoostFilter = ctx.createBiquadFilter();
      this.bassBoostFilter.type = 'lowshelf';
      this.bassBoostFilter.frequency.value = 80;
      this.bassBoostFilter.gain.value = this.isEnabled ? (this.bassBoost / 100) * 12 : 0;

      // 3D Spatial Virtualizer filter (3500 Hz presence shelf)
      this.virtualizerFilter = ctx.createBiquadFilter();
      this.virtualizerFilter.type = 'peaking';
      this.virtualizerFilter.frequency.value = 3500;
      this.virtualizerFilter.Q.value = 0.8;
      this.virtualizerFilter.gain.value = this.isEnabled ? (this.virtualizer / 100) * 8 : 0;

      // Smart Volume Normalization via Dynamics Compressor
      this.compressorNode = ctx.createDynamicsCompressor();
      this.applyCompressionSettings();

      // Chain filters in series:
      // masterGain -> filter[0..9] -> bassBoostFilter -> virtualizerFilter -> compressorNode -> destination
      const masterGain = Howler.masterGain;
      masterGain.disconnect();

      let prevNode: AudioNode = masterGain;
      for (const filter of this.filters) {
        prevNode.connect(filter);
        prevNode = filter;
      }
      prevNode.connect(this.bassBoostFilter);
      this.bassBoostFilter.connect(this.virtualizerFilter);
      this.virtualizerFilter.connect(this.compressorNode);
      this.compressorNode.connect(ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Could not initialize EQ chain:', err);
    }
  }

  private applyCompressionSettings() {
    if (!this.compressorNode) return;
    if (this.volumeNormalization && this.isEnabled) {
      this.compressorNode.threshold.value = -24;
      this.compressorNode.knee.value = 30;
      this.compressorNode.ratio.value = 12;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;
    } else {
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
    }
  }

  public setBassBoost(val: number) {
    this.bassBoost = Math.max(0, Math.min(100, Math.round(val)));
    if (this.bassBoostFilter && this.isEnabled) {
      this.bassBoostFilter.gain.value = (this.bassBoost / 100) * 12;
    }
    this.saveSettings();
  }

  public setVirtualizer(val: number) {
    this.virtualizer = Math.max(0, Math.min(100, Math.round(val)));
    if (this.virtualizerFilter && this.isEnabled) {
      this.virtualizerFilter.gain.value = (this.virtualizer / 100) * 8;
    }
    this.saveSettings();
  }

  public setVolumeNormalization(enabled: boolean) {
    this.volumeNormalization = enabled;
    this.applyCompressionSettings();
    this.saveSettings();
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

    if (this.bassBoostFilter) {
      this.bassBoostFilter.gain.value = this.isEnabled ? (this.bassBoost / 100) * 12 : 0;
    }
    if (this.virtualizerFilter) {
      this.virtualizerFilter.gain.value = this.isEnabled ? (this.virtualizer / 100) * 8 : 0;
    }
    this.applyCompressionSettings();

    this.saveSettings();
    return this.isEnabled;
  }

  public getSettings() {
    return {
      isEnabled: this.isEnabled,
      activePreset: this.activePreset,
      currentGains: [...this.currentGains],
      crossfadeDuration: this.crossfadeDuration,
      songChangeDelayMs: this.songChangeDelayMs,
      bassBoost: this.bassBoost,
      virtualizer: this.virtualizer,
      volumeNormalization: this.volumeNormalization
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
          songChangeDelayMs: this.songChangeDelayMs,
          bassBoost: this.bassBoost,
          virtualizer: this.virtualizer,
          volumeNormalization: this.volumeNormalization
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
        if (typeof parsed.bassBoost === 'number') {
          this.bassBoost = parsed.bassBoost;
        }
        if (typeof parsed.virtualizer === 'number') {
          this.virtualizer = parsed.virtualizer;
        }
        if (typeof parsed.volumeNormalization === 'boolean') {
          this.volumeNormalization = parsed.volumeNormalization;
        }
      }
    } catch {
      // ignore
    }
  }
}

export const eqService = new EqualizerService();

