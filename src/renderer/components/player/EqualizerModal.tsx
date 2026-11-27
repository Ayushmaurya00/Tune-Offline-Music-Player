import React, { useState, useEffect } from 'react';
import { X, Sliders, RotateCcw, Zap, Waves, Sparkles, Volume2 } from 'lucide-react';
import { eqService, EQ_FREQUENCIES, EQ_PRESETS } from '../../audio/eqService';
import { backButtonService } from '../../services/backButtonService';
import { triggerHaptic } from '../../utils/haptics';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#1ed760'
}) => {
  const [settings, setSettings] = useState(eqService.getSettings());

  useEffect(() => {
    if (!isOpen) return;
    return backButtonService.register(onClose);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = () => {
    eqService.toggleEnabled();
    setSettings(eqService.getSettings());
    triggerHaptic('medium');
  };

  const handleBandChange = (index: number, val: number) => {
    eqService.setBandGain(index, val);
    setSettings(eqService.getSettings());
  };

  const handlePresetSelect = (presetName: string) => {
    eqService.applyPreset(presetName);
    setSettings(eqService.getSettings());
    triggerHaptic('selection');
  };

  const handleBassBoostChange = (val: number) => {
    eqService.setBassBoost(val);
    setSettings(eqService.getSettings());
    triggerHaptic('light');
  };

  const handleVirtualizerChange = (val: number) => {
    eqService.setVirtualizer(val);
    setSettings(eqService.getSettings());
    triggerHaptic('light');
  };

  const handleToggleNormalization = () => {
    eqService.setVolumeNormalization(!settings.volumeNormalization);
    setSettings(eqService.getSettings());
    triggerHaptic('medium');
  };

  const handleCrossfadeChange = (sec: number) => {
    eqService.setCrossfadeDuration(sec);
    setSettings(eqService.getSettings());
  };

  const handleDelayChange = (ms: number) => {
    eqService.setSongChangeDelay(ms);
    setSettings(eqService.getSettings());
  };

  const formatFreq = (freq: number) => {
    if (freq >= 1000) return `${freq / 1000}k`;
    return `${freq}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-tune-surface border border-tune-border rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-tune-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tune-elevated text-tune-accent flex items-center justify-center shadow">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>10-Band Equalizer</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-tune-elevated text-tune-textSecondary border border-tune-border">
                  Pro Audio
                </span>
              </h2>
              <p className="text-xs text-tune-textSecondary">
                Fine-tune audio frequencies and smooth track transitions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Toggle */}
            <button
              onClick={handleToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                settings.isEnabled
                  ? 'bg-tune-accent text-black border-tune-accent'
                  : 'bg-tune-elevated text-tune-textMuted border-tune-border'
              }`}
            >
              <Zap size={14} />
              <span>{settings.isEnabled ? 'EQ Active' : 'Bypassed'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-tune-textMuted hover:text-white rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Preset Pills */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-tune-textMuted uppercase tracking-wider">
                Audio Presets
              </span>

              <button
                onClick={() => handlePresetSelect('Flat')}
                className="flex items-center gap-1 text-[11px] text-tune-textMuted hover:text-white transition"
              >
                <RotateCcw size={12} />
                <span>Reset to Flat</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {EQ_PRESETS.map((preset) => {
                const isSelected = settings.activePreset === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-tune-elevated text-tune-textSecondary hover:text-white border border-tune-border'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10 Vertical Equalizer Faders */}
          <div className="p-5 rounded-2xl bg-tune-elevated/40 border border-tune-border">
            <div className="flex justify-between items-center text-[10px] font-mono text-tune-textMuted mb-4 px-1">
              <span>+12 dB</span>
              <span className="text-tune-border">0 dB Center</span>
              <span>-12 dB</span>
            </div>

            <div className="grid grid-cols-10 gap-2 h-44 items-end px-1 select-none">
              {EQ_FREQUENCIES.map((freq, idx) => {
                const gain = settings.currentGains[idx] || 0;
                return (
                  <div key={freq} className="flex flex-col items-center h-full justify-between">
                    <span className="text-[10px] font-mono font-semibold" style={{ color: gain !== 0 ? accentColor : '#888' }}>
                      {gain > 0 ? `+${gain}` : gain}
                    </span>

                    {/* Vertical range slider */}
                    <div className="relative flex-1 flex items-center justify-center w-full py-2">
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={1}
                        value={gain}
                        disabled={!settings.isEnabled}
                        onChange={(e) => handleBandChange(idx, parseInt(e.target.value, 10))}
                        className="h-28 w-2 bg-tune-border rounded-full appearance-none cursor-pointer accent-tune-accent disabled:opacity-30 [writing-mode:vertical-lr] [direction:rtl]"
                      />
                    </div>

                    <span className="text-[10px] font-mono font-bold text-tune-textMuted">
                      {formatFreq(freq)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Superpowers: Bass Boost & 3D Virtualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bass Booster */}
            <div className="p-4 rounded-2xl bg-tune-elevated/40 border border-tune-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Waves size={16} className="text-tune-accent" />
                  <span className="text-xs font-bold text-white">Bass Booster</span>
                </div>
                <span className="text-xs font-mono font-bold text-tune-accent">
                  {settings.bassBoost > 0 ? `+${settings.bassBoost}%` : 'Off'}
                </span>
              </div>
              <p className="text-[11px] text-tune-textSecondary mb-3">
                80Hz low-end punch & sub-bass acoustic boost
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={settings.bassBoost}
                disabled={!settings.isEnabled}
                onChange={(e) => handleBassBoostChange(parseInt(e.target.value, 10))}
                className="w-full accent-tune-accent cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* 3D Spatial Virtualizer */}
            <div className="p-4 rounded-2xl bg-tune-elevated/40 border border-tune-border flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-tune-accent" />
                  <span className="text-xs font-bold text-white">3D Virtualizer</span>
                </div>
                <span className="text-xs font-mono font-bold text-tune-accent">
                  {settings.virtualizer > 0 ? `+${settings.virtualizer}%` : 'Off'}
                </span>
              </div>
              <p className="text-[11px] text-tune-textSecondary mb-3">
                Expands stereo field width & acoustic presence
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={settings.virtualizer}
                disabled={!settings.isEnabled}
                onChange={(e) => handleVirtualizerChange(parseInt(e.target.value, 10))}
                className="w-full accent-tune-accent cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Smart Volume Normalization */}
          <div className="p-4 rounded-2xl bg-tune-elevated/40 border border-tune-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-tune-elevated flex items-center justify-center text-tune-accent flex-shrink-0">
                <Volume2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Smart Volume Normalization
                </span>
                <span className="text-[11px] text-tune-textSecondary">
                  Auto-balances quiet and loud tracks for consistent, comfortable listening
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!settings.isEnabled}
              onClick={handleToggleNormalization}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-200 cursor-pointer disabled:opacity-40 flex-shrink-0 ${
                settings.volumeNormalization && settings.isEnabled ? 'bg-tune-accent justify-end' : 'bg-tune-border justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Crossfade Duration Slider */}
          <div className="p-4 rounded-2xl bg-tune-elevated/40 border border-tune-border flex items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-white block">
                Seamless Crossfade
              </span>
              <span className="text-[11px] text-tune-textSecondary">
                Fades out current track while fading in the next track in queue
              </span>
            </div>

            <div className="flex items-center gap-3 w-48">
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={settings.crossfadeDuration}
                onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                className="w-full accent-tune-accent cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-tune-accent w-10 text-right">
                {settings.crossfadeDuration}s
              </span>
            </div>
          </div>

          {/* Song Switch Delay Slider */}
          <div className="p-4 rounded-2xl bg-tune-elevated/40 border border-tune-border flex items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-white block">
                Song Switch Delay
              </span>
              <span className="text-[11px] text-tune-textSecondary">
                Adds a gentle pause between tracks to prevent abrupt audio pops
              </span>
            </div>

            <div className="flex items-center gap-3 w-48">
              <input
                type="range"
                min={0}
                max={1000}
                step={50}
                value={settings.songChangeDelayMs}
                onChange={(e) => handleDelayChange(parseInt(e.target.value, 10))}
                className="w-full accent-tune-accent cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-tune-accent w-14 text-right">
                {settings.songChangeDelayMs === 0 ? 'Off' : `${settings.songChangeDelayMs}ms`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
