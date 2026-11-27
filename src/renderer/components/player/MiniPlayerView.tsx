import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Music, RotateCcw, RotateCw } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration } from '../../utils/formatters';

interface MiniPlayerViewProps {
  onExpand: () => void;
  accentColor?: string;
}

export const MiniPlayerView: React.FC<MiniPlayerViewProps> = ({
  onExpand,
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
    seek
  } = usePlayerStore();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-full bg-tune-surface flex flex-col justify-between select-none overflow-hidden border border-tune-border/60 p-2.5">
      {/* Draggable Title Header */}
      <div
        className="flex items-center justify-between pb-1.5 cursor-move"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-[11px] font-bold tracking-wider text-tune-textSecondary uppercase">
            Tune Mini
          </span>
        </div>

        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={onExpand}
            className="p-1 rounded text-tune-textMuted hover:text-white hover:bg-tune-elevated transition"
            title="Expand to Full Player"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Main Track Content */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0 py-0.5">
        {currentSong ? (
          <AlbumArt
            coverArt={currentSong.coverArt}
            title={currentSong.title}
            className="w-12 h-12 rounded-lg flex-shrink-0 shadow"
            iconSize={18}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-tune-elevated flex items-center justify-center text-tune-textMuted flex-shrink-0 border border-tune-border">
            <Music size={18} />
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0 pr-1">
          <span className="text-xs font-semibold text-white truncate">
            {currentSong ? currentSong.title : 'No song playing'}
          </span>
          <span className="text-[11px] text-tune-textSecondary truncate">
            {currentSong ? currentSong.artist : 'Select a song'}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => seek(Math.max(0, currentTime - 10))}
              className="text-tune-textMuted hover:text-white transition"
              title="-10s"
            >
              <RotateCcw size={12} />
            </button>

            <button
              onClick={prevTrack}
              className="text-tune-textSecondary hover:text-white transition"
              title="Previous"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={togglePlay}
              className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={12} fill="currentColor" />
              ) : (
                <Play size={12} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-tune-textSecondary hover:text-white transition"
              title="Next"
            >
              <SkipForward size={14} />
            </button>

            <button
              onClick={() => seek(Math.min(duration, currentTime + 10))}
              className="text-tune-textMuted hover:text-white transition"
              title="+10s"
            >
              <RotateCw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="pt-1.5">
        <div
          onPointerDown={(e) => {
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
            if (duration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seek(ratio * duration);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1 && duration > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seek(ratio * duration);
            }
          }}
          className="relative w-full h-2 flex items-center bg-tune-border rounded-full cursor-pointer group touch-none"
        >
          <div
            className="h-1 rounded-full transition-all group-hover:h-1.5"
            style={{ width: `${progressPercent}%`, backgroundColor: accentColor }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-tune-textMuted mt-1 font-mono">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};
