import React from 'react';
import { Home, ListMusic, Plus, FolderTree, Heart, FolderDown } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

interface MobileNavProps {
  onOpenSpotifyModal: () => void;
  onOpenNewPlaylistModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenSpotifyModal,
  onOpenNewPlaylistModal
}) => {
  const { activeView, setActiveView } = useLibraryStore();

  const isPlaylistsActive = activeView === 'playlists' || activeView === 'playlist';

  return (
    <nav className="md:hidden flex items-center justify-around bg-tune-surface/98 backdrop-blur-lg border-t border-tune-border py-2 px-1 z-30 flex-shrink-0">
      <button
        onClick={() => setActiveView('library')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'library' ? 'text-tune-accent font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <Home size={19} />
        <span>Library</span>
      </button>

      <div className="flex items-center">
        <button
          onClick={() => setActiveView('playlists')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            isPlaylistsActive ? 'text-tune-accent font-bold' : 'text-tune-textSecondary'
          }`}
        >
          <ListMusic size={19} />
          <span>Playlists</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewPlaylistModal();
          }}
          className="p-1 -ml-1 text-tune-textMuted hover:text-tune-accent transition"
          title="Create New Playlist"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={() => setActiveView('folders')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'folders' ? 'text-tune-accent font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <FolderTree size={19} />
        <span>Folders</span>
      </button>

      <button
        onClick={() => setActiveView('liked')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'liked' ? 'text-tune-accent font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <Heart size={19} fill={activeView === 'liked' ? 'currentColor' : 'none'} />
        <span>Liked</span>
      </button>

      <button
        onClick={onOpenSpotifyModal}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-tune-textSecondary hover:text-white transition"
      >
        <FolderDown size={19} />
        <span>Import</span>
      </button>
    </nav>
  );
};
