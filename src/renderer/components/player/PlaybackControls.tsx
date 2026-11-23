import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export const PlaybackControls: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    repeatMode,
    toggleRepeat,
    isShuffled,
    toggleShuffle,
    seek,
    currentTime
  } = usePlayerStore();

  const handleSeekOffset = (offset: number) => {
    seek(Math.max(0, currentTime + offset));
  };

  return (
    <div className="flex items-center gap-3">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`p-1.5 transition rounded-full hover:scale-105 ${
          isShuffled ? 'text-tune-accent' : 'text-tune-textSecondary hover:text-white'
        }`}
        title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
      >
        <Shuffle size={17} />
      </button>

      {/* Backward 10s */}
      <button
        onClick={() => handleSeekOffset(-10)}
        className="p-1.5 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105"
        title="Backward 10 seconds"
      >
        <RotateCcw size={16} />
      </button>

      {/* Previous */}
      <button
        onClick={prevTrack}
        className="p-1.5 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105"
        title="Previous Track"
      >
        <SkipBack size={20} />
      </button>

      {/* Play / Pause Primary Button */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition shadow-md"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Next */}
      <button
        onClick={nextTrack}
        className="p-1.5 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105"
        title="Next Track"
      >
        <SkipForward size={20} />
      </button>

      {/* Forward 10s */}
      <button
        onClick={() => handleSeekOffset(10)}
        className="p-1.5 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105"
        title="Forward 10 seconds"
      >
        <RotateCw size={16} />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={`p-1.5 transition rounded-full hover:scale-105 ${
          repeatMode !== 'none' ? 'text-tune-accent' : 'text-tune-textSecondary hover:text-white'
        }`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={17} />}
      </button>
    </div>
  );
};
