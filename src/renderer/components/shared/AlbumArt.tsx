import React from 'react';
import { Music } from 'lucide-react';

interface AlbumArtProps {
  coverArt?: string | null;
  title: string;
  className?: string;
  iconSize?: number;
}

export const AlbumArt: React.FC<AlbumArtProps> = ({
  coverArt,
  title,
  className = 'w-12 h-12 rounded-md',
  iconSize = 20
}) => {
  if (coverArt) {
    return (
      <img
        src={coverArt}
        alt={title}
        className={`${className} object-cover shadow-sm bg-tune-elevated`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 border border-tune-border shadow-sm text-neutral-400`}
    >
      <Music size={iconSize} />
    </div>
  );
};
