import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, Check, Music2, Calendar, Disc, User, FileText } from 'lucide-react';
import { Song, TagSuggestion } from '@/types/music';
import { backButtonService } from '../../services/backButtonService';
import { triggerHaptic } from '../../utils/haptics';
import { fetchMetadataSuggestions, saveTagOverride } from '../../services/tagOverrideService';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { mediaSessionService } from '../../services/mediaSession';
import { AlbumArt } from '../shared/AlbumArt';

interface TagEditorModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
}

export const TagEditorModal: React.FC<TagEditorModalProps> = ({
  isOpen,
  song,
  onClose
}) => {
  const { updateSong } = useLibraryStore();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState<string>('');
  const [coverArt, setCoverArt] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!song || !isOpen) return;
    setTitle(song.title || '');
    setArtist(song.artist || '');
    setAlbum(song.album || '');
    setGenre(song.genre || '');
    setYear(song.year ? String(song.year) : '');
    setCoverArt(song.coverArt || null);
    setSuggestions([]);
    setHasSearched(false);
  }, [song, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    return backButtonService.register(onClose);
  }, [isOpen, onClose]);

  if (!isOpen || !song) return null;

  const handleFetchSuggestions = async () => {
    const query = `${title || song.title} ${artist !== 'Unknown Artist' ? artist : ''}`.trim();
    if (!query) return;

    setIsLoadingSuggestions(true);
    setHasSearched(true);
    triggerHaptic('light');

    try {
      const results = await fetchMetadataSuggestions(query);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (sug: TagSuggestion) => {
    setTitle(sug.title);
    setArtist(sug.artist);
    setAlbum(sug.album);
    setGenre(sug.genre);
    if (sug.year) setYear(String(sug.year));
    if (sug.coverArt) setCoverArt(sug.coverArt);
    triggerHaptic('selection');
  };

  const handleSave = () => {
    const parsedYear = year.trim() ? parseInt(year.trim(), 10) : null;
    const updatedFields: Partial<Song> = {
      title: title.trim() || song.title,
      artist: artist.trim() || 'Unknown Artist',
      album: album.trim() || 'Unknown Album',
      genre: genre.trim() || undefined,
      year: isNaN(parsedYear as number) ? null : parsedYear,
      coverArt: coverArt || song.coverArt
    };

    saveTagOverride(song.id, updatedFields);
    updateSong(song.id, updatedFields);

    // Sync with player if this track is currently loaded
    const playerState = usePlayerStore.getState();
    if (playerState.currentSong?.id === song.id) {
      const mergedCurrent = { ...playerState.currentSong, ...updatedFields };
      usePlayerStore.setState({ currentSong: mergedCurrent });
      mediaSessionService.updateMetadata(mergedCurrent, playerState.isPlaying);
    }

    triggerHaptic('success');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-tune-surface border border-tune-border rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-tune-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tune-elevated text-tune-accent flex items-center justify-center shadow">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Edit Song Info</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-tune-elevated text-tune-textSecondary border border-tune-border">
                  ID3 Tags
                </span>
              </h2>
              <p className="text-xs text-tune-textSecondary truncate max-w-[280px] sm:max-w-md">
                {song.fileName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-tune-textMuted hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Top Banner with Album Art Preview & Auto-Fetch Button */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-tune-elevated/40 border border-tune-border">
            <AlbumArt
              coverArt={coverArt || song.coverArt}
              title={title || song.title}
              artist={artist || song.artist}
              className="w-16 h-16 rounded-xl shadow-md flex-shrink-0"
              iconSize={24}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block">Auto-Fetch Metadata</span>
              <p className="text-[11px] text-tune-textSecondary mt-0.5">
                Automatically retrieve official track tags and high-res cover art from iTunes catalog
              </p>
            </div>
            <button
              onClick={handleFetchSuggestions}
              disabled={isLoadingSuggestions}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tune-accent hover:bg-tune-accentHover disabled:opacity-50 text-black text-xs font-bold transition shadow-md flex-shrink-0"
            >
              <Sparkles size={14} />
              <span>{isLoadingSuggestions ? 'Searching...' : 'Auto-Match'}</span>
            </button>
          </div>

          {/* Suggested Matches Results (if searched) */}
          {hasSearched && (
            <div className="p-3.5 rounded-2xl bg-tune-card border border-tune-border space-y-2">
              <span className="text-[11px] font-bold text-tune-textMuted uppercase tracking-wider block">
                Found Matches (Tap to apply)
              </span>
              {suggestions.length === 0 ? (
                <p className="text-xs text-tune-textMuted italic py-1">No exact match found in online catalog.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {suggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => handleApplySuggestion(sug)}
                      className="p-2 rounded-xl bg-tune-elevated/60 hover:bg-tune-elevated border border-tune-border/60 hover:border-tune-accent cursor-pointer transition flex items-center gap-2.5"
                    >
                      {sug.coverArt ? (
                        <img src={sug.coverArt} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Music2 size={14} className="text-tune-textMuted" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{sug.title}</p>
                        <p className="text-[10px] text-tune-textSecondary truncate">{sug.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-tune-textSecondary mb-1.5">
                <Music2 size={13} className="text-tune-accent" />
                <span>Track Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full px-3.5 py-2.5 rounded-xl bg-tune-elevated/60 border border-tune-border text-white text-xs focus:outline-none focus:border-tune-accent"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-tune-textSecondary mb-1.5">
                <User size={13} className="text-tune-accent" />
                <span>Artist</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-tune-elevated/60 border border-tune-border text-white text-xs focus:outline-none focus:border-tune-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-tune-textSecondary mb-1.5">
                  <Disc size={13} className="text-tune-accent" />
                  <span>Album</span>
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Album Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-tune-elevated/60 border border-tune-border text-white text-xs focus:outline-none focus:border-tune-accent"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-tune-textSecondary mb-1.5">
                  <FileText size={13} className="text-tune-accent" />
                  <span>Genre</span>
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Pop, Rock, Electronic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-tune-elevated/60 border border-tune-border text-white text-xs focus:outline-none focus:border-tune-accent"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2 pr-0 sm:pr-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-tune-textSecondary mb-1.5">
                <Calendar size={13} className="text-tune-accent" />
                <span>Release Year</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full px-3.5 py-2.5 rounded-xl bg-tune-elevated/60 border border-tune-border text-white text-xs focus:outline-none focus:border-tune-accent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tune-border bg-tune-surface flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-tune-textSecondary hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-lg"
          >
            <Check size={15} />
            <span>Save Tags</span>
          </button>
        </div>
      </div>
    </div>
  );
};
