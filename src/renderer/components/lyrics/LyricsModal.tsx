import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { fetchLyrics, LyricLine } from '../../utils/lyricsService';
import { AlbumArt } from '../shared/AlbumArt';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#1db954'
}) => {
  const { currentSong, currentTime, seek } = usePlayerStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !currentSong) return;

    let isMounted = true;
    setIsLoading(true);

    fetchLyrics(currentSong.id, currentSong.title, currentSong.artist, currentSong.duration).then(
      (lines) => {
        if (isMounted) {
          setLyrics(lines);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentSong]);

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll active line into center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background ambient album art glow */}
      {currentSong?.coverArt && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl pointer-events-none scale-125"
          style={{ backgroundImage: `url(${currentSong.coverArt})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-2xl h-[85vh] flex flex-col bg-tune-surface/90 border border-tune-border/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-tune-border/50">
          <div className="flex items-center gap-3">
            {currentSong && (
              <AlbumArt
                coverArt={currentSong.coverArt}
                title={currentSong.title}
                className="w-10 h-10 rounded-lg flex-shrink-0 shadow"
                iconSize={16}
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {currentSong?.title || 'Lyrics'}
              </span>
              <span className="text-xs text-tune-textSecondary truncate">
                {currentSong?.artist}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tune-elevated text-xs font-semibold" style={{ color: accentColor }}>
              <Mic2 size={14} />
              <span>Synced Lyrics</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-tune-textMuted hover:text-white rounded-full hover:bg-tune-elevated transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Lyrics Scrollable Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-8 py-16 space-y-7 text-center select-none scroll-smooth"
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-tune-textMuted gap-3">
              <RefreshCw size={24} className="animate-spin text-tune-accent" />
              <span className="text-sm">Fetching synchronized lyrics...</span>
            </div>
          ) : lyrics.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-tune-textMuted gap-2">
              <Mic2 size={36} className="text-tune-border" />
              <p className="text-sm font-semibold text-white">No lyrics available</p>
              <p className="text-xs text-tune-textMuted max-w-xs">
                Could not find synchronized lyrics for this song. You can drop a .lrc file in the same folder.
              </p>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.time)}
                  className={`transition-all duration-300 cursor-pointer font-bold leading-relaxed px-4 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-2xl sm:text-3xl text-white scale-105'
                      : isPast
                      ? 'text-lg sm:text-xl text-neutral-400 hover:text-white'
                      : 'text-lg sm:text-xl text-neutral-600 hover:text-neutral-400'
                  }`}
                  style={isActive ? { textShadow: `0 0 25px ${accentColor}80`, color: '#ffffff' } : {}}
                >
                  {line.text}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
