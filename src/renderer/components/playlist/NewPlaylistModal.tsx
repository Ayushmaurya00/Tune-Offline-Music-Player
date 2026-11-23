import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { usePlaylistStore } from '../../store/playlistStore';
import { useLibraryStore } from '../../store/libraryStore';

interface NewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createPlaylist } = usePlaylistStore();
  const { setActiveView } = useLibraryStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = createPlaylist(name.trim(), description.trim());
    setActiveView('playlist', created.id);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-tune-surface border border-tune-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-tune-border">
          <div className="flex items-center gap-2 text-white font-bold">
            <Music size={18} className="text-white" />
            <span>Create New Playlist</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-tune-textMuted hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-tune-textSecondary mb-1.5 uppercase">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chill Beats, Roadtrip, DJ Stems"
              className="w-full px-3.5 py-2.5 bg-tune-elevated rounded-lg text-sm text-white placeholder-tune-textMuted border border-tune-border focus:border-tune-accent focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-tune-textSecondary mb-1.5 uppercase">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description..."
              className="w-full px-3.5 py-2.5 bg-tune-elevated rounded-lg text-sm text-white placeholder-tune-textMuted border border-tune-border focus:border-tune-accent focus:outline-none transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-tune-textSecondary hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-full bg-tune-accent hover:bg-tune-accentHover disabled:opacity-50 text-black font-semibold text-xs transition shadow-md"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

