import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { backButtonService } from '../../services/backButtonService';
import { fetchLyrics, LyricLine } from '../../utils/lyricsService';
import { triggerHaptic } from '../../utils/haptics';

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
  accentColor = '#1ed760',
  onOpenLyrics,
  onOpenEq,
  onOpenSleepTimer,
  isLyricsOpen,
  isEqOpen
}) => {
  const { currentSong, toggleQueue, isQueueOpen, nextTrack, prevTrack, currentTime } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();
  const timerState = sleepTimerService.getState();

  // Touch Swipe Gesture State for Album Art
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Live Lyrics State
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) return;
    return backButtonService.register(onClose);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) {
      setLyricsLines([]);
      return;
    }

    let isMounted = true;
    fetchLyrics(currentSong.id, currentSong.title, currentSong.artist, currentSong.duration).then((lines) => {
      if (isMounted) {
        setLyricsLines(lines);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id, currentSong?.title, currentSong?.artist, currentSong?.duration]);

  // Calculate active lyrics line
  useEffect(() => {
    if (!lyricsLines.length) {
      setCurrentLineIndex(-1);
      return;
    }

    let activeIdx = -1;
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    setCurrentLineIndex(activeIdx);
  }, [currentTime, lyricsLines]);

  if (!isOpen || !currentSong) return null;

  const isLiked = isSongLiked(currentSong.id);

  // Touch gesture handlers for horizontal swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    // Prevent horizontal drag if user is predominantly scrolling vertically
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 15) {
      return;
    }

    const clampedOffset = Math.max(-120, Math.min(120, deltaX));
    setDragOffset(clampedOffset);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (dragOffset < -50) {
      // Swiped left -> skip forward
      triggerHaptic('medium');
      nextTrack();
    } else if (dragOffset > 50) {
      // Swiped right -> skip back
      triggerHaptic('medium');
      prevTrack();
    }

    setDragOffset(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-tune-bg/98 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none animate-in slide-in-from-bottom duration-300 overflow-y-auto"
    >
      <div className="w-full max-w-md md:max-w-lg mx-auto flex flex-col justify-between h-full min-h-[520px]">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onClose();
            }}
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
              triggerHaptic('light');
              onClose();
              onOpenSleepTimer();
            }}
            className={`p-2 transition ${timerState.isActive ? 'text-tune-accent' : 'text-tune-textSecondary hover:text-white'}`}
            title="Sleep Timer"
          >
            <Moon size={20} />
          </button>
        </div>

        {/* Center Large Album Art with Horizontal Swipe-to-Skip Gesture */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex items-center justify-center py-4 cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isSwiping ? 'none' : 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          title="Swipe left or right to switch tracks"
        >
          <AlbumArt
            coverArt={currentSong.coverArt}
            title={currentSong.title}
            artist={currentSong.artist}
            className="w-64 h-64 sm:w-80 sm:h-80 max-h-[38vh] max-w-[38vh] aspect-square rounded-2xl shadow-2xl shadow-black/80 flex-shrink-0 select-none pointer-events-none"
            iconSize={80}
          />
        </div>

        {/* Song Details & Like */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex flex-col min-w-0 pr-4">
            <h2 className="text-xl font-bold text-white truncate">{currentSong.title}</h2>
            <p className="text-sm text-tune-textSecondary truncate mt-0.5">{currentSong.artist}</p>
          </div>

          <button
            onClick={() => {
              triggerHaptic(isLiked ? 'light' : 'success');
              toggleLikeSong(currentSong);
            }}
            className="p-2 transition rounded-full hover:scale-110 flex-shrink-0"
            style={{ color: isLiked ? accentColor : '#b3b3b3' }}
            title={isLiked ? 'Liked' : 'Like'}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Waveform Seek Bar */}
        <div className="mb-3">
          <WaveformSeekBar accentColor={accentColor} />
        </div>

        {/* Full Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-center mb-4">
          <PlaybackControls />
        </div>

        {/* In-Player Live Synced Lyrics Card */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onClose();
            onOpenLyrics();
          }}
          className="mb-4 p-3.5 rounded-2xl bg-tune-surface/90 hover:bg-tune-surface border border-tune-border/60 cursor-pointer transition active:scale-[0.98] shadow-lg flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-tune-accent">
              <Mic2 size={13} />
              <span className="uppercase tracking-wider text-[10px]">Live Lyrics</span>
            </div>
            <span className="text-[10px] text-tune-textMuted group-hover:text-white transition">
              Tap for full screen ↗
            </span>
          </div>

          {lyricsLines.length > 0 && currentLineIndex >= 0 ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white transition-all line-clamp-1">
                {lyricsLines[currentLineIndex].text}
              </p>
              {currentLineIndex + 1 < lyricsLines.length && (
                <p className="text-xs text-tune-textMuted line-clamp-1">
                  {lyricsLines[currentLineIndex + 1].text}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-tune-textSecondary italic">
              {lyricsLines.length > 0
                ? 'Intro playing...'
                : 'Tap to view synced karaoke lyrics'}
            </p>
          )}
        </div>

        {/* Bottom Features Action Bar (Lyrics, EQ, Speed, Queue) */}
        <div className="flex items-center justify-around pt-3 border-t border-tune-border/40 pb-2">
          <button
            onClick={() => {
              triggerHaptic('light');
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
              triggerHaptic('light');
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
              triggerHaptic('light');
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
    </div>,
    document.body
  );
};
