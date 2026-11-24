import React, { useEffect } from 'react';
import { X, CheckCircle2, Folder, Clock, Music, Play, AlertCircle } from 'lucide-react';
import { backButtonService } from '../../services/backButtonService';

export interface ScanResultData {
  folderPath: string;
  totalSongs: number;
  newSongsCount: number;
  durationMs: number;
  formatCounts: Record<string, number>;
  rejectedCount?: number;
  rejectedNames?: string[];
}

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScanResultData | null;
  onPlayAll?: () => void;
  onChangeFolder?: () => void;
  accentColor?: string;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  isOpen,
  onClose,
  result,
  onPlayAll,
  onChangeFolder,
  accentColor = '#1db954'
}) => {
  useEffect(() => {
    if (!isOpen) return;
    return backButtonService.register(onClose);
  }, [isOpen, onClose]);

  if (!isOpen || !result) return null;

  const durationFormatted =
    result.durationMs < 1000
      ? `${Math.round(result.durationMs)}ms`
      : `${(result.durationMs / 1000).toFixed(2)}s`;

  const formats = Object.entries(result.formatCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-tune-surface border border-tune-border p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-tune-border"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Scan Completed</h2>
              <p className="text-xs text-tune-textMuted">Local library updated successfully</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-tune-textMuted hover:text-white rounded-lg hover:bg-tune-elevated transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Folder Path Box */}
        <div className="p-3 rounded-xl bg-tune-elevated/70 border border-tune-border flex items-center gap-2.5 overflow-hidden">
          <Folder size={18} className="text-white flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-tune-textMuted tracking-wider">
              Scanned Directory
            </span>
            <span className="text-xs font-mono text-white truncate" title={result.folderPath}>
              {result.folderPath}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-tune-elevated border border-tune-border flex flex-col items-center justify-center text-center">
            <Music size={16} className="text-white mb-1" />
            <span className="text-xl font-bold font-mono text-white">
              {result.totalSongs}
            </span>
            <span className="text-[10px] text-tune-textMuted uppercase font-semibold">
              Total Songs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-tune-elevated border border-tune-border flex flex-col items-center justify-center text-center">
            <Clock size={16} className="text-amber-400 mb-1" />
            <span className="text-xl font-bold font-mono text-white">
              {durationFormatted}
            </span>
            <span className="text-[10px] text-tune-textMuted uppercase font-semibold">
              Scan Time
            </span>
          </div>

          <div className="p-3 rounded-xl bg-tune-elevated border border-tune-border flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold text-tune-accent mb-1">
              {result.newSongsCount > 0 ? `+${result.newSongsCount}` : '✓'}
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {result.newSongsCount > 0 ? result.newSongsCount : 'Synced'}
            </span>
            <span className="text-[10px] text-tune-textMuted uppercase font-semibold">
              {result.newSongsCount > 0 ? 'New Tracks' : 'Status'}
            </span>
          </div>
        </div>

        {/* Rejected Non-Audio Warning Banner */}
        {result.rejectedCount !== undefined && result.rejectedCount > 0 && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-tune-textSecondary flex-1">
              <span className="font-bold text-white">
                Rejected {result.rejectedCount} non-audio file{result.rejectedCount > 1 ? 's' : ''}:
              </span>{' '}
              <span className="text-red-300 font-mono">
                {result.rejectedNames?.slice(0, 3).join(', ')}
                {(result.rejectedNames?.length || 0) > 3 ? '...' : ''}
              </span>
              <p className="text-[11px] text-tune-textMuted mt-1">
                Tune strictly plays audio formats (.mp3, .wav, .flac, .m4a, .ogg, .aac, .opus). Non-audio files (such as PDF, documents, or images) are safely rejected and not imported.
              </p>
            </div>
          </div>
        )}

        {/* Formats Breakdown or Empty Advice */}
        {formats.length > 0 ? (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-tune-textMuted uppercase tracking-wider">
              Discovered Audio Formats
            </span>
            <div className="flex flex-wrap gap-1.5">
              {formats.map(([fmt, count]) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-lg bg-tune-elevated border border-tune-border text-xs text-tune-textSecondary font-mono flex items-center gap-1.5"
                >
                  <span className="font-bold text-white uppercase">{fmt}</span>
                  <span className="text-[10px] text-tune-accent font-semibold px-1 rounded bg-tune-card">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertCircle size={15} />
              <span>No audio files found in this folder</span>
            </div>
            <p className="text-[11px] text-tune-textSecondary">
              Your selected directory has no MP3, WAV, FLAC, or M4A files. Please choose another folder with offline audio files.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-tune-border/60">
          {result.totalSongs === 0 && onChangeFolder && (
            <button
              onClick={() => {
                onClose();
                onChangeFolder();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-md shadow-tune-accent/20 active:scale-95"
            >
              <Folder size={14} />
              <span>Choose Another Folder</span>
            </button>
          )}

          {onPlayAll && result.totalSongs > 0 && (
            <button
              onClick={() => {
                onPlayAll();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tune-accent hover:bg-tune-accentHover text-black text-xs font-bold transition shadow-md"
            >
              <Play size={14} fill="currentColor" />
              <span>Play All</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-tune-elevated hover:bg-tune-card text-xs font-semibold text-white border border-tune-border transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

