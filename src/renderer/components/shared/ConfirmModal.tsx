import React from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    if (type === 'danger' || isDestructive) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
          <Trash2 size={22} />
        </div>
      );
    }
    if (type === 'warning') {
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
          <AlertTriangle size={22} />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-tune-accent/15 text-tune-accent flex items-center justify-center flex-shrink-0 border border-tune-accent/20">
        <Info size={22} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-tune-surface border border-tune-border rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {renderIcon()}
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-tune-textMuted hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-tune-textSecondary mt-3 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-tune-border/50">
          {cancelText && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-tune-textSecondary hover:text-white hover:bg-tune-elevated transition"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
                : 'bg-tune-accent hover:bg-tune-accentHover text-black shadow-tune-accent/20 active:scale-95'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

