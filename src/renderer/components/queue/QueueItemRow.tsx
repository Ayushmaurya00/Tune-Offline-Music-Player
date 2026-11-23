import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { QueueItem } from '@/types/music';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration } from '../../utils/formatters';

interface QueueItemRowProps {
  item: QueueItem;
  onRemove: (queueId: string) => void;
  onPlay: () => void;
}

export const QueueItemRow: React.FC<QueueItemRowProps> = ({ item, onRemove, onPlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.queueId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 p-2 rounded-lg bg-tune-elevated/40 hover:bg-tune-card/70 border border-tune-border/40 select-none text-xs transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-tune-textMuted hover:text-white cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
        <AlbumArt
          coverArt={item.song.coverArt}
          title={item.song.title}
          className="w-9 h-9 rounded flex-shrink-0"
          iconSize={14}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-white truncate text-xs group-hover:text-tune-accent">
            {item.song.title}
          </span>
          <span className="text-[11px] text-tune-textMuted truncate">
            {item.song.artist}
          </span>
        </div>
      </div>

      <span className="text-[11px] font-mono text-tune-textMuted mr-1">
        {formatDuration(item.song.duration)}
      </span>

      <button
        onClick={() => onRemove(item.queueId)}
        className="opacity-0 group-hover:opacity-100 p-1 text-tune-textMuted hover:text-white transition"
        title="Remove from queue"
      >
        <X size={14} />
      </button>
    </div>
  );
};
