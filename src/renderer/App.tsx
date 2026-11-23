import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './components/library/LibraryView';
import { QueuePanel } from './components/queue/QueuePanel';
import { NewPlaylistModal } from './components/playlist/NewPlaylistModal';
import { useLibraryStore } from './store/libraryStore';
import { usePlayerStore } from './store/playerStore';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setSongs, addSong, removeSong, setWatchedFolder, setIsLoading, watchedFolderPath } =
    useLibraryStore();
  const { togglePlay, nextTrack, prevTrack, seek, currentTime } = usePlayerStore();

  const handleScan = useCallback(
    async (targetPath?: string) => {
      if (!window.tuneAPI) return;

      setIsLoading(true);
      try {
        const folder = targetPath || watchedFolderPath || (await window.tuneAPI.getDownloadsPath());
        setWatchedFolder(folder);

        const scannedSongs = await window.tuneAPI.scanFolder(folder);
        setSongs(scannedSongs);

        // Start live watching
        await window.tuneAPI.startWatching(folder);
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [watchedFolderPath, setIsLoading, setWatchedFolder, setSongs]
  );

  const handleSelectFolder = async () => {
    if (!window.tuneAPI) return;
    const selected = await window.tuneAPI.selectFolderDialog();
    if (selected) {
      await handleScan(selected);
    }
  };

  // Keyboard Shortcuts Listener (Space for play/pause, Arrows for seek/skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        seek(currentTime + 10);
      } else if (e.code === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        seek(Math.max(0, currentTime - 10));
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        nextTrack();
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        prevTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, seek, currentTime]);

  // Initial Scan on Mount & File Watcher Listeners
  useEffect(() => {
    handleScan();

    if (window.tuneAPI) {
      const unsubAdd = window.tuneAPI.onFileAdded((newSong) => {
        addSong(newSong);
      });

      const unsubRemove = window.tuneAPI.onFileRemoved((removedPath) => {
        removeSong(removedPath);
      });

      return () => {
        unsubAdd();
        unsubRemove();
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-tune-bg text-white overflow-hidden select-none">
      {/* Top Application Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onOpenNewPlaylistModal={() => setIsModalOpen(true)}
          onSelectFolder={handleSelectFolder}
        />

        {/* Central Library & Views */}
        <main className="flex-1 flex flex-col bg-tune-bg overflow-hidden">
          <LibraryView
            onScanFolder={() => handleScan()}
            onSelectFolderDialog={handleSelectFolder}
          />
        </main>

        {/* Right Play Queue Panel (Collapsible) */}
        <QueuePanel />
      </div>

      {/* Bottom Fixed Player Bar */}
      <PlayerBar />

      {/* Create Playlist Modal */}
      <NewPlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default App;

