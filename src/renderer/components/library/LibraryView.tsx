import React, { useState } from 'react';
import { FolderDown, RefreshCw, FolderOpen, Music, BarChart2, ChevronDown } from 'lucide-react';
import { Song } from '@/types/music';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { SortFilterBar } from './SortFilterBar';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { PlaylistDetailView } from '../playlist/PlaylistDetailView';
import { PlaylistsView } from '../playlist/PlaylistsView';
import { FolderView } from '../folders/FolderView';
import { ConfirmModal } from '../shared/ConfirmModal';

interface LibraryViewProps {
  onScanFolder: (path?: string, showPopup?: boolean) => Promise<void>;
  onSelectFolderDialog: () => Promise<void>;
  onSelectFilesDialog: () => Promise<void>;
  onOpenScanSummary: () => void;
  onOpenNewPlaylistModal: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onScanFolder,
  onSelectFolderDialog,
  onSelectFilesDialog,
  onOpenScanSummary,
  onOpenNewPlaylistModal
}) => {
  const [isGridView, setIsGridView] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
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

  const handleDeleteSong = (song: Song) => {
    setSongToDelete(song);
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete) return;
    const targetSong = songToDelete;
    setSongToDelete(null);

    if (window.tuneAPI) {
      const ok = await window.tuneAPI.deleteSongFile(targetSong.filePath);
      if (ok) {
        removeSong(targetSong.filePath);
      }
    } else {
      removeSong(targetSong.filePath);
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

  if (activeView === 'smart-most-played') {
    return <PlaylistDetailView smartType="most-played" allSongs={songs} />;
  }

  if (activeView === 'smart-recently-added') {
    return <PlaylistDetailView smartType="recently-added" allSongs={songs} />;
  }

  if (activeView === 'smart-recently-played') {
    return <PlaylistDetailView smartType="recently-played" allSongs={songs} />;
  }

  if (activeView === 'playlists') {
    return (
      <PlaylistsView
        allSongs={songs}
        onOpenNewPlaylistModal={onOpenNewPlaylistModal}
      />
    );
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
        onDelete={handleDeleteSong}
        onShowInFolder={handleShowInFolder}
        onChangeFolder={onSelectFolderDialog}
        onRefresh={() => onScanFolder(undefined, true)}
        onOpenScanSummary={onOpenScanSummary}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Mobile Compact Dropdown Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-tune-border/40 bg-tune-surface/80 backdrop-blur-md select-none">
        <button
          onClick={() => setIsHeaderDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-lg active:bg-tune-elevated transition text-left"
          title="Toggle library details dropdown"
        >
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <span>Offline Library</span>
            <ChevronDown
              size={16}
              className={`text-tune-textMuted transition-transform duration-200 ${
                isHeaderDropdownOpen ? 'rotate-180 text-tune-accent' : ''
              }`}
            />
          </h1>
          <span className="text-[11px] font-mono text-tune-textMuted">
            ({sortedSongs.length})
          </span>
          {isLoading && <RefreshCw size={13} className="animate-spin text-tune-accent ml-1" />}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onScanFolder(undefined, true)}
            disabled={isLoading}
            className="p-2 text-tune-textSecondary hover:text-white rounded-lg active:bg-tune-elevated transition"
            title="Refresh Library"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onOpenScanSummary}
            className="p-2 text-tune-textSecondary hover:text-white rounded-lg active:bg-tune-elevated transition"
            title="Scan Summary"
          >
            <BarChart2 size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isHeaderDropdownOpen && (
        <div className="md:hidden p-3.5 mx-3 mt-2 rounded-xl bg-tune-elevated/95 border border-tune-border shadow-2xl animate-in slide-in-from-top-2 duration-150 space-y-3 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-tune-textMuted tracking-wider">
              Music Directory
            </span>
            <button
              onClick={() => {
                setIsHeaderDropdownOpen(false);
                onSelectFolderDialog();
              }}
              className="text-xs text-tune-accent hover:underline lowercase font-medium"
            >
              change folder
            </button>
          </div>
          <p className="text-xs font-mono text-white truncate bg-tune-card/90 px-2.5 py-1.5 rounded-lg border border-tune-border/50">
            {watchedFolderPath ? watchedFolderPath : 'Downloads'}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsHeaderDropdownOpen(false);
                onOpenScanSummary();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-tune-card hover:bg-tune-elevated text-xs font-semibold text-white border border-tune-border transition active:scale-95"
            >
              <BarChart2 size={14} className="text-white" />
              <span>Scan Summary</span>
            </button>

            <button
              onClick={() => {
                setIsHeaderDropdownOpen(false);
                onScanFolder(undefined, true);
              }}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-tune-card hover:bg-tune-elevated text-xs font-semibold text-white border border-tune-border transition active:scale-95"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Rescan</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header Bar */}
      <div className="hidden md:flex p-6 pb-2 items-center justify-between gap-3 app-drag-region">
        <div className="flex flex-col app-no-drag">
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

        <div className="flex items-center gap-2 app-no-drag">
          {/* Custom Pop-up Button: Scan Summary */}
          <button
            onClick={onOpenScanSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-tune-textSecondary hover:text-white border border-tune-border transition shadow-sm hover:border-tune-accent"
            title="Open Scan Summary & Library Diagnostics"
          >
            <BarChart2 size={14} className="text-white" />
            <span>Scan Summary</span>
          </button>

          <button
            onClick={() => onScanFolder(undefined, true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-tune-elevated hover:bg-tune-card text-xs font-medium text-tune-textSecondary hover:text-white border border-tune-border transition shadow-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <SortFilterBar isGridView={isGridView} setIsGridView={setIsGridView} />

      <div className="flex-1 overflow-y-auto p-6">
        {sortedSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-tune-elevated flex items-center justify-center text-white mb-4 border border-tune-border">
              <FolderDown size={32} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-white">No audio files found</h3>
            <p className="text-xs text-tune-textMuted max-w-sm mt-1.5 leading-relaxed">
              Drop MP3, WAV, FLAC, or M4A files anywhere into this window, or pick from below:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <button
                onClick={onSelectFolderDialog}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-lg shadow-tune-accent/25 hover:scale-105 active:scale-95"
              >
                <FolderOpen size={16} />
                <span>Choose Music Folder</span>
              </button>

              <button
                onClick={onSelectFilesDialog}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-tune-elevated hover:bg-tune-card text-white text-xs font-semibold border border-tune-border transition hover:border-tune-accent active:scale-95"
              >
                <Music size={16} />
                <span>Select Audio Files</span>
              </button>
            </div>
          </div>
        ) : isGridView ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                playlistContext={sortedSongs}
                onDelete={handleDeleteSong}
              />
            ))}
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

            {sortedSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                index={idx}
                song={song}
                playlistContext={sortedSongs}
                onDelete={handleDeleteSong}
                onShowInFolder={handleShowInFolder}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(songToDelete)}
        title="Delete Audio File"
        message={`Are you sure you want to move "${songToDelete?.title}" to the Recycle Bin? This will delete the local file from disk.`}
        confirmText="Move to Trash"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDeleteSong}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};
