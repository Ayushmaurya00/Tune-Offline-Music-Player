import React from 'react';
import { ListMusic, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { PlaybackControls } from './PlaybackControls';
import { SeekBar } from './SeekBar';
import { VolumeControl } from './VolumeControl';
import { AlbumArt } from '../shared/AlbumArt';

export const PlayerBar: React.FC = () => {
  const { currentSong, isQueueOpen, toggleQueue } = usePlayerStore();
  const { isSongLiked, toggleLikeSong } = usePlaylistStore();

  const isLiked = currentSong ? isSongLiked(currentSong.id) : false;

  return (
    <footer className="h-24 bg-tune-surface border-t border-tune-border px-4 flex items-center justify-between select-none z-30">
      {/* Left: Now Playing Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        {currentSong ? (
          <>
            <AlbumArt
              coverArt={currentSong.coverArt}
              title={currentSong.title}
              className="w-14 h-14 rounded-md flex-shrink-0"
              iconSize={22}
            />
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </span>
              <span className="text-xs text-tune-textSecondary truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </span>
            </div>

            <button
              onClick={() => toggleLikeSong(currentSong)}
              className={`p-1.5 transition rounded-full hover:scale-110 flex-shrink-0 ${
                isLiked ? 'text-tune-accent fill-tune-accent' : 'text-tune-textSecondary hover:text-white'
              }`}
              title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-tune-textMuted text-xs">
            <div className="w-14 h-14 rounded-md bg-tune-elevated flex items-center justify-center border border-tune-border">
              <ListMusic size={20} />
            </div>
            <span>No song selected</span>
          </div>
        )}
      </div>

      {/* Center: Playback & Seek */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4">
        <PlaybackControls />
        <SeekBar />
      </div>

      {/* Right: Tools & Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
        <button
          onClick={toggleQueue}
          className={`p-2 rounded-lg transition hover:bg-tune-card ${
            isQueueOpen ? 'text-tune-accent bg-tune-elevated' : 'text-tune-textSecondary hover:text-white'
          }`}
          title="Play Queue"
        >
          <ListMusic size={20} />
        </button>

        <VolumeControl />
      </div>
    </footer>
  );
};

