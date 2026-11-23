import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Zap } from 'lucide-react';
import { eqService, EQ_FREQUENCIES, EQ_PRESETS } from '../../audio/eqService';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#1db954'
}) => {
  const [settings, setSettings] = useState(eqService.getSettings());

  if (!isOpen) return null;

  const handleToggle = () => {
    eqService.toggleEnabled();
    setSettings(eqService.getSettings());
  };

  const handleBandChange = (index: number, val: number) => {
    eqService.setBandGain(index, val);
    setSettings(eqService.getSettings());
  };

  const handlePresetSelect = (presetName: string) => {
    eqService.applyPreset(presetName);
    setSettings(eqService.getSettings());
  };

  const handleCrossfadeChange = (sec: number) => {
    eqService.setCrossfadeDuration(sec);
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
        </div>
      </div>
    </div>
  );
};
