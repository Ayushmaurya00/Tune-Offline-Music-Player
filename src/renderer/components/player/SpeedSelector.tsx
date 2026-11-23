import React, { useState, useRef, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

interface SpeedSelectorProps {
  accentColor?: string;
}

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({ accentColor = '#1db954' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { playbackRate, setPlaybackRate } = usePlayerStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isCustomSpeed = playbackRate !== 1.0;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition hover:bg-tune-card ${
          isCustomSpeed ? 'bg-tune-elevated text-white' : 'text-tune-textSecondary hover:text-white'
        }`}
        style={isCustomSpeed ? { color: accentColor } : {}}
        title={`Playback Speed: ${playbackRate}x (Pitch Preserved)`}
      >
        <Gauge size={14} />
        <span className="font-mono">{playbackRate}x</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-32 bg-tune-card/95 backdrop-blur-xl border border-tune-border rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-tune-textMuted border-b border-tune-border/40 mb-1">
            Playback Speed
          </div>
          <div className="space-y-0.5">
            {SPEED_OPTIONS.map((rate) => {
              const active = playbackRate === rate;
              return (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? 'bg-tune-accent/15 text-tune-accent font-bold'
                      : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated'
                  }`}
                  style={active ? { color: accentColor } : {}}
                >
                  <span className="font-mono">{rate.toFixed(2).replace(/\.?0+$/, '')}x</span>
                  {rate === 1.0 && <span className="text-[10px] text-tune-textMuted font-sans">Normal</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
