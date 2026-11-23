import React, { useState } from 'react';
import { FolderDown, RefreshCw, FolderOpen } from 'lucide-react';
import { Song } from '@/types/music';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { SortFilterBar } from './SortFilterBar';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { PlaylistDetailView } from '../playlist/PlaylistDetailView';
import { FolderView } from '../folders/FolderView';

interface LibraryViewProps {
  onScanFolder: (path?: string, showPopup?: boolean) => Promise<void>;
  onSelectFolderDialog: () => Promise<void>;
  onAutoTag?: (song: Song) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onScanFolder,
  onSelectFolderDialog,
  onAutoTag
}) => {
  const [isGridView, setIsGridView] = useState(false);
  const {
    songs,
    isLoading,
    activeView,
    selectedPlaylistId,
    watchedFolderPath,
    getFilteredAndSortedSongs,
    removeSong
  } = useLibraryStore();
  const { playlists } = usePlaylistStore();

  const sortedSongs = getFilteredAndSortedSongs();

  const handleDeleteSong = async (song: Song) => {
    const confirm = window.confirm(`Move "${song.title}" to Recycle Bin?`);
    if (!confirm) return;

    if (window.tuneAPI) {
      const ok = await window.tuneAPI.deleteSongFile(song.filePath);
      if (ok) {
        removeSong(song.filePath);
      }
    }
  };

  const handleShowInFolder = async (song: Song) => {
    if (window.tuneAPI) {
      await window.tuneAPI.showInFolder(song.filePath);
    }
  };

  if (activeView === 'liked') {
    return <PlaylistDetailView isLikedView allSongs={songs} />;
  }

  if (activeView === 'playlist' && selectedPlaylistId) {
    const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
    return <PlaylistDetailView playlist={currentPlaylist} allSongs={songs} />;
  }

  if (activeView === 'folders') {
    return (
      <FolderView
        songs={songs}
        rootPath={watchedFolderPath || ''}
        onAutoTag={onAutoTag}
        onDelete={handleDeleteSong}
        onShowInFolder={handleShowInFolder}
        onChangeFolder={onSelectFolderDialog}
        onRefresh={() => onScanFolder(undefined, true)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Offline Library</span>
            {isLoading && <RefreshCw size={18} className="animate-spin text-tune-accent" />}
          </h1>
          <p className="text-xs text-tune-textSecondary mt-0.5">
            Auto-synced from{' '}
            <span className="font-mono text-tune-accent">
              {watchedFolderPath ? watchedFolderPath : 'Downloads'}
            </span>
          </p>
        </div>

        <button
          onClick={() => onScanFolder(undefined, true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-tune-elevated hover:bg-tune-card text-xs font-medium text-tune-textSecondary hover:text-white border border-tune-border transition shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <SortFilterBar isGridView={isGridView} setIsGridView={setIsGridView} />

      <div className="flex-1 overflow-y-auto p-6">
        {sortedSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-tune-elevated flex items-center justify-center text-tune-accent mb-4 border border-tune-border">
              <FolderDown size={32} />
            </div>
            <h3 className="text-base font-semibold text-white">No audio files found</h3>
            <p className="text-xs text-tune-textMuted max-w-sm mt-1.5 leading-relaxed">
              Drop MP3, MP4, WAV, or FLAC files into your Downloads folder, or select another directory on your PC.
            </p>
            <button
              onClick={onSelectFolderDialog}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-semibold transition shadow-md"
            >
              <FolderOpen size={16} />
              <span>Choose Custom Music Folder</span>
            </button>
          </div>
        ) : isGridView ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={sortedSongs}
                onDelete={handleDeleteSong}
                onAutoTag={onAutoTag}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[36px_minmax(200px,2fr)_minmax(120px,1.5fr)_minmax(100px,1fr)_80px_100px] px-4 py-2 text-[11px] font-semibold text-tune-textMuted uppercase border-b border-tune-border/40 select-none">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Date</span>
              <span>Time</span>
              <span className="text-right">Actions</span>
            </div>

            {sortedSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                index={idx}
                song={song}
                playlistContext={sortedSongs}
                onDelete={handleDeleteSong}
                onShowInFolder={handleShowInFolder}
                onAutoTag={onAutoTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
