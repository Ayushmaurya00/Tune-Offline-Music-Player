import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
  showSubtitle = true
}) => {
  const isCompact = size <= 24;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Tune"
        width={size}
        height={size}
        className="rounded-lg shadow-sm flex-shrink-0 object-contain"
      />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span
              className={`font-black tracking-tight text-white lowercase ${
                isCompact ? 'text-sm' : 'text-base'
              }`}
            >
              tune
            </span>
            <span
              className={`rounded-full bg-tune-accent ml-0.5 ${
                isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'
              }`}
            />
          </div>
          {showSubtitle && !isCompact && (
            <span className="text-[9px] text-tune-textMuted uppercase font-bold tracking-widest -mt-0.5">
              YOUR MUSIC, OFFLINE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
