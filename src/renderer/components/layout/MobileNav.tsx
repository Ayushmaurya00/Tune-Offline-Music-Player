import React from 'react';
import { Home, ListMusic, FolderTree, Heart, FolderDown } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

interface MobileNavProps {
  onOpenSpotifyModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenSpotifyModal
}) => {
  const { activeView, setActiveView } = useLibraryStore();

  const isPlaylistsActive =
    activeView === 'playlists' || activeView === 'playlist' || activeView.startsWith('smart-');

  return (
    <nav aria-label="Primary navigation" className="md:hidden h-16 flex items-center justify-around bg-black border-t border-[#282828] py-2 px-1 z-30 flex-shrink-0">
      <button
        type="button"
        aria-current={activeView === 'library' ? 'page' : undefined}
        onClick={() => setActiveView('library')}
        className={`min-h-12 flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] font-medium transition ${
          activeView === 'library' ? 'text-white font-bold' : 'text-tune-textSecondary active:bg-tune-elevated'
        }`}
      >
        <Home size={20} aria-hidden="true" />
        <span>Library</span>
      </button>

      <button
        type="button"
        aria-current={isPlaylistsActive ? 'page' : undefined}
        onClick={() => setActiveView('playlists')}
        className={`min-h-12 flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] font-medium transition ${
          isPlaylistsActive ? 'text-white font-bold' : 'text-tune-textSecondary active:bg-tune-elevated'
        }`}
      >
        <ListMusic size={20} aria-hidden="true" />
        <span>Playlists</span>
      </button>

      <button
        type="button"
        aria-current={activeView === 'folders' ? 'page' : undefined}
        onClick={() => setActiveView('folders')}
        className={`min-h-12 flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] font-medium transition ${
          activeView === 'folders' ? 'text-white font-bold' : 'text-tune-textSecondary active:bg-tune-elevated'
        }`}
      >
        <FolderTree size={20} aria-hidden="true" />
        <span>Folders</span>
      </button>

      <button
        type="button"
        aria-current={activeView === 'liked' ? 'page' : undefined}
        onClick={() => setActiveView('liked')}
        className={`min-h-12 flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] font-medium transition ${
          activeView === 'liked' ? 'text-white font-bold' : 'text-tune-textSecondary active:bg-tune-elevated'
        }`}
      >
        <Heart size={20} aria-hidden="true" fill={activeView === 'liked' ? 'currentColor' : 'none'} />
        <span>Liked</span>
      </button>

      <button
        type="button"
        onClick={onOpenSpotifyModal}
        className="min-h-12 flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] font-medium text-tune-textSecondary active:bg-tune-elevated transition"
      >
        <FolderDown size={20} aria-hidden="true" />
        <span>Import</span>
      </button>
    </nav>
  );
};
