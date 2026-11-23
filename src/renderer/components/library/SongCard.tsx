import React from 'react';
import { Play, Pause, Heart, PlusCircle, Trash2 } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration } from '../../utils/formatters';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
  onDelete?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playlistContext,
  onDelete
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();

  const isCurrent = currentSong?.id === song.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isLiked = isSongLiked(song.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative p-3 rounded-xl bg-tune-elevated/40 hover:bg-tune-card/80 border border-tune-border/40 hover:border-tune-border transition-all duration-200 cursor-pointer flex flex-col ${
        isCurrent ? 'border-tune-accent/50 bg-tune-elevated' : ''
      }`}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 shadow-md">
        <AlbumArt
          coverArt={song.coverArt}
          title={song.title}
          artist={song.artist}
          className="w-full h-full object-cover"
          iconSize={40}
        />

        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-tune-accent text-black flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
            isPlayingThis ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
          }`}
          title={isPlayingThis ? 'Pause' : 'Play'}
        >
          {isPlayingThis ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeSong(song);
          }}
          className={`absolute top-2 left-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm transition ${
            isLiked ? 'text-tune-accent opacity-100' : 'text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110'
          }`}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-tune-accent' : 'text-white'}`}>
          {song.title}
        </span>
        <span className="text-xs text-tune-textSecondary truncate mt-0.5">
          {song.artist}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-tune-border/40 text-[11px] text-tune-textMuted">
        <span className="font-mono">{formatDuration(song.duration)}</span>

        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToQueue(song);
            }}
            className="p-1 text-tune-textSecondary hover:text-white"
            title="Add to Queue"
          >
            <PlusCircle size={15} />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(song);
              }}
              className="p-1 text-tune-textSecondary hover:text-red-400"
              title="Delete File"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
