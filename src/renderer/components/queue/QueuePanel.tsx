import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { X, Trash2, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { QueueItemRow } from './QueueItemRow';
import { AlbumArt } from '../shared/AlbumArt';
import { formatDuration } from '../../utils/formatters';

export const QueuePanel: React.FC = () => {
  const {
    isQueueOpen,
    toggleQueue,
    queue,
    currentSong,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    playSong
  } = usePlayerStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((item) => item.queueId === active.id);
    const newIndex = queue.findIndex((item) => item.queueId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderQueue(oldIndex, newIndex);
    }
  };

  if (!isQueueOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-80 bg-tune-surface border-l border-tune-border flex flex-col h-full select-none z-50 md:relative md:z-20 shadow-2xl">
      {/* Queue Header */}
      <div className="p-4 border-b border-tune-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-tune-accent" />
          <span className="font-bold text-sm text-white">Play Queue</span>
          <span className="text-xs text-tune-textMuted font-mono">({queue.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 text-tune-textMuted hover:text-red-400 rounded transition"
              title="Clear entire queue"
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            onClick={toggleQueue}
            className="p-1.5 text-tune-textMuted hover:text-white rounded transition"
            title="Close queue"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Now Playing Slot */}
        {currentSong && (
          <div>
            <span className="text-[11px] font-semibold text-tune-textMuted uppercase tracking-wider block mb-2 px-1">
              Now Playing
            </span>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-tune-elevated border border-tune-accent/30">
              <AlbumArt
                coverArt={currentSong.coverArt}
                title={currentSong.title}
                className="w-10 h-10 rounded flex-shrink-0"
                iconSize={16}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-tune-accent truncate text-xs">
                  {currentSong.title}
                </span>
                <span className="text-[11px] text-tune-textSecondary truncate">
                  {currentSong.artist}
                </span>
              </div>
              <span className="text-[11px] font-mono text-tune-textMuted">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-semibold text-tune-textMuted uppercase tracking-wider block mb-2 px-1">
            Up Next (Drag to Reorder)
          </span>

          {queue.length === 0 ? (
            <div className="py-8 text-center text-xs text-tune-textMuted border border-dashed border-tune-border/60 rounded-xl p-4">
              Queue is empty. Drag songs here or click + to add to queue!
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={queue.map((q) => q.queueId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {queue.map((item) => (
                    <QueueItemRow
                      key={item.queueId}
                      item={item}
                      onRemove={removeFromQueue}
                      onPlay={() => playSong(item.song)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </aside>
  );
};

