import React, { useEffect } from 'react';
import { X, Keyboard, Command, Volume2, Sparkles, ListMusic } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  category: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'Playback Controls',
      icon: <Volume2 size={16} className="text-tune-accent" />,
      shortcuts: [
        { keys: ['Space'], description: 'Play / Pause' },
        { keys: ['→'], description: 'Seek forward 10 seconds' },
        { keys: ['←'], description: 'Seek backward 10 seconds' },
        { keys: ['Shift', '→'], description: 'Next track in queue' },
        { keys: ['Shift', '←'], description: 'Previous track in history' },
        { keys: ['M'], description: 'Toggle Mute / Unmute' }
      ]
    },
    {
      category: 'Features & Views',
      icon: <Sparkles size={16} className="text-purple-400" />,
      shortcuts: [
        { keys: ['L'], description: 'Synced Karaoke Lyrics' },
        { keys: ['Q'], description: 'Toggle Play Queue' },
        { keys: ['E'], description: '10-Band EQ & Hardware Crossfade' },
        { keys: ['T'], description: 'Sleep Timer (Fade out)' },
        { keys: ['?'], description: 'Open this Keyboard Shortcuts cheat sheet' }
      ]
    },
    {
      category: 'Mouse & Track Actions',
      icon: <ListMusic size={16} className="text-blue-400" />,
      shortcuts: [
        { keys: ['Right Click'], description: 'Open Track Context Menu (Play Next, Playlist, Tag)' },
        { keys: ['Drag & Drop'], description: 'Drop files anywhere to import or drag queue to reorder' },
        { keys: ['Media Keys'], description: 'Global hardware Play/Pause, Next, Prev (works in background)' }
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-tune-card border border-tune-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-tune-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tune-accent/10 text-tune-accent">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Keyboard Shortcuts</span>
              </h2>
              <p className="text-xs text-tune-textMuted">Pro hotkeys for lightning-fast control</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-tune-textMuted hover:text-white hover:bg-tune-elevated transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="mt-4 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-tune-textSecondary uppercase tracking-wider">
                {group.icon}
                <span>{group.category}</span>
              </div>

              <div className="space-y-1.5 bg-tune-elevated/40 rounded-xl p-2.5 border border-tune-border/60">
                {group.shortcuts.map((sc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-1.5 text-xs">
                    <span className="text-tune-textSecondary">{sc.description}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded bg-[#2a2a2a] border border-[#3d3d3d] text-[11px] font-mono font-bold text-white shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-tune-border flex items-center justify-between text-xs text-tune-textMuted">
          <span className="flex items-center gap-1.5">
            <Command size={13} className="text-tune-accent" />
            <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[10px] text-white">?</kbd> anytime to open</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-tune-accent hover:bg-tune-accentHover text-black font-bold text-xs transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
