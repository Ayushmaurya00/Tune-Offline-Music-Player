import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export const VolumeControl: React.FC = () => {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();

  const effectiveVolume = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (effectiveVolume === 0) return <VolumeX size={18} />;
    if (effectiveVolume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  return (
    <div className="flex items-center gap-2 group w-32">
      <button
        onClick={toggleMute}
        className="text-tune-textSecondary hover:text-white transition p-1"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      <div className="relative flex-1 flex items-center py-2 cursor-pointer">
        <div className="w-full h-1 bg-tune-border group-hover:h-1.5 rounded-full overflow-hidden transition-all">
          <div
            className="h-full bg-white group-hover:bg-tune-accent transition-colors"
            style={{ width: `${effectiveVolume * 100}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
