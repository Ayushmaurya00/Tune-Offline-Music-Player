import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  X,
  Radio
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  accentColor = '#1ed760'
}) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    repeatMode,
    toggleRepeat,
    isShuffled,
    toggleShuffle,
    isMuted,
    toggleMute
  } = usePlayerStore();

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleSeekOffset = (seconds: number) => {
    seek(Math.max(0, Math.min(duration || 0, currentTime + seconds)));
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 bg-tune-surface/98 backdrop-blur-2xl border-b border-tune-border shadow-2xl animate-in slide-in-from-top duration-200 select-none">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {/* Drawer Header Badge */}
        <div className="flex items-center justify-between text-xs text-tune-textMuted pb-1 border-b border-tune-border/40">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-tune-accent animate-pulse" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-white">
              Tune Notification Controller
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tune-elevated font-mono">
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-tune-textMuted hover:text-white rounded-lg transition"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Middle: Song Details + Album Art */}
        <div className="flex items-center gap-3">
          <AlbumArt
            coverArt={currentSong?.coverArt}
            title={currentSong?.title || 'Tune'}
            artist={currentSong?.artist}
            className="w-12 h-12 rounded-lg flex-shrink-0 shadow-md"
            iconSize={20}
          />

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate">
              {currentSong?.title || 'No track selected'}
            </span>
            <span className="text-xs text-tune-textSecondary truncate">
              {currentSong?.artist || 'Offline Library'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-tune-textSecondary hover:text-white transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-tune-textMuted w-9 text-right">
            {formatDuration(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            <div className="w-full h-1.5 bg-tune-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: accentColor
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[10px] font-mono text-tune-textMuted w-9">
            {duration > 0 ? formatDuration(duration) : '--:--'}
          </span>
        </div>

        {/* Operational Controls: Backward 10s, Prev, Play/Pause, Next, Forward 10s */}
        <div className="flex items-center justify-between px-2 pt-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-lg transition ${
              isShuffled ? 'text-tune-accent font-bold' : 'text-tune-textSecondary hover:text-white'
            }`}
            title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled'}
          >
            <Shuffle size={17} />
          </button>

          {/* Backward 10s */}
          <button
            onClick={() => handleSeekOffset(-10)}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-tune-textSecondary hover:text-white hover:bg-tune-elevated transition"
            title="Rewind 10 seconds"
          >
            <RotateCcw size={16} />
            <span className="text-[10px] font-mono">10s</span>
          </button>

          {/* Prev Track */}
          <button
            onClick={prevTrack}
            className="p-2 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105 active:scale-95"
            title="Previous Track"
          >
            <SkipBack size={20} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-2 text-tune-textSecondary hover:text-white transition rounded-full hover:scale-105 active:scale-95"
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => handleSeekOffset(10)}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-tune-textSecondary hover:text-white hover:bg-tune-elevated transition"
            title="Forward 10 seconds"
          >
            <RotateCw size={16} />
            <span className="text-[10px] font-mono">10s</span>
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`flex items-center gap-1 p-2 rounded-lg transition ${
              repeatMode !== 'none'
                ? 'text-tune-accent font-bold'
                : 'text-tune-textSecondary hover:text-white'
            }`}
            title={`Repeat: ${repeatMode === 'one' ? 'Current Song' : repeatMode === 'all' ? 'All Songs' : 'Off'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={17} />}
            <span className="text-[9px] uppercase font-mono font-bold">
              {repeatMode === 'one' ? '1' : repeatMode === 'all' ? 'All' : 'Off'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
