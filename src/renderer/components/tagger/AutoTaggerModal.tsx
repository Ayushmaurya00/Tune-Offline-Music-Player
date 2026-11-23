import React, { useState, useEffect } from 'react';
import { X, Wand2, Search, Check, Sparkles, RefreshCw, Disc } from 'lucide-react';
import { Song, TagSuggestion } from '@/types/music';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';

interface AutoTaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export const AutoTaggerModal: React.FC<AutoTaggerModalProps> = ({
  isOpen,
  onClose,
  song
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const { updateSong } = useLibraryStore();
  const { currentSong, playSong } = usePlayerStore();

  useEffect(() => {
    if (!song || !isOpen) return;

    const initialQuery = song.title || song.fileName.replace(/\.[^/.]+$/, '');
    setSearchTerm(initialQuery);
    handleSearch(initialQuery);
  }, [song, isOpen]);

  const handleSearch = async (query: string) => {
    if (!query.trim() || !window.tuneAPI) return;

    setIsLoading(true);
    try {
      const results = await window.tuneAPI.suggestMetadata(query.trim());
      setSuggestions(results);
      setSelectedIdx(0);
    } catch (err) {
      console.warn('Auto-tag search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!song || suggestions.length === 0 || selectedIdx >= suggestions.length) return;

    const selected = suggestions[selectedIdx];
    const updatedFields: Partial<Song> = {
      title: selected.title,
      artist: selected.artist,
      album: selected.album,
      genre: selected.genre,
      year: selected.year,
      coverArt: selected.coverArt || song.coverArt
    };

    updateSong(song.id, updatedFields);

    // If currently playing, update in player
    if (currentSong && currentSong.id === song.id) {
      playSong({ ...song, ...updatedFields });
    }

    onClose();
  };

  if (!isOpen || !song) return null;

  const currentSelection = suggestions[selectedIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-tune-surface border border-tune-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-tune-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shadow">
              <Wand2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Metadata Fixer</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Auto-Tag
                </span>
              </h2>
              <p className="text-xs text-tune-textSecondary">
                Clean and enhance raw offline track details with high-res artwork
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

        {/* Search Bar */}
        <div className="p-6 pb-3 border-b border-tune-border/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchTerm);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tune-textMuted pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search song title or artist..."
                className="w-full pl-9 pr-4 py-2 bg-tune-elevated rounded-xl text-xs text-white placeholder-tune-textMuted border border-tune-border focus:border-purple-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Main Comparison Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Current vs Match Banner */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current */}
            <div className="p-4 rounded-xl bg-tune-elevated/40 border border-tune-border">
              <span className="text-[10px] font-bold text-tune-textMuted uppercase tracking-wider block mb-2">
                Current Local Tags
              </span>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-tune-textMuted">Title:</span>{' '}
                  <span className="text-white font-medium">{song.title}</span>
                </div>
                <div>
                  <span className="text-tune-textMuted">Artist:</span>{' '}
                  <span className="text-white font-medium">{song.artist}</span>
                </div>
                <div>
                  <span className="text-tune-textMuted">Album:</span>{' '}
                  <span className="text-tune-textSecondary">{song.album}</span>
                </div>
                <div className="truncate text-tune-textMuted font-mono text-[11px] pt-1">
                  {song.fileName}
                </div>
              </div>
            </div>

            {/* Suggested Preview */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                <span>AI Suggested Match</span>
              </span>

              {currentSelection ? (
                <div className="flex gap-3 items-center">
                  {currentSelection.coverArt ? (
                    <img
                      src={currentSelection.coverArt}
                      alt={currentSelection.title}
                      className="w-14 h-14 rounded-lg object-cover shadow border border-tune-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                      <Disc size={20} />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 text-xs space-y-0.5">
                    <span className="text-white font-bold truncate">
                      {currentSelection.title}
                    </span>
                    <span className="text-purple-300 truncate">
                      {currentSelection.artist}
                    </span>
                    <span className="text-tune-textMuted text-[11px] truncate">
                      {currentSelection.album} {currentSelection.year ? `(${currentSelection.year})` : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-tune-textMuted py-3 text-center">
                  {isLoading ? 'Finding matches...' : 'No suggestions available.'}
                </div>
              )}
            </div>
          </div>

          {/* Suggestions List */}
          <div>
            <span className="text-xs font-bold text-white block mb-2">
              Select Best Match ({suggestions.length} found)
            </span>

            <div className="space-y-2">
              {suggestions.map((sug, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <div
                    key={`${sug.title}-${sug.artist}-${idx}`}
                    onClick={() => setSelectedIdx(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500 text-white shadow-md'
                        : 'bg-tune-elevated/30 border-tune-border/50 text-tune-textSecondary hover:bg-tune-elevated/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-3">
                      {sug.coverArt ? (
                        <img
                          src={sug.coverArt}
                          alt={sug.title}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center text-neutral-500 flex-shrink-0">
                          <Disc size={16} />
                        </div>
                      )}

                      <div className="truncate">
                        <span className={`font-semibold block truncate ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                          {sug.title}
                        </span>
                        <span className="text-[11px] text-tune-textMuted truncate">
                          {sug.artist} • {sug.album}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sug.genre && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-tune-card text-tune-textMuted">
                          {sug.genre}
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <Check size={13} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tune-border flex items-center justify-end gap-3 bg-tune-elevated/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-tune-textSecondary hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!currentSelection}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md"
          >
            <Check size={15} />
            <span>Apply Selected Metadata</span>
          </button>
        </div>
      </div>
    </div>
  );
};

