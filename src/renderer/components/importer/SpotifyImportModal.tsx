import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, XCircle, ArrowRight, Music2, RefreshCw } from 'lucide-react';
import { Song, SpotifyPlaylistResult } from '@/types/music';
import { matchSpotifyTracks, MatchResult } from '../../utils/songMatcher';
import { usePlaylistStore } from '../../store/playlistStore';
import { useLibraryStore } from '../../store/libraryStore';
import { backButtonService } from '../../services/backButtonService';

interface SpotifyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  localSongs: Song[];
}

export const SpotifyImportModal: React.FC<SpotifyImportModalProps> = ({
  isOpen,
  onClose,
  localSongs
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playlistResult, setPlaylistResult] = useState<SpotifyPlaylistResult | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const { createPlaylist, addSongToPlaylist } = usePlaylistStore();
  const { setActiveView } = useLibraryStore();

  useEffect(() => {
    if (!isOpen) return;
    return backButtonService.register(onClose);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFetchAndMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !window.tuneAPI) return;

    setIsLoading(true);
    setErrorMsg(null);
    setPlaylistResult(null);
    setMatches([]);

    try {
      const data = await window.tuneAPI.fetchSpotifyPlaylist(urlInput.trim());
      setPlaylistResult(data);

      const matchedResults = matchSpotifyTracks(data.tracks, localSongs);
      setMatches(matchedResults);
    } catch (err: unknown) {
      console.error('Spotify import error:', err);
      const message = err instanceof Error ? err.message : 'Failed to import playlist.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPlaylist = () => {
    if (!playlistResult) return;

    const matchedSongs = matches
      .filter((m) => m.isMatched && m.matchedSong)
      .map((m) => m.matchedSong!.id);

    if (matchedSongs.length === 0) {
      setErrorMsg('No matching songs found in your offline library. Please add corresponding local audio files first.');
      return;
    }

    const newPlaylist = createPlaylist(
      `${playlistResult.name} (Offline)`,
      `Imported from Spotify with ${matchedSongs.length} offline tracks.`
    );

    matchedSongs.forEach((songId) => {
      addSongToPlaylist(newPlaylist.id, songId);
    });

    setActiveView('playlist', newPlaylist.id);
    handleClose();
  };

  const handleClose = () => {
    setUrlInput('');
    setErrorMsg(null);
    setPlaylistResult(null);
    setMatches([]);
    onClose();
  };

  const matchedCount = matches.filter((m) => m.isMatched).length;
  const matchPercent = matches.length > 0 ? Math.round((matchedCount / matches.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-tune-surface border border-tune-border/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-tune-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1db954] flex items-center justify-center text-black font-black text-xl shadow-md shadow-[#1db954]/20">
              🎧
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Spotify Playlist</h2>
              <p className="text-xs text-tune-textSecondary">
                Paste any public link to match tracks against your downloaded library
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-tune-textMuted hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleFetchAndMatch} className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tune-textMuted pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                className="w-full pl-9 pr-4 py-2.5 bg-tune-elevated rounded-xl text-xs text-white placeholder-tune-textMuted border border-tune-border focus:border-[#1db954] focus:outline-none transition font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-xs transition flex items-center gap-2 shadow-md shadow-[#1db954]/20 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <span>Scan & Match</span>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs text-red-400 bg-red-950/40 border border-red-800/40 px-3 py-2 rounded-lg">
              {errorMsg}
            </p>
          )}
        </form>

        {/* Results Container */}
        {playlistResult && (
          <div className="flex-1 flex flex-col min-h-0 border-t border-tune-border">
            {/* Matching Summary Dashboard */}
            <div className="px-6 py-3.5 bg-tune-elevated/60 border-b border-tune-border flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block truncate">
                  {playlistResult.name}
                </span>
                <span className="text-xs text-tune-textSecondary">
                  Found <strong className="text-[#1db954] font-semibold">{matchedCount}</strong> of{' '}
                  <strong>{matches.length}</strong> songs ({matchPercent}%) offline
                </span>
              </div>

              <button
                onClick={handleImportPlaylist}
                disabled={matchedCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs transition shadow-md"
              >
                <span>Import {matchedCount} Songs</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Track Matching List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {matches.map((item, idx) => (
                <div
                  key={`${item.spotifyTrack.title}-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                    item.isMatched
                      ? 'bg-tune-elevated/80 border-[#1db954]/30'
                      : 'bg-tune-surface/40 border-tune-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    {item.isMatched ? (
                      <CheckCircle2 size={18} className="text-[#1db954] flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-tune-textMuted flex-shrink-0" />
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${item.isMatched ? 'text-white' : 'text-neutral-400'}`}>
                        {item.spotifyTrack.title}
                      </span>
                      <span className="text-[11px] text-tune-textMuted truncate">
                        {item.spotifyTrack.artist}
                      </span>
                    </div>
                  </div>

                  {item.isMatched && item.matchedSong && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#1db954] font-mono flex-shrink-0">
                      <Music2 size={13} />
                      <span className="truncate max-w-[160px]">{item.matchedSong.title}</span>
                    </div>
                  )}

                  {!item.isMatched && (
                    <span className="text-[10px] text-tune-textMuted uppercase tracking-wider font-semibold">
                      Missing Offline
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

