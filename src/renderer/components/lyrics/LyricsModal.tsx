import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, RefreshCw, ChevronDown, Edit3, Upload, Check, RotateCcw } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import {
  fetchLyrics,
  LyricLine,
  saveCustomLyrics,
  getCustomLyricsRaw,
  clearCustomLyrics
} from '../../utils/lyricsService';
import { AlbumArt } from '../shared/AlbumArt';
import { backButtonService } from '../../services/backButtonService';
import { triggerHaptic } from '../../utils/haptics';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editorText, setEditorText] = useState('');
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Register with Android / Browser back button service
  useEffect(() => {
    if (!isOpen) return;
    if (isEditing) {
      return backButtonService.register(() => setIsEditing(false));
    }
    return backButtonService.register(onClose);
  }, [isOpen, isEditing, onClose]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, onClose]);

  useEffect(() => {
    if (!isOpen || !currentSong) return;

    let isMounted = true;
    setIsLoading(true);
    setIsEditing(false);

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

  const handleOpenEditor = () => {
    if (!currentSong) return;
    const existingRaw = getCustomLyricsRaw(currentSong.id);
    if (existingRaw) {
      setEditorText(existingRaw);
    } else if (lyrics.length > 0) {
      // Format lines back to LRC-like or text
      const lrcRepresentation = lyrics.map((l) => {
        const mins = Math.floor(l.time / 60);
        const secs = (l.time % 60).toFixed(2);
        return `[${String(mins).padStart(2, '0')}:${secs.padStart(5, '0')}] ${l.text}`;
      }).join('\n');
      setEditorText(lrcRepresentation);
    } else {
      setEditorText('');
    }
    setIsEditing(true);
    triggerHaptic('light');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setEditorText(content);
        triggerHaptic('selection');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCustomLyrics = () => {
    if (!currentSong) return;
    const parsed = saveCustomLyrics(currentSong.id, editorText, currentSong.duration);
    setLyrics(parsed);
    setIsEditing(false);
    triggerHaptic('success');
  };

  const handleRevertToOnline = async () => {
    if (!currentSong) return;
    clearCustomLyrics(currentSong.id);
    setIsLoading(true);
    setIsEditing(false);
    triggerHaptic('medium');

    const lines = await fetchLyrics(
      currentSong.id,
      currentSong.title,
      currentSong.artist,
      currentSong.duration
    );
    setLyrics(lines);
    setIsLoading(false);
  };

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Background ambient album art glow */}
      {currentSong?.coverArt && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl pointer-events-none scale-125"
          style={{ backgroundImage: `url(${currentSong.coverArt})` }}
        />
      )}

      {/* Main Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full sm:h-[85vh] flex flex-col bg-tune-surface/98 sm:bg-tune-surface/90 border-0 sm:border border-tune-border/60 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-tune-border/50 flex-shrink-0 z-10 bg-tune-surface/95 backdrop-blur-md">
          {/* Left: Mobile Collapse Button + Album Art + Song Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 text-white hover:text-tune-accent transition rounded-full flex-shrink-0 active:scale-90"
              title="Close Lyrics"
            >
              <ChevronDown size={28} />
            </button>

            {currentSong && (
              <AlbumArt
                coverArt={currentSong.coverArt}
                title={currentSong.title}
                className="w-10 h-10 rounded-lg flex-shrink-0 shadow"
                iconSize={16}
              />
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-white truncate">
                {currentSong?.title || 'Lyrics'}
              </span>
              <span className="text-xs text-tune-textSecondary truncate">
                {currentSong?.artist}
              </span>
            </div>
          </div>

          {/* Right: Edit Lyrics Button + Synced Lyrics Badge + Close Cross Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleOpenEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-white transition border border-tune-border/60"
              title="Add or Edit Custom Lyrics"
            >
              <Edit3 size={13} className="text-tune-accent" />
              <span className="hidden sm:inline">Edit Lyrics</span>
            </button>

            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-tune-elevated text-xs font-semibold"
              style={{ color: accentColor }}
            >
              <Mic2 size={14} />
              <span>Synced Lyrics</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition flex-shrink-0 shadow active:scale-95 border border-white/15"
              title="Close Lyrics"
              aria-label="Close Lyrics"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Lyrics Body: Editor View or Karaoke View */}
        {isEditing ? (
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-tune-surface">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Custom Lyrics Editor</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-tune-elevated text-tune-accent">
                    Synced .LRC / Plain
                  </span>
                </h3>
                <p className="text-xs text-tune-textSecondary">
                  Paste synchronized LRC lines (e.g. [01:23.45] lyric) or plain lyrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".lrc,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-white transition border border-tune-border"
                >
                  <Upload size={13} />
                  <span>Upload .LRC</span>
                </button>
              </div>
            </div>

            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder="[00:12.30] Example synchronized lyrics line...&#10;[00:15.80] Or paste plain song lyrics line by line"
              className="flex-1 w-full p-4 rounded-2xl bg-tune-elevated/50 border border-tune-border text-white text-xs font-mono resize-none focus:outline-none focus:border-tune-accent leading-relaxed"
            />

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-tune-border">
              <button
                onClick={handleRevertToOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-tune-textMuted hover:text-white transition"
              >
                <RotateCcw size={13} />
                <span>Reset to Online</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-tune-textSecondary hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomLyrics}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-lg"
                >
                  <Check size={14} />
                  <span>Save & Sync</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-10 sm:py-16 space-y-6 sm:space-y-7 text-center select-none scroll-smooth"
          >
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-tune-textMuted gap-3">
                <RefreshCw size={24} className="animate-spin text-tune-accent" />
                <span className="text-sm">Fetching synchronized lyrics...</span>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-tune-textMuted gap-3">
                <Mic2 size={36} className="text-tune-border" />
                <p className="text-sm font-semibold text-white">No lyrics available</p>
                <p className="text-xs text-tune-textMuted max-w-xs">
                  Could not find synchronized lyrics online for this song.
                </p>
                <button
                  onClick={handleOpenEditor}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-md active:scale-95"
                >
                  <Edit3 size={14} />
                  <span>Paste or Upload Lyrics</span>
                </button>
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
        )}
      </div>
    </div>
  );
};
