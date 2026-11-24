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

  const isPlaylistsActive =
    activeView === 'playlists' || activeView === 'playlist' || activeView.startsWith('smart-');

  return (
    <nav className="md:hidden flex items-center justify-around bg-tune-surface/98 backdrop-blur-lg border-t border-tune-border py-2 px-1 z-30 flex-shrink-0">
      <button
        onClick={() => setActiveView('library')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'library' ? 'text-white font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <Home size={19} className="text-white" />
        <span>Library</span>
      </button>

      <div className="flex items-center">
        <button
          onClick={() => setActiveView('playlists')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            isPlaylistsActive ? 'text-white font-bold' : 'text-tune-textSecondary'
          }`}
        >
          <ListMusic size={19} className="text-white" />
          <span>Playlists</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewPlaylistModal();
          }}
          className="p-1 -ml-1 text-white hover:text-tune-accent transition"
          title="Create New Playlist"
        >
          <Plus size={14} className="text-white" />
        </button>
      </div>

      <button
        onClick={() => setActiveView('folders')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'folders' ? 'text-white font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <FolderTree size={19} className="text-white" />
        <span>Folders</span>
      </button>

      <button
        onClick={() => setActiveView('liked')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'liked' ? 'text-white font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <Heart size={19} className="text-white" fill={activeView === 'liked' ? 'white' : 'none'} />
        <span>Liked</span>
      </button>

      <button
        onClick={onOpenSpotifyModal}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-tune-textSecondary hover:text-white transition"
      >
        <FolderDown size={19} className="text-white" />
        <span>Import</span>
      </button>
    </nav>
  );
};
