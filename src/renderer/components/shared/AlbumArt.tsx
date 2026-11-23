import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { coverArtService } from '../../services/coverArtService';

interface AlbumArtProps {
  coverArt?: string | null;
  title: string;
  artist?: string;
  className?: string;
  iconSize?: number;
  onArtResolved?: (url: string) => void;
}

export const AlbumArt: React.FC<AlbumArtProps> = ({
  coverArt,
  title,
  artist,
  className = 'w-12 h-12 rounded-md',
  iconSize = 20,
  onArtResolved
}) => {
  const [resolvedArt, setResolvedArt] = useState<string | null>(coverArt || null);

  useEffect(() => {
    if (coverArt) {
      setResolvedArt(coverArt);
      return;
    }

    let isMounted = true;
    coverArtService.getCoverArt(title, artist).then((url) => {
      if (isMounted && url) {
        setResolvedArt(url);
        if (onArtResolved) onArtResolved(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [coverArt, title, artist, onArtResolved]);

  const displayArt = coverArt || resolvedArt;

  if (displayArt) {
    return (
      <img
        src={displayArt}
        alt={title}
        className={`${className} object-cover shadow-sm bg-tune-elevated transition-opacity duration-300 animate-in fade-in`}
        loading="lazy"
        onError={() => setResolvedArt(null)}
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
