import React from 'react';
import { Home, FolderTree, Heart, Sparkles, FolderDown } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

interface MobileNavProps {
  onOpenWrapped: () => void;
  onOpenSpotifyModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenWrapped,
  onOpenSpotifyModal
}) => {
  const { activeView, setActiveView } = useLibraryStore();

  return (
    <nav className="md:hidden flex items-center justify-around bg-tune-surface/98 backdrop-blur-lg border-t border-tune-border py-2 px-1 z-30">
      <button
        onClick={() => setActiveView('library')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
          activeView === 'library' ? 'text-tune-accent font-bold' : 'text-tune-textSecondary'
        }`}
      >
        <Home size={19} />
        <span>Library</span>
      </button>

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

      <button
        onClick={onOpenWrapped}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-tune-textSecondary hover:text-white transition"
      >
        <Sparkles size={19} className="text-amber-400" />
        <span>Wrapped</span>
      </button>
    </nav>
  );
};

