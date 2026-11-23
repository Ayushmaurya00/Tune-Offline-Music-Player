import React from 'react';
import { Search, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { SortField } from '@/types/music';

interface SortFilterBarProps {
  isGridView: boolean;
  setIsGridView: (val: boolean) => void;
}

export const SortFilterBar: React.FC<SortFilterBarProps> = ({
  isGridView,
  setIsGridView
}) => {
  const { searchQuery, setSearchQuery, sortField, sortOrder, setSort } = useLibraryStore();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortField);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-6 bg-tune-bg/80 backdrop-blur-sm sticky top-0 z-10 border-b border-tune-border/50">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tune-textMuted pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, artist, album..."
          className="w-full pl-9 pr-4 py-2 bg-tune-elevated rounded-full text-xs text-white placeholder-tune-textMuted border border-tune-border focus:border-tune-accent focus:outline-none transition"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-tune-elevated border border-tune-border rounded-lg px-2.5 py-1.5 text-xs text-tune-textSecondary">
          <ArrowUpDown size={14} className="text-tune-accent" />
          <span className="text-[11px] text-tune-textMuted uppercase font-semibold">Sort:</span>
          <select
            value={sortField}
            onChange={handleSortChange}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="fileModified" className="bg-tune-card">Download Date</option>
            <option value="dateAdded" className="bg-tune-card">Date Added</option>
            <option value="title" className="bg-tune-card">Title (A-Z)</option>
            <option value="artist" className="bg-tune-card">Artist</option>
            <option value="album" className="bg-tune-card">Album</option>
            <option value="duration" className="bg-tune-card">Duration</option>
          </select>

          <button
            onClick={() => setSort(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-1 text-[11px] font-mono text-tune-accent hover:underline uppercase"
            title="Toggle sort direction"
          >
            {sortOrder}
          </button>
        </div>

        <div className="flex items-center bg-tune-elevated border border-tune-border rounded-lg p-0.5">
          <button
            onClick={() => setIsGridView(false)}
            className={`p-1.5 rounded-md transition ${
              !isGridView ? 'bg-tune-card text-white' : 'text-tune-textMuted hover:text-white'
            }`}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setIsGridView(true)}
            className={`p-1.5 rounded-md transition ${
              isGridView ? 'bg-tune-card text-white' : 'text-tune-textMuted hover:text-white'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
