import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Play,
  ListPlus,
  FolderTree,
  Music,
  RefreshCw,
  BarChart2
} from 'lucide-react';
import { Song } from '@/types/music';
import { buildFolderTree, FolderNode } from '../../utils/folderTree';
import { usePlayerStore } from '../../store/playerStore';
import { SongRow } from '../library/SongRow';
import { formatDuration } from '../../utils/formatters';

interface FolderViewProps {
  songs: Song[];
  rootPath: string;
  onDelete?: (song: Song) => void;
  onShowInFolder?: (song: Song) => void;
  onChangeFolder?: () => void;
  onRefresh?: () => void;
  onOpenScanSummary?: () => void;
  isLoading?: boolean;
}

interface TreeItemProps {
  node: FolderNode;
  selectedPath: string;
  onSelect: (node: FolderNode) => void;
  depth?: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, selectedPath, onSelect, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedPath === node.fullPath;
  const hasSubfolders = node.subfolders.length > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(node)}
        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs cursor-pointer select-none transition group ${
          isSelected
            ? 'bg-tune-accent/15 text-tune-accent font-semibold'
            : 'text-tune-textSecondary hover:text-white hover:bg-tune-elevated/60'
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        {hasSubfolders ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="p-0.5 text-tune-textMuted hover:text-white"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {isExpanded ? (
          <FolderOpen size={15} className="text-white" />
        ) : (
          <Folder size={15} className="text-white" />
        )}

        <span className="truncate flex-1">{node.name}</span>

        <span className="text-[10px] font-mono text-tune-textMuted px-1.5 py-0.2 rounded bg-tune-card/40">
          {node.totalSongsCount}
        </span>
      </div>

      {hasSubfolders && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {node.subfolders.map((sub) => (
            <TreeItem
              key={sub.fullPath}
              node={sub}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderView: React.FC<FolderViewProps> = ({
  songs,
  rootPath,
  onDelete,
  onShowInFolder,
  onChangeFolder,
  onRefresh,
  onOpenScanSummary,
  isLoading = false
}) => {
  const tree = useMemo(() => buildFolderTree(songs, rootPath), [songs, rootPath]);
  const [selectedNode, setSelectedNode] = useState<FolderNode>(tree);
  const [includeSubfolders, setIncludeSubfolders] = useState(true);

  const { playSong, addToQueue } = usePlayerStore();

  // Collect songs for current view
  const activeSongs = useMemo(() => {
    if (!includeSubfolders) {
      return selectedNode.songs;
    }

    const collected: Song[] = [];
    function collect(node: FolderNode) {
      collected.push(...node.songs);
      for (const sub of node.subfolders) {
        collect(sub);
      }
    }
    collect(selectedNode);
    return collected;
  }, [selectedNode, includeSubfolders]);

  const totalDuration = activeSongs.reduce((acc, s) => acc + s.duration, 0);

  const handlePlayFolder = () => {
    if (activeSongs.length > 0) {
      playSong(activeSongs[0], activeSongs);
    }
  };

  const handleQueueFolder = () => {
    activeSongs.forEach((s) => addToQueue(s));
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Left Tree Explorer Sidebar */}
      <div className="w-72 bg-tune-surface/50 border-r border-tune-border flex flex-col h-full overflow-hidden select-none">
        <div className="p-4 border-b border-tune-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Folder Browser
            </span>
          </div>
          {onChangeFolder && (
            <button
              onClick={onChangeFolder}
              className="text-[11px] text-tune-accent hover:underline lowercase font-normal"
              title="Change root music folder"
            >
              change
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <TreeItem
            node={tree}
            selectedPath={selectedNode.fullPath}
            onSelect={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Subfolder Toggle */}
        <div className="p-3 border-t border-tune-border bg-tune-elevated/40">
          <label className="flex items-center gap-2 text-xs text-tune-textSecondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => setIncludeSubfolders(e.target.checked)}
              className="accent-tune-accent rounded"
            />
            <span>Include subfolder audio</span>
          </label>
        </div>
      </div>

      {/* Right Folder Contents Table */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Folder Header */}
        <div className="p-6 pb-4 border-b border-tune-border/60 bg-tune-elevated/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-tune-elevated text-white flex items-center justify-center border border-tune-border shadow-md">
              <FolderOpen size={28} className="text-white" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-tune-textMuted font-mono truncate mb-0.5">
                <span>{selectedNode.fullPath}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight truncate">
                {selectedNode.name}
              </h2>
              <span className="text-xs text-tune-textSecondary">
                {activeSongs.length} songs • {formatDuration(totalDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenScanSummary && (
              <button
                onClick={onOpenScanSummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-tune-textSecondary hover:text-white border border-tune-border transition"
                title="View Scan Summary"
              >
                <BarChart2 size={14} className="text-tune-accent" />
                <span>Scan Summary</span>
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2.5 rounded-full bg-tune-elevated hover:bg-tune-card text-tune-textSecondary hover:text-white border border-tune-border transition"
                title="Rescan directory"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}

            <button
              onClick={handlePlayFolder}
              disabled={activeSongs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover disabled:opacity-40 text-black font-bold text-xs transition shadow-md shadow-tune-accent/20"
            >
              <Play size={16} fill="currentColor" />
              <span>Play Folder</span>
            </button>

            <button
              onClick={handleQueueFolder}
              disabled={activeSongs.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-tune-elevated hover:bg-tune-card disabled:opacity-40 text-white font-semibold text-xs border border-tune-border transition"
              title="Add all songs in folder to queue"
            >
              <ListPlus size={16} />
              <span>Queue All</span>
            </button>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSongs.length === 0 ? (
            <div className="py-20 text-center text-tune-textMuted text-xs flex flex-col items-center justify-center gap-2">
              <Music size={32} className="text-tune-border" />
              <p className="font-semibold text-white">No audio files in this folder</p>
              <p className="text-[11px] text-tune-textMuted">
                {includeSubfolders ? 'This folder and its subdirectories contain no audio files.' : 'Try checking "Include subfolder audio".'}
              </p>
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

              {activeSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  index={idx}
                  song={song}
                  playlistContext={activeSongs}
                  onDelete={onDelete}
                  onShowInFolder={onShowInFolder}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

