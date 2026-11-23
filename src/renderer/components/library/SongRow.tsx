import React from 'react';
import { Play, Pause, Heart, PlusCircle, Trash2, Folder } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration, formatDate } from '../../utils/formatters';

interface SongRowProps {
  index: number;
  song: Song;
  playlistContext?: Song[];
  onDelete?: (song: Song) => void;
  onShowInFolder?: (song: Song) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  index,
  song,
  playlistContext,
  onDelete,
  onShowInFolder
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();

  const isCurrent = currentSong?.id === song.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isLiked = isSongLiked(song.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group grid grid-cols-[36px_minmax(200px,2fr)_minmax(120px,1.5fr)_minmax(100px,1fr)_80px_100px] items-center px-4 py-2.5 rounded-lg text-xs cursor-pointer select-none transition ${
        isCurrent ? 'bg-tune-elevated text-tune-accent font-medium' : 'hover:bg-tune-card/60 text-tune-textSecondary'
      }`}
    >
      <div className="flex items-center justify-start text-tune-textMuted font-mono">
        <span className="group-hover:hidden">{isCurrent && isPlaying ? '▶' : index + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
          className="hidden group-hover:flex items-center justify-center text-white"
        >
          {isPlayingThis ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>
      </div>

      <div className="flex items-center gap-3 min-w-0 pr-3">
        <AlbumArt
          coverArt={song.coverArt}
          title={song.title}
          className="w-10 h-10 rounded flex-shrink-0"
          iconSize={16}
        />
        <div className="flex flex-col min-w-0">
          <span className={`text-sm truncate font-medium ${isCurrent ? 'text-tune-accent' : 'text-white'}`}>
            {song.title}
          </span>
          <span className="text-[11px] text-tune-textMuted truncate">{song.artist}</span>
        </div>
      </div>

      <div className="truncate text-tune-textMuted pr-3">{song.album}</div>

      <div className="truncate text-tune-textMuted font-mono text-[11px]">
        {formatDate(song.fileModified || song.dateAdded)}
      </div>

      <div className="text-tune-textMuted font-mono">{formatDuration(song.duration)}</div>

      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleLikeSong(song)}
          className={`p-1 transition rounded-full hover:scale-110 ${
            isLiked ? 'text-tune-accent' : 'text-tune-textMuted hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={() => addToQueue(song)}
          className="p-1 text-tune-textMuted hover:text-white opacity-0 group-hover:opacity-100 transition"
          title="Add to queue"
        >
          <PlusCircle size={15} />
        </button>

        {onShowInFolder && (
          <button
            onClick={() => onShowInFolder(song)}
            className="p-1 text-tune-textMuted hover:text-white opacity-0 group-hover:opacity-100 transition"
            title="Show in folder"
          >
            <Folder size={15} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(song)}
            className="p-1 text-tune-textMuted hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
            title="Delete file"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
