import React from 'react';
import {
  ChevronDown,
  Heart,
  Mic2,
  Sliders,
  Moon,
  ListMusic
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { PlaybackControls } from './PlaybackControls';
import { WaveformSeekBar } from './WaveformSeekBar';
import { AlbumArt } from '../shared/AlbumArt';
import { SpeedSelector } from './SpeedSelector';
import { sleepTimerService } from '../../audio/sleepTimerService';

interface MobileFullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  onOpenLyrics: () => void;
  onOpenEq: () => void;
  onOpenSleepTimer: () => void;
  isLyricsOpen: boolean;
  isEqOpen: boolean;
}

export const MobileFullPlayer: React.FC<MobileFullPlayerProps> = ({
  isOpen,
  onClose,
  accentColor = '#1db954',
  onOpenLyrics,
  onOpenEq,
  onOpenSleepTimer,
  isLyricsOpen,
  isEqOpen
}) => {
  const { currentSong, toggleQueue, isQueueOpen } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();
  const timerState = sleepTimerService.getState();

  if (!isOpen || !currentSong) return null;

  const isLiked = isSongLiked(currentSong.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-2xl flex flex-col justify-between p-6 select-none animate-in slide-in-from-bottom duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onClose}
          className="p-2 text-tune-textSecondary hover:text-white transition -ml-2"
          title="Collapse player"
        >
          <ChevronDown size={28} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-tune-textMuted">
            Playing from Library
          </span>
          <span className="text-xs font-semibold text-white truncate max-w-[200px]">
            {currentSong.album || 'Tune Music'}
          </span>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenSleepTimer();
          }}
          className={`p-2 transition ${timerState.isActive ? 'text-tune-accent' : 'text-tune-textSecondary hover:text-white'}`}
          title="Sleep Timer"
        >
          <Moon size={20} />
        </button>
      </div>

      {/* Center Large Album Art */}
      <div className="flex-1 flex items-center justify-center py-6">
        <AlbumArt
          coverArt={currentSong.coverArt}
          title={currentSong.title}
          artist={currentSong.artist}
          className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl shadow-2xl shadow-black/80 flex-shrink-0"
          iconSize={80}
        />
      </div>

      {/* Song Details & Like */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col min-w-0 pr-4">
          <h2 className="text-xl font-bold text-white truncate">{currentSong.title}</h2>
          <p className="text-sm text-tune-textSecondary truncate mt-0.5">{currentSong.artist}</p>
        </div>

        <button
          onClick={() => toggleLikeSong(currentSong)}
          className="p-2 transition rounded-full hover:scale-110 flex-shrink-0"
          style={{ color: isLiked ? accentColor : '#b3b3b3' }}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Waveform Seek Bar */}
      <div className="mb-4">
        <WaveformSeekBar accentColor={accentColor} />
      </div>

      {/* Full Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
      <div className="flex items-center justify-center mb-6">
        <PlaybackControls />
      </div>

      {/* Bottom Features Action Bar (Lyrics, EQ, Speed, Queue) */}
      <div className="flex items-center justify-around pt-3 border-t border-tune-border/40 pb-2">
        <button
          onClick={() => {
            onClose();
            onOpenLyrics();
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            isLyricsOpen ? 'text-tune-accent font-bold' : 'text-tune-textSecondary hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 size={20} />
          <span>Lyrics</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenEq();
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            isEqOpen ? 'text-tune-accent font-bold' : 'text-tune-textSecondary hover:text-white'
          }`}
          title="Equalizer"
        >
          <Sliders size={20} />
          <span>Equalizer</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-tune-textSecondary">
          <SpeedSelector accentColor={accentColor} />
          <span>Speed</span>
        </div>

        <button
          onClick={() => {
            onClose();
            toggleQueue();
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            isQueueOpen ? 'text-tune-accent font-bold' : 'text-tune-textSecondary hover:text-white'
          }`}
          title="Play Queue"
        >
          <ListMusic size={20} />
          <span>Queue</span>
        </button>
      </div>
    </div>
  );
};
