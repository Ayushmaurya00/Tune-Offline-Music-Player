import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  CornerDownRight,
  PlusCircle,
  FolderPlus,
  Folder,
  Trash2,
  ChevronRight,
  Music2,
  Plus
} from 'lucide-react';
import { Song, Playlist } from '@/types/music';

interface SongContextMenuProps {
  x: number;
  y: number;
  song: Song;
  playlists: Playlist[];
  onClose: () => void;
  onPlay: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist?: () => void;
  onShowInFolder?: () => void;
  onDelete?: () => void;
}

export const SongContextMenu: React.FC<SongContextMenuProps> = ({
  x,
  y,
  song,
  playlists,
  onClose,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onCreatePlaylist,
  onShowInFolder,
  onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);

  // Position clamping to keep inside viewport
  const menuWidth = 220;
  const menuHeight = 290;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 16);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(12, clampedX)}px`, top: `${Math.max(12, clampedY)}px` }}
      className="fixed z-50 w-56 bg-[#161616]/95 backdrop-blur-md border border-[#2b2b2b] rounded-xl shadow-2xl p-1.5 text-xs text-white select-none animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Info */}
      <div className="px-2.5 py-1.5 border-b border-[#262626] mb-1">
        <p className="font-semibold text-white truncate text-[11px]">{song.title}</p>
        <p className="text-[10px] text-tune-textMuted truncate">{song.artist}</p>
      </div>

      {/* Main Play Actions */}
      <button
        onClick={() => {
          onPlay();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-tune-card hover:text-tune-accent transition text-left"
      >
        <Play size={14} className="text-tune-accent fill-tune-accent" />
        <span>Play Now</span>
      </button>

      <button
        onClick={() => {
          onPlayNext();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-tune-card hover:text-white transition text-left"
      >
        <CornerDownRight size={14} className="text-tune-textMuted" />
        <span>Play Next</span>
      </button>

      <button
        onClick={() => {
          onAddToQueue();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-tune-card hover:text-white transition text-left"
      >
        <PlusCircle size={14} className="text-tune-textMuted" />
        <span>Add to Queue</span>
      </button>

      {/* Playlist Cascading Submenu */}
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylists(true)}
        onMouseLeave={() => setShowPlaylists(false)}
      >
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-tune-card hover:text-white transition text-left">
          <div className="flex items-center gap-2.5">
            <FolderPlus size={14} className="text-tune-textMuted" />
            <span>Add to Playlist</span>
          </div>
          <ChevronRight size={12} className="text-tune-textMuted" />
        </button>

        {showPlaylists && (
          <div className="absolute left-full top-0 ml-1 w-48 bg-[#1a1a1a] border border-[#2f2f2f] rounded-xl shadow-xl p-1.5 max-h-48 overflow-y-auto">
            {onCreatePlaylist && (
              <button
                onClick={() => {
                  onCreatePlaylist();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-tune-accent hover:bg-tune-accent/15 transition text-left text-[11px] font-semibold mb-1 border-b border-[#2f2f2f]"
              >
                <Plus size={12} />
                <span>+ Create Playlist</span>
              </button>
            )}

            {playlists.length === 0 ? (
              <div className="px-2.5 py-2 text-[11px] text-tune-textMuted text-center">No playlists yet</div>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    onAddToPlaylist(pl.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-tune-card hover:text-tune-accent transition text-left text-[11px] truncate"
                >
                  <Music2 size={12} className="text-tune-textMuted flex-shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="my-1 border-t border-[#262626]" />

      {/* Show in Explorer */}
      {onShowInFolder && (
        <button
          onClick={() => {
            onShowInFolder();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-tune-card hover:text-white transition text-left"
        >
          <Folder size={14} className="text-tune-textMuted" />
          <span>Show in Folder</span>
        </button>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 hover:text-red-300 transition text-left mt-0.5"
        >
          <Trash2 size={14} />
          <span>Delete from Disk</span>
        </button>
      )}
    </div>
  );
};

