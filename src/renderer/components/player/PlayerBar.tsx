import React, { useState, useEffect } from 'react';
import { ListMusic, Heart, Mic2, Sliders, Moon, Minimize2, Maximize2, Play, Pause, SkipForward, Radio } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { PlaybackControls } from './PlaybackControls';
import { WaveformSeekBar } from './WaveformSeekBar';
import { VolumeControl } from './VolumeControl';
import { AlbumArt } from '../shared/AlbumArt';
import { SpeedSelector } from './SpeedSelector';
import { sleepTimerService, SleepTimerState } from '../../audio/sleepTimerService';
import { MobileFullPlayer } from './MobileFullPlayer';

interface PlayerBarProps {
  accentColor?: string;
  onOpenLyrics: () => void;
  isLyricsOpen: boolean;
  onOpenEq: () => void;
  isEqOpen: boolean;
  onOpenSleepTimer: () => void;
  onToggleMiniPlayer: () => void;
  onToggleNotificationDrawer?: () => void;
  isNotificationDrawerOpen?: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  accentColor = '#1ed760',
  onOpenLyrics,
  isLyricsOpen,
  onOpenEq,
  isEqOpen,
  onOpenSleepTimer,
  onToggleMiniPlayer,
  onToggleNotificationDrawer,
  isNotificationDrawerOpen = false
}) => {
  const {
    currentSong,
    isQueueOpen,
    toggleQueue,
    isPlaying,
    togglePlay,
    nextTrack,
    currentTime,
    duration,
    seek
  } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();
  const [timerState, setTimerState] = useState<SleepTimerState>(sleepTimerService.getState());
  const [isMobileFullPlayerOpen, setIsMobileFullPlayerOpen] = useState(false);

  useEffect(() => {
    return sleepTimerService.subscribe((state) => {
      setTimerState(state);
    });
  }, []);

  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  const handleBarClick = (e: React.MouseEvent) => {
    // Only handle taps on the mobile player bar (< md screen width)
    if (window.innerWidth >= 768) return;
    const target = e.target as HTMLElement;
    // Don't open full player if user clicked a button, input, slider, or link
    if (target.closest('button, input, a, [role="button"], [role="slider"]')) {
      return;
    }
    if (currentSong) {
      setIsMobileFullPlayerOpen(true);
    }
  };

  return (
    <footer
      onClick={handleBarClick}
      className="relative h-20 md:h-24 bg-tune-surface border-t border-[#282828] px-4 flex items-center justify-between select-none z-30 cursor-pointer md:cursor-default"
    >
      {/* Interactive top progress scrubber line for mobile */}
      <div
        className="md:hidden absolute -top-1.5 left-0 right-0 h-4 z-40 touch-none cursor-pointer flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          if (duration <= 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          seek(ratio * duration);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 && duration > 0) {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seek(ratio * duration);
          }
        }}
      >
        <div className="w-full h-1 bg-tune-border/80 overflow-hidden">
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              backgroundColor: accentColor
            }}
          />
        </div>
      </div>

      {/* Left: Now Playing Info */}
      <div
        onClick={() => {
          if (currentSong) {
            setIsMobileFullPlayerOpen(true);
          }
        }}
        className="flex items-center gap-3 w-auto md:w-1/4 min-w-0 md:min-w-[200px] flex-1 md:flex-initial cursor-pointer group/nowplaying"
        title="Open Now Playing Screen"
      >
        {currentSong ? (
          <>
            <AlbumArt
              coverArt={currentSong.coverArt}
              title={currentSong.title}
              artist={currentSong.artist}
              className="w-14 h-14 rounded-md flex-shrink-0 shadow-md"
              iconSize={22}
            />
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-medium text-white truncate hover:underline">
                {currentSong.title}
              </span>
              <span className="text-xs text-tune-textSecondary truncate hover:underline">
                {currentSong.artist}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeSong(currentSong);
              }}
              className="p-1.5 transition rounded-full hover:scale-110 flex-shrink-0"
              style={{ color: isLiked ? accentColor : '#b3b3b3' }}
              title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-tune-textMuted text-xs">
            <div className="w-14 h-14 rounded-md bg-tune-elevated flex items-center justify-center border border-tune-border">
              <ListMusic size={20} />
            </div>
            <span>No song selected</span>
          </div>
        )}
      </div>

      {/* Mobile transport stays focused; secondary controls live in the expanded player. */}
      <div className="flex md:hidden items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleQueue();
          }}
          disabled={!currentSong}
          className={`min-w-11 min-h-11 flex items-center justify-center rounded-full transition disabled:opacity-30 ${
            isQueueOpen ? 'text-tune-accent bg-tune-elevated' : 'text-tune-textSecondary active:bg-tune-elevated'
          }`}
          title="Open queue"
          aria-label="Open queue"
        >
          <ListMusic size={19} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          disabled={!currentSong}
          className="w-11 h-11 rounded-full bg-tune-accent text-tune-bg flex items-center justify-center active:scale-95 transition ml-0.5 disabled:opacity-40"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextTrack();
          }}
          disabled={!currentSong}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-tune-textSecondary active:bg-tune-elevated transition disabled:opacity-30"
          title="Next track"
          aria-label="Next track"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Center: Playback Controls & Waveform Seek Bar (Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="hidden md:flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4 cursor-default"
      >
        <PlaybackControls />
        <WaveformSeekBar accentColor={accentColor} />
      </div>

      {/* Right: Controls, Lyrics, EQ, Queue & Volume (Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="hidden md:flex items-center justify-end gap-2 w-1/3 min-w-[280px] cursor-default"
      >
        {/* Playback Speed Selector */}
        <SpeedSelector accentColor={accentColor} />

        {/* Sleep Timer Button */}
        <button
          onClick={onOpenSleepTimer}
          className={`flex items-center gap-1.5 p-2 rounded-lg transition hover:bg-tune-card ${
            timerState.isActive ? 'bg-tune-elevated text-tune-accent' : 'text-tune-textSecondary hover:text-white'
          }`}
          style={timerState.isActive ? { color: accentColor } : {}}
          title={timerState.isActive ? 'Sleep Timer Active' : 'Set Sleep Timer'}
        >
          <Moon size={18} />
          {timerState.isActive && (
            <span className="text-[11px] font-mono font-bold">
              {timerState.isEndOfTrack
                ? 'End'
                : `${Math.ceil(timerState.remainingSeconds / 60)}m`}
            </span>
          )}
        </button>

        {/* Notification Drawer Controller Button */}
        {onToggleNotificationDrawer && (
          <button
            onClick={onToggleNotificationDrawer}
            className={`p-2 rounded-lg transition hover:bg-tune-card ${
              isNotificationDrawerOpen ? 'bg-tune-elevated' : 'text-tune-textSecondary hover:text-white'
            }`}
            style={isNotificationDrawerOpen ? { color: accentColor } : {}}
            title="Open Notification Drawer Controller"
          >
            <Radio size={18} />
          </button>
        )}

        {/* Full-Screen Now Playing View Button */}
        <button
          onClick={() => setIsMobileFullPlayerOpen(true)}
          className="p-2 rounded-lg transition hover:bg-tune-card text-tune-textSecondary hover:text-white"
          title="Open Full Now Playing Screen (Poster & Controls)"
        >
          <Maximize2 size={18} />
        </button>

        {/* Mini Player Mode Button */}
        <button
          onClick={onToggleMiniPlayer}
          className="p-2 rounded-lg transition hover:bg-tune-card text-tune-textSecondary hover:text-white"
          title="Switch to Mini Player (Floating Always-on-Top)"
        >
          <Minimize2 size={17} />
        </button>

        {/* Equalizer Button */}
        <button
          onClick={onOpenEq}
          className={`p-2 rounded-lg transition hover:bg-tune-card ${
            isEqOpen ? 'bg-tune-elevated' : 'text-tune-textSecondary hover:text-white'
          }`}
          style={isEqOpen ? { color: accentColor } : {}}
          title="10-Band Equalizer & Crossfade"
        >
          <Sliders size={18} />
        </button>

        {/* Synced Lyrics Button */}
        <button
          onClick={onOpenLyrics}
          disabled={!currentSong}
          className={`p-2 rounded-lg transition hover:bg-tune-card disabled:opacity-30 ${
            isLyricsOpen ? 'bg-tune-elevated' : 'text-tune-textSecondary hover:text-white'
          }`}
          style={isLyricsOpen ? { color: accentColor } : {}}
          title="Synced Karaoke Lyrics"
        >
          <Mic2 size={19} />
        </button>

        {/* Play Queue Toggle */}
        <button
          onClick={toggleQueue}
          className={`p-2 rounded-lg transition hover:bg-tune-card ${
            isQueueOpen ? 'bg-tune-elevated' : 'text-tune-textSecondary hover:text-white'
          }`}
          style={isQueueOpen ? { color: accentColor } : {}}
          title="Play Queue"
        >
          <ListMusic size={20} />
        </button>

        <VolumeControl />
      </div>

      {/* Full-Screen Mobile Player Modal */}
      <MobileFullPlayer
        isOpen={isMobileFullPlayerOpen}
        onClose={() => setIsMobileFullPlayerOpen(false)}
        accentColor={accentColor}
        onOpenLyrics={onOpenLyrics}
        onOpenEq={onOpenEq}
        onOpenSleepTimer={onOpenSleepTimer}
        isLyricsOpen={isLyricsOpen}
        isEqOpen={isEqOpen}
      />
    </footer>
  );
};
