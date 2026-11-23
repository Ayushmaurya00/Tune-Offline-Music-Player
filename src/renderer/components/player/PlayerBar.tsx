import React, { useState, useEffect } from 'react';
import { ListMusic, Heart, Mic2, Sliders, Moon, Minimize2, Play, Pause, SkipForward } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { PlaybackControls } from './PlaybackControls';
import { WaveformSeekBar } from './WaveformSeekBar';
import { VolumeControl } from './VolumeControl';
import { AlbumArt } from '../shared/AlbumArt';
import { SpeedSelector } from './SpeedSelector';
import { sleepTimerService, SleepTimerState } from '../../audio/sleepTimerService';

interface PlayerBarProps {
  accentColor?: string;
  onOpenLyrics: () => void;
  isLyricsOpen: boolean;
  onOpenEq: () => void;
  isEqOpen: boolean;
  onOpenSleepTimer: () => void;
  onToggleMiniPlayer: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  accentColor = '#1db954',
  onOpenLyrics,
  isLyricsOpen,
  onOpenEq,
  isEqOpen,
  onOpenSleepTimer,
  onToggleMiniPlayer
}) => {
  const {
    currentSong,
    isQueueOpen,
    toggleQueue,
    isPlaying,
    togglePlay,
    nextTrack,
    currentTime,
    duration
  } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();
  const [timerState, setTimerState] = useState<SleepTimerState>(sleepTimerService.getState());

  useEffect(() => {
    return sleepTimerService.subscribe((state) => {
      setTimerState(state);
    });
  }, []);

  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  return (
    <footer className="relative h-20 md:h-24 bg-tune-surface/95 backdrop-blur-md border-t border-tune-border px-4 flex items-center justify-between select-none z-30 shadow-2xl">
      {/* Thin top progress line for mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-tune-border">
        <div
          className="h-full transition-all duration-200"
          style={{
            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            backgroundColor: accentColor
          }}
        />
      </div>

      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-3 w-auto md:w-1/4 min-w-0 md:min-w-[200px] flex-1 md:flex-initial">
        {currentSong ? (
          <>
            <AlbumArt
              coverArt={currentSong.coverArt}
              title={currentSong.title}
              className="w-14 h-14 rounded-md flex-shrink-0 shadow-md"
              iconSize={22}
            />
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </span>
              <span className="text-xs text-tune-textSecondary truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </span>
            </div>

            <button
              onClick={() => toggleLikeSong(currentSong)}
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

      {/* Mobile Play / Skip Controls */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          onClick={nextTrack}
          className="p-2 text-tune-textSecondary hover:text-white transition"
          title="Next"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Center: Playback Controls & Waveform Seek Bar (Desktop) */}
      <div className="hidden md:flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4">
        <PlaybackControls />
        <WaveformSeekBar accentColor={accentColor} />
      </div>

      {/* Right: Controls, Lyrics, EQ, Queue & Volume (Desktop) */}
      <div className="hidden md:flex items-center justify-end gap-2 w-1/3 min-w-[280px]">
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
    </footer>
  );
};
