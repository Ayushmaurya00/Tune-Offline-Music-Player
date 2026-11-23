import React, { useState, useEffect } from 'react';
import { X, Moon, Clock, Volume2, Check } from 'lucide-react';
import { sleepTimerService, SleepTimerState } from '../../audio/sleepTimerService';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

const PRESETS = [5, 10, 15, 30, 45, 60];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#1db954'
}) => {
  const [timerState, setTimerState] = useState<SleepTimerState>(sleepTimerService.getState());
  const [customMinutes, setCustomMinutes] = useState('');
  const [fadeOut, setFadeOut] = useState(true);

  useEffect(() => {
    return sleepTimerService.subscribe((state) => {
      setTimerState(state);
    });
  }, []);

  if (!isOpen) return null;

  const handleStartPreset = (mins: number) => {
    sleepTimerService.startTimer(mins, fadeOut);
    onClose();
  };

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customMinutes, 10);
    if (!isNaN(parsed) && parsed > 0) {
      sleepTimerService.startTimer(parsed, fadeOut);
      onClose();
    }
  };

  const handleStartEndOfTrack = () => {
    sleepTimerService.startEndOfTrack(fadeOut);
    onClose();
  };

  const handleCancelTimer = () => {
    sleepTimerService.cancelTimer();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-tune-surface border border-tune-border p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-tune-elevated text-tune-accent flex items-center justify-center border border-tune-border">
              <Moon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Sleep Timer</h2>
              <p className="text-xs text-tune-textMuted">Stop playback automatically</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-tune-textMuted hover:text-white rounded-lg hover:bg-tune-elevated transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Timer Status Card */}
        {timerState.isActive ? (
          <div className="p-4 rounded-xl bg-tune-elevated border border-tune-border flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-tune-textSecondary">
              <Clock size={15} className="animate-pulse text-tune-accent" />
              <span>
                {timerState.isEndOfTrack ? 'Stops at end of track' : 'Timer Active'}
              </span>
            </div>

            {!timerState.isEndOfTrack && (
              <div
                className="text-3xl font-mono font-bold tracking-tight"
                style={{ color: accentColor }}
              >
                {formatCountdown(timerState.remainingSeconds)}
              </div>
            )}

            <button
              onClick={handleCancelTimer}
              className="mt-1 px-4 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold border border-red-500/30 transition"
            >
              Turn Off Timer
            </button>
          </div>
        ) : (
          <>
            {/* Presets Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-tune-textSecondary">Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleStartPreset(mins)}
                    className="py-2.5 px-3 rounded-xl bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-white border border-tune-border transition hover:border-tune-accent"
                  >
                    {mins} min
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartEndOfTrack}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-white border border-tune-border transition flex items-center justify-center gap-2 hover:border-tune-accent"
              >
                <Check size={14} className="text-tune-accent" />
                <span>End of current track</span>
              </button>
            </div>

            {/* Custom Minutes Input */}
            <form onSubmit={handleStartCustom} className="flex gap-2">
              <input
                type="number"
                min="1"
                max="360"
                placeholder="Custom minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-tune-card border border-tune-border text-xs text-white placeholder-tune-textMuted focus:outline-none focus:border-tune-accent"
              />
              <button
                type="submit"
                disabled={!customMinutes}
                className="px-4 py-2 rounded-xl bg-tune-elevated hover:bg-tune-card disabled:opacity-40 text-xs font-semibold text-white border border-tune-border transition"
              >
                Set
              </button>
            </form>
          </>
        )}

        {/* Options */}
        <div className="pt-2 border-t border-tune-border/60">
          <label className="flex items-center gap-2.5 text-xs text-tune-textSecondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fadeOut}
              onChange={(e) => setFadeOut(e.target.checked)}
              className="accent-tune-accent rounded"
            />
            <Volume2 size={14} className="text-tune-textMuted" />
            <span>Smoothly fade out volume over final 15s</span>
          </label>
        </div>
      </div>
    </div>
  );
};

