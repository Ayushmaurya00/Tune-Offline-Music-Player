import React, { useState } from 'react';
import { Home, FolderDown, Heart, Plus, FolderOpen, Music2, Trash2, FolderTree, Keyboard } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { ConfirmModal } from '../shared/ConfirmModal';
import { BrandLogo } from '../shared/BrandLogo';
import { Playlist } from '@/types/music';

interface SidebarProps {
  onOpenNewPlaylistModal: () => void;
  onOpenSpotifyModal: () => void;
  onSelectFolder: () => void;
  onOpenScanSummary?: () => void;
  onOpenShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewPlaylistModal,
  onOpenSpotifyModal,
  onSelectFolder,
  onOpenScanSummary,
  onOpenShortcuts
}) => {
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const { activeView, selectedPlaylistId, setActiveView, watchedFolderPath, songs } = useLibraryStore();
  const { playlists, deletePlaylist } = usePlaylistStore();

  return (
    <aside className="hidden md:flex w-64 bg-tune-surface flex-col h-full border-r border-tune-border select-none flex-shrink-0">
      {/* App Branding */}
      <div className="p-5">
        <BrandLogo size={36} showText />
      </div>

      {/* Main Navigation */}
      <div className="px-3 space-y-1">
        <button
          onClick={() => setActiveView('library')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            activeView === 'library'
              ? 'bg-tune-elevated text-white'
              : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/50'
          }`}
        >
          <Home size={18} />
          <span>Library</span>
          <span className="ml-auto text-xs text-tune-textMuted font-mono">{songs.length}</span>
        </button>

        <button
          onClick={() => setActiveView('liked')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            activeView === 'liked'
              ? 'bg-tune-elevated text-white'
              : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/50'
          }`}
        >
          <Heart size={18} className="text-tune-accent" />
          <span>Liked Songs</span>
        </button>

        <button
          onClick={() => setActiveView('folders')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            activeView === 'folders'
              ? 'bg-tune-elevated text-white'
              : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/50'
          }`}
        >
          <FolderTree size={18} className="text-amber-400" />
          <span>Folder Mode</span>
        </button>

        <button
          onClick={() => setActiveView('playlists')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            activeView === 'playlists' || activeView === 'playlist'
              ? 'bg-tune-elevated text-white'
              : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/50'
          }`}
        >
          <Music2 size={18} className="text-tune-accent" />
          <span>Playlists</span>
          <span className="ml-auto text-xs text-tune-textMuted font-mono">{playlists.length}</span>
        </button>
      </div>

      {/* Watched Directory Status */}
      <div className="mt-4 px-4 py-3 mx-3 bg-tune-elevated/60 border border-tune-border rounded-xl">
        <div className="flex items-center justify-between text-xs font-semibold text-tune-textMuted uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1.5">
            <FolderDown size={14} className="text-tune-accent" />
            Watched Folder
          </span>
          <div className="flex items-center gap-2">
            {onOpenScanSummary && (
              <button
                onClick={onOpenScanSummary}
                className="text-[11px] text-tune-accent hover:underline lowercase font-normal"
                title="View scan summary and library diagnostics"
              >
                summary
              </button>
            )}
            <button
              onClick={onSelectFolder}
              className="text-[11px] text-tune-textMuted hover:text-white lowercase font-normal"
              title="Change watched directory"
            >
              change
            </button>
          </div>
        </div>
        <p className="text-xs text-tune-textSecondary truncate font-mono" title={watchedFolderPath}>
          {watchedFolderPath ? watchedFolderPath.split('\\').pop() || watchedFolderPath : 'Downloads'}
        </p>
      </div>

      {/* Playlists Section Header */}
      <div className="mt-6 px-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-tune-textMuted uppercase tracking-wider">
          Playlists
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSpotifyModal}
            className="px-2 py-0.5 rounded text-[11px] font-semibold text-[#1db954] bg-[#1db954]/10 hover:bg-[#1db954]/20 transition flex items-center gap-1"
            title="Import Spotify Playlist"
          >
            <span>+ Spotify</span>
          </button>

          <button
            onClick={onOpenNewPlaylistModal}
            className="p-1 rounded-md text-tune-textSecondary hover:text-white hover:bg-tune-elevated transition"
            title="Create Playlist"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Playlists List */}
      <div className="mt-2 flex-1 overflow-y-auto px-3 space-y-0.5">
        {playlists.length === 0 ? (
          <div className="px-3 py-4 text-xs text-tune-textMuted text-center">
            No playlists yet. Click + to create one!
          </div>
        ) : (
          playlists.map((playlist) => {
            const isSelected = activeView === 'playlist' && selectedPlaylistId === playlist.id;
            return (
              <div
                key={playlist.id}
                onClick={() => setActiveView('playlist', playlist.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                  isSelected
                    ? 'bg-tune-elevated text-white font-medium'
                    : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Music2 size={16} className={isSelected ? 'text-tune-accent' : 'text-tune-textMuted'} />
                  <span className="truncate">{playlist.name}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaylistToDelete(playlist);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-tune-textMuted hover:text-red-400 transition"
                  title="Delete playlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Open Custom Folder Button & Pro Shortcuts */}
      <div className="p-3 border-t border-tune-border space-y-2">
        <button
          onClick={onSelectFolder}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-tune-elevated hover:bg-tune-card text-xs font-medium text-tune-textSecondary hover:text-white border border-tune-border transition"
        >
          <FolderOpen size={15} />
          <span>Scan Custom Folder</span>
        </button>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-tune-textMuted hover:text-white hover:bg-tune-elevated/40 transition"
            title="View Keyboard Shortcuts Cheatsheet (?)"
          >
            <span className="flex items-center gap-1.5">
              <Keyboard size={13} className="text-tune-accent" />
              <span>Shortcuts</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[10px] font-mono text-tune-textSecondary border border-tune-border">
              ?
            </kbd>
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(playlistToDelete)}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlistToDelete?.name}"? Your local music files will remain safe.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={() => {
          if (playlistToDelete) {
            deletePlaylist(playlistToDelete.id);
            setPlaylistToDelete(null);
          }
        }}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </aside>
  );
};

