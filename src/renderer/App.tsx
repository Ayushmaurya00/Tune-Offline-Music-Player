import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './components/library/LibraryView';
import { QueuePanel } from './components/queue/QueuePanel';
import { NewPlaylistModal } from './components/playlist/NewPlaylistModal';
import { LyricsModal } from './components/lyrics/LyricsModal';
import { SpotifyImportModal } from './components/importer/SpotifyImportModal';
import { TuneWrappedModal } from './components/wrapped/TuneWrappedModal';
import { AutoTaggerModal } from './components/tagger/AutoTaggerModal';
import { EqualizerModal } from './components/player/EqualizerModal';
import { SleepTimerModal } from './components/player/SleepTimerModal';
import { MiniPlayerView } from './components/player/MiniPlayerView';
import { useLibraryStore } from './store/libraryStore';
import { usePlayerStore } from './store/playerStore';
import { extractDominantColor } from './utils/colorExtractor';
import { recordSongPlay } from './utils/statsTracker';
import { Song } from '@/types/music';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [taggerSong, setTaggerSong] = useState<Song | null>(null);
  const [accentColor, setAccentColor] = useState('#1db954');
  const [ambientGradient, setAmbientGradient] = useState(
    'radial-gradient(ellipse at top, rgba(29, 185, 84, 0.12) 0%, transparent 70%)'
  );

  const { songs, setSongs, addSong, removeSong, setWatchedFolder, setIsLoading, watchedFolderPath } =
    useLibraryStore();
  const { currentSong, togglePlay, nextTrack, prevTrack, seek, currentTime } = usePlayerStore();

  // Dynamic Album Art Palette Extraction & Stats Tracking
  useEffect(() => {
    if (!currentSong) {
      setAccentColor('#1db954');
      setAmbientGradient('radial-gradient(ellipse at top, rgba(29, 185, 84, 0.12) 0%, transparent 70%)');
      return;
    }

    recordSongPlay(currentSong);

    extractDominantColor(currentSong.coverArt).then((palette) => {
      setAccentColor(palette.primaryHex);
      setAmbientGradient(palette.ambientGradient);
    });
  }, [currentSong]);

  const handleScan = useCallback(
    async (targetPath?: string) => {
      if (!window.tuneAPI) return;

      setIsLoading(true);
      try {
        const folder = targetPath || watchedFolderPath || (await window.tuneAPI.getDownloadsPath());
        setWatchedFolder(folder);

        const scannedSongs = await window.tuneAPI.scanFolder(folder);
        setSongs(scannedSongs);

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

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.code === 'KeyL') {
        setIsLyricsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, seek, currentTime]);

  const handleToggleMiniPlayer = async () => {
    if (window.tuneAPI) {
      const active = await window.tuneAPI.toggleMiniPlayer();
      setIsMiniPlayer(active);
    }
  };

  // Initial Scan on Mount & File Watcher / OS Event Listeners
  useEffect(() => {
    handleScan();

    if (window.tuneAPI) {
      const unsubAdd = window.tuneAPI.onFileAdded((newSong) => {
        addSong(newSong);
      });

      const unsubRemove = window.tuneAPI.onFileRemoved((removedPath) => {
        removeSong(removedPath);
      });

      const unsubMedia = window.tuneAPI.onMediaKey((action) => {
        if (action === 'play-pause') togglePlay();
        else if (action === 'next') nextTrack();
        else if (action === 'prev') prevTrack();
      });

      const unsubMini = window.tuneAPI.onMiniPlayerChanged((mini) => {
        setIsMiniPlayer(mini);
      });

      return () => {
        unsubAdd();
        unsubRemove();
        unsubMedia();
        unsubMini();
      };
    }
  }, [togglePlay, nextTrack, prevTrack]);

  if (isMiniPlayer) {
    return (
      <MiniPlayerView
        onExpand={handleToggleMiniPlayer}
        accentColor={accentColor}
      />
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-screen bg-tune-bg text-white overflow-hidden select-none">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out z-0"
        style={{ background: ambientGradient }}
      />

      {/* Top Application Body */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onOpenNewPlaylistModal={() => setIsModalOpen(true)}
          onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
          onOpenWrapped={() => setIsWrappedOpen(true)}
          onSelectFolder={handleSelectFolder}
        />

        {/* Central Library & Views */}
        <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
          <LibraryView
            onScanFolder={() => handleScan()}
            onSelectFolderDialog={handleSelectFolder}
            onAutoTag={(song) => setTaggerSong(song)}
          />
        </main>

        {/* Right Play Queue Panel (Collapsible) */}
        <QueuePanel />
      </div>

      {/* Bottom Fixed Player Bar with Waveform & Lyrics */}
      <PlayerBar
        accentColor={accentColor}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        isLyricsOpen={isLyricsOpen}
        onOpenEq={() => setIsEqOpen(true)}
        isEqOpen={isEqOpen}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onToggleMiniPlayer={handleToggleMiniPlayer}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        onOpenWrapped={() => setIsWrappedOpen(true)}
        onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
      />

      {/* Create Playlist Modal */}
      <NewPlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Spotify Playlist Importer Modal */}
      <SpotifyImportModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        localSongs={songs}
      />

      {/* Synced Karaoke Lyrics Modal */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        accentColor={accentColor}
      />

      {/* Tune Wrapped Modal */}
      <TuneWrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        allSongs={songs}
      />

      {/* AI Metadata Auto-Tagger Modal */}
      <AutoTaggerModal
        isOpen={Boolean(taggerSong)}
        onClose={() => setTaggerSong(null)}
        song={taggerSong}
      />

      {/* 10-Band Equalizer & Crossfade Modal */}
      <EqualizerModal
        isOpen={isEqOpen}
        onClose={() => setIsEqOpen(false)}
        accentColor={accentColor}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        accentColor={accentColor}
      />
    </div>
  );
};

export default App;
