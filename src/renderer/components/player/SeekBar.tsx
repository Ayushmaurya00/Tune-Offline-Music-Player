import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { formatDuration } from '../../utils/formatters';

export const SeekBar: React.FC = () => {
  const { currentTime, duration, seek } = usePlayerStore();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="w-full max-w-lg flex items-center gap-2 text-xs font-mono text-tune-textSecondary select-none">
      <span className="w-9 text-right">{formatDuration(currentTime)}</span>

      <div className="relative flex-1 flex items-center group py-2 cursor-pointer">
        {/* Track bar */}
        <div className="w-full h-1 bg-tune-border group-hover:h-1.5 rounded-full overflow-hidden transition-all">
          <div
            className="h-full bg-white group-hover:bg-tune-accent transition-colors"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Input slider overlay */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="w-9">{formatDuration(duration)}</span>
    </div>
  );
};
