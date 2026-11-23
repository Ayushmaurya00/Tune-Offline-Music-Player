import React from 'react';
import { Play, Shuffle, Heart, Music } from 'lucide-react';
import { Song, Playlist } from '@/types/music';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { SongRow } from '../library/SongRow';
import { formatDuration } from '../../utils/formatters';

interface PlaylistDetailViewProps {
  isLikedView?: boolean;
  playlist?: Playlist;
  allSongs: Song[];
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  isLikedView = false,
  playlist,
  allSongs
}) => {
  const { playSong } = usePlayerStore();
  const { likedSongIds, removeSongFromPlaylist } = usePlaylistStore();

  let songs: Song[] = [];
  let title = 'Playlist';
  let description = '';

  if (isLikedView) {
    title = 'Liked Songs';
    description = 'Your favorite offline tracks in one place';
    songs = allSongs.filter((s) => likedSongIds.has(s.id));
  } else if (playlist) {
    title = playlist.name;
    description = playlist.description || 'Custom Playlist';
    songs = playlist.songIds
      .map((id: string) => allSongs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
  }

  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="p-4 sm:p-8 bg-gradient-to-b from-neutral-800/80 to-transparent flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left border-b border-tune-border/40">
        <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl bg-gradient-to-br from-tune-card to-neutral-800 border border-tune-border shadow-2xl flex items-center justify-center flex-shrink-0 text-tune-accent">
          {isLikedView ? <Heart size={48} className="sm:w-16 sm:h-16" fill="currentColor" /> : <Music size={48} className="sm:w-16 sm:h-16" />}
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs uppercase font-bold tracking-widest text-tune-textMuted">
            {isLikedView ? 'Auto Playlist' : 'Playlist'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight truncate">
            {title}
          </h1>
          {description && <p className="text-xs text-tune-textSecondary">{description}</p>}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-tune-textMuted font-mono mt-1">
            <span>{songs.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)} total</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-4 flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-12 h-12 rounded-full bg-tune-accent hover:bg-tune-accentHover disabled:opacity-40 text-black flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
          title="Play All"
        >
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>

        <button
          onClick={handleShufflePlay}
          disabled={songs.length === 0}
          className="p-3 text-tune-textSecondary hover:text-white rounded-full hover:bg-tune-elevated transition"
          title="Shuffle Play"
        >
          <Shuffle size={20} />
        </button>
      </div>

      <div className="px-4 sm:px-8 pb-12 flex-1">
        {songs.length === 0 ? (
          <div className="py-16 text-center text-tune-textMuted text-xs">
            No songs in this playlist yet. Browse your library and add some!
          </div>
        ) : (
          <div className="space-y-1">
            <div className="hidden md:grid grid-cols-[36px_minmax(200px,2fr)_minmax(120px,1.5fr)_minmax(100px,1fr)_80px_100px] px-4 py-2 text-[11px] font-semibold text-tune-textMuted uppercase border-b border-tune-border/40 select-none">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Date</span>
              <span>Time</span>
              <span className="text-right">Actions</span>
            </div>

            {songs.map((song, idx) => (
              <SongRow
                key={song.id}
                index={idx}
                song={song}
                playlistContext={songs}
                onDelete={
                  playlist
                    ? () => removeSongFromPlaylist(playlist.id, song.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
