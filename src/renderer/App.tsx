import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './components/library/LibraryView';
import { QueuePanel } from './components/queue/QueuePanel';
import { NewPlaylistModal } from './components/playlist/NewPlaylistModal';
import { LyricsModal } from './components/lyrics/LyricsModal';
import { SpotifyImportModal } from './components/importer/SpotifyImportModal';
import { EqualizerModal } from './components/player/EqualizerModal';
import { SleepTimerModal } from './components/player/SleepTimerModal';
import { MiniPlayerView } from './components/player/MiniPlayerView';
import { NotificationDrawer } from './components/player/NotificationDrawer';
import { ScanResultModal, ScanResultData } from './components/library/ScanResultModal';
import { FileDropOverlay } from './components/shared/FileDropOverlay';
import { ShortcutsModal } from './components/shared/ShortcutsModal';
import { pickFolder, pickAudioFiles, convertFileListToSongs } from './utils/folderPicker';
import { useLibraryStore } from './store/libraryStore';
import { usePlayerStore } from './store/playerStore';
import { extractDominantColor } from './utils/colorExtractor';
import { recordSongPlay } from './utils/statsTracker';
import { mediaSessionService } from './services/mediaSession';
import { coverArtService } from './services/coverArtService';
import { backButtonService } from './services/backButtonService';
import { applyTagOverrides } from './services/tagOverrideService';
import { Song } from '@/types/music';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#1db954');
  const [ambientGradient, setAmbientGradient] = useState(
    'radial-gradient(ellipse at top, rgba(29, 185, 84, 0.12) 0%, transparent 70%)'
  );

  const { songs, setSongs, addSong, updateSong, removeSong, setWatchedFolder, setIsLoading, watchedFolderPath } =
    useLibraryStore();
  const { currentSong, togglePlay, nextTrack, prevTrack, seek, currentTime, playSong, toggleMute, toggleQueue } =
    usePlayerStore();

  // Initialize Android Hardware & Browser Back Button Management
  useEffect(() => {
    backButtonService.init();
  }, []);

  // Dynamic Album Art Palette Extraction, Online Poster Resolution & Stats Tracking
  useEffect(() => {
    if (!currentSong) {
      setAccentColor('#1db954');
      setAmbientGradient('radial-gradient(ellipse at top, rgba(29, 185, 84, 0.12) 0%, transparent 70%)');
      return;
    }

    recordSongPlay(currentSong);

    if (currentSong.coverArt) {
      extractDominantColor(currentSong.coverArt).then((palette) => {
        setAccentColor(palette.primaryHex);
        setAmbientGradient(palette.ambientGradient);
      });
    } else {
      // Auto-fetch high-resolution album poster from iTunes Music Catalog
      coverArtService.getCoverArt(currentSong.title, currentSong.artist).then((artUrl) => {
        if (artUrl) {
          updateSong(currentSong.id, { coverArt: artUrl });
          usePlayerStore.setState((state) => {
            if (state.currentSong?.id === currentSong.id) {
              const updated = { ...state.currentSong, coverArt: artUrl };
              mediaSessionService.updateMetadata(updated, state.isPlaying);
              return { currentSong: updated };
            }
            return state;
          });
          extractDominantColor(artUrl).then((palette) => {
            setAccentColor(palette.primaryHex);
            setAmbientGradient(palette.ambientGradient);
          });
        }
      });
    }
  }, [currentSong]);

  const handleScan = useCallback(
    async (targetPath?: string, showPopup = false) => {
      if (!window.tuneAPI) return;

      setIsLoading(true);
      const startTime = performance.now();
      try {
        const folder = targetPath || watchedFolderPath || (await window.tuneAPI.getDownloadsPath());
        setWatchedFolder(folder);

        let scannedSongs: Song[] = [];
        let rejectedCount = 0;
        let rejectedNames: string[] = [];

        if (window.tuneAPI.scanFolderDetailed) {
          const detail = await window.tuneAPI.scanFolderDetailed(folder);
          scannedSongs = detail.songs;
          rejectedCount = detail.rejectedCount;
          rejectedNames = detail.rejectedNames;
        } else {
          scannedSongs = await window.tuneAPI.scanFolder(folder);
        }

        const prevCount = songs.length;
        const patchedSongs = applyTagOverrides(scannedSongs);
        setSongs(patchedSongs);

        await window.tuneAPI.startWatching(folder);

        const durationMs = performance.now() - startTime;
        const newSongsCount = Math.max(0, scannedSongs.length - prevCount);

        const formatCounts: Record<string, number> = {};
        for (const s of scannedSongs) {
          const fmt = (s.format || s.fileName.split('.').pop() || 'mp3').toLowerCase();
          formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
        }

        if (showPopup) {
          setScanResult({
            folderPath: folder,
            totalSongs: scannedSongs.length,
            newSongsCount,
            durationMs,
            formatCounts,
            rejectedCount,
            rejectedNames
          });
          setIsScanModalOpen(true);
        }
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [watchedFolderPath, setIsLoading, setWatchedFolder, setSongs, songs.length]
  );

  const applyScanResult = useCallback(
    (
      folderPath: string,
      scannedSongs: Song[],
      durationMs: number,
      rejectedCount = 0,
      rejectedNames: string[] = []
    ) => {
      setWatchedFolder(folderPath);
      const prevCount = songs.length;
      const patchedSongs = applyTagOverrides(scannedSongs);
      setSongs(patchedSongs);

      const newSongsCount = Math.max(0, scannedSongs.length - prevCount);
      const formatCounts: Record<string, number> = {};
      for (const s of scannedSongs) {
        const fmt = (s.format || s.fileName.split('.').pop() || 'mp3').toLowerCase();
        formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      }

      setScanResult({
        folderPath,
        totalSongs: scannedSongs.length,
        newSongsCount,
        durationMs,
        formatCounts,
        rejectedCount,
        rejectedNames
      });
      setIsScanModalOpen(true);
    },
    [songs.length, setWatchedFolder, setSongs]
  );

  const handleOpenScanSummary = () => {
    if (!scanResult) {
      const formatCounts: Record<string, number> = {};
      for (const s of songs) {
        const fmt = (s.format || s.fileName.split('.').pop() || 'mp3').toLowerCase();
        formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      }

      setScanResult({
        folderPath: watchedFolderPath || 'Downloads',
        totalSongs: songs.length,
        newSongsCount: 0,
        durationMs: 35,
        formatCounts,
        rejectedCount: 0,
        rejectedNames: []
      });
    }
    setIsScanModalOpen(true);
  };

  const handleSelectFolder = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    try {
      const picked = await pickFolder();
      if (!picked) return;
      applyScanResult(
        picked.folderPath,
        picked.songs,
        performance.now() - startTime,
        picked.rejectedCount,
        picked.rejectedNames
      );
      if (window.tuneAPI) {
        await window.tuneAPI.startWatching(picked.folderPath);
      }
    } catch (err) {
      console.error('Folder selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFiles = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    try {
      const picked = await pickAudioFiles();
      if (!picked) return;
      const merged = [...songs.filter((s) => !picked.songs.some((p) => p.id === s.id)), ...picked.songs];
      applyScanResult(
        picked.folderPath,
        merged,
        performance.now() - startTime,
        picked.rejectedCount,
        picked.rejectedNames
      );
    } catch (err) {
      console.error('File selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesDropped = (files: File[]) => {
    const startTime = performance.now();
    const result = convertFileListToSongs(files);
    const merged = [...songs.filter((s) => !result.songs.some((p) => p.id === s.id)), ...result.songs];
    applyScanResult(
      result.folderPath,
      merged,
      performance.now() - startTime,
      result.rejectedCount,
      result.rejectedNames
    );
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
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        toggleQueue();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        setIsEqOpen((prev) => !prev);
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        setIsSleepTimerOpen((prev) => !prev);
      } else if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, seek, currentTime, toggleMute, toggleQueue]);

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

  // Initialize System MediaSession for native OS Lockscreen & Notification Shade
  useEffect(() => {
    mediaSessionService.init({
      play: togglePlay,
      pause: togglePlay,
      next: nextTrack,
      prev: prevTrack,
      seek: seek,
      seekForward: (offset) => seek(currentTime + offset),
      seekBackward: (offset) => seek(Math.max(0, currentTime - offset))
    });
  }, [togglePlay, nextTrack, prevTrack, seek, currentTime]);

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
      {/* Top Slide-Down In-App Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        accentColor={accentColor}
      />

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
          onSelectFolder={handleSelectFolder}
          onOpenScanSummary={handleOpenScanSummary}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Central Library & Views */}
        <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
          <LibraryView
            onScanFolder={(path, popup) => handleScan(path, popup)}
            onSelectFolderDialog={handleSelectFolder}
            onSelectFilesDialog={handleSelectFiles}
            onOpenScanSummary={handleOpenScanSummary}
            onOpenNewPlaylistModal={() => setIsModalOpen(true)}
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
        onToggleNotificationDrawer={() => setIsNotificationDrawerOpen((prev) => !prev)}
        isNotificationDrawerOpen={isNotificationDrawerOpen}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
        onOpenNewPlaylistModal={() => setIsModalOpen(true)}
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

      {/* Custom Scan Result Popup */}
      <ScanResultModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        result={scanResult}
        accentColor={accentColor}
        onChangeFolder={handleSelectFolder}
        onPlayAll={() => {
          if (songs.length > 0) {
            playSong(songs[0], songs);
          }
        }}
      />

      {/* Global Drag and Drop Audio Files Overlay */}
      <FileDropOverlay
        onFilesDropped={handleFilesDropped}
        accentColor={accentColor}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
