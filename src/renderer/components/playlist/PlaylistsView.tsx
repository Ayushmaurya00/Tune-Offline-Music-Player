import React, { useState } from 'react';
import { Plus, Music, Play, Trash2, ListMusic } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { Song, Playlist } from '@/types/music';
import { formatDuration } from '../../utils/formatters';
import { ConfirmModal } from '../shared/ConfirmModal';

interface PlaylistsViewProps {
  onOpenNewPlaylistModal: () => void;
  allSongs: Song[];
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  onOpenNewPlaylistModal,
  allSongs
}) => {
  const { playlists, deletePlaylist } = usePlaylistStore();
  const { setActiveView } = useLibraryStore();
  const { playSong } = usePlayerStore();
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const songs = playlist.songIds
      .map((id) => allSongs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));

    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const getPlaylistDuration = (playlist: Playlist) => {
    const songs = playlist.songIds
      .map((id) => allSongs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
    return songs.reduce((acc, s) => acc + s.duration, 0);
  };

  const confirmDelete = () => {
    if (playlistToDelete) {
      deletePlaylist(playlistToDelete.id);
      setPlaylistToDelete(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tune-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListMusic className="text-tune-accent" size={24} />
            <span>Your Playlists</span>
          </h1>
          <p className="text-xs text-tune-textSecondary mt-0.5">
            Organize offline tracks into personal collections
          </p>
        </div>

        <button
          onClick={onOpenNewPlaylistModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-md shadow-tune-accent/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-tune-elevated flex items-center justify-center text-tune-accent mb-4 border border-tune-border">
              <Music size={32} />
            </div>
            <h3 className="text-base font-semibold text-white">No playlists yet</h3>
            <p className="text-xs text-tune-textMuted max-w-sm mt-1.5 leading-relaxed">
              Create your first offline playlist to group tracks by genre, mood, or artist.
            </p>
            <button
              onClick={onOpenNewPlaylistModal}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-lg shadow-tune-accent/25 active:scale-95"
            >
              <Plus size={16} />
              <span>Create Playlist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist) => {
              const duration = getPlaylistDuration(playlist);
              return (
                <div
                  key={playlist.id}
                  onClick={() => setActiveView('playlist', playlist.id)}
                  className="group relative p-4 rounded-2xl bg-tune-elevated/40 hover:bg-tune-card/80 border border-tune-border/50 hover:border-tune-accent/50 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tune-card to-neutral-800 border border-tune-border flex items-center justify-center text-tune-accent flex-shrink-0">
                      <Music size={22} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handlePlayPlaylist(playlist, e)}
                        disabled={playlist.songIds.length === 0}
                        className="w-8 h-8 rounded-full bg-tune-accent text-black flex items-center justify-center shadow transition hover:scale-110 active:scale-95 disabled:opacity-30"
                        title="Play Playlist"
                      >
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(playlist);
                        }}
                        className="p-1.5 text-tune-textMuted hover:text-red-400 transition rounded-lg"
                        title="Delete Playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-tune-accent transition">
                      {playlist.name}
                    </h3>
                    {playlist.description && (
                      <p className="text-[11px] text-tune-textSecondary truncate mt-0.5">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-tune-textMuted font-mono mt-3 pt-2.5 border-t border-tune-border/40">
                    <span>{playlist.songIds.length} tracks</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(playlistToDelete)}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlistToDelete?.name}"? Offline audio files will not be deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};
