import React, { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { getWaveformForSong } from '../../utils/waveformGenerator';
import { formatDuration } from '../../utils/formatters';

interface WaveformSeekBarProps {
  accentColor?: string;
}

export const WaveformSeekBar: React.FC<WaveformSeekBarProps> = ({
  accentColor = '#1db954'
}) => {
  const { currentSong, currentTime, duration, seek } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load or generate waveform peaks when song changes
  useEffect(() => {
    if (!currentSong) {
      setWaveformPeaks([]);
      return;
    }

    let isMounted = true;
    getWaveformForSong(currentSong.id, currentSong.filePath, 84).then((peaks) => {
      if (isMounted) setWaveformPeaks(peaks);
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong]);

  // Render waveform bars onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformPeaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const barCount = waveformPeaks.length;
    const totalGap = (barCount - 1) * 2;
    const barWidth = Math.max(2, (width - totalGap) / barCount);

    waveformPeaks.forEach((peak, i) => {
      const x = i * (barWidth + 2);
      const barHeight = Math.max(4, peak * (height - 6));
      const y = (height - barHeight) / 2;
      const isPlayed = i / barCount <= progress;

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);

      if (isPlayed) {
        ctx.fillStyle = accentColor;
      } else {
        ctx.fillStyle = '#3a3a3a';
      }
      ctx.fill();
    });
  }, [waveformPeaks, currentTime, duration, accentColor]);

  const handlePointerAction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetPercent = clickX / rect.width;
    seek(targetPercent * duration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverPosition(offsetX);
    setHoverTime((offsetX / rect.width) * duration);

    if (isDragging) {
      handlePointerAction(e);
    }
  };

  return (
    <div className="w-full max-w-xl flex items-center gap-3 select-none text-xs font-mono text-tune-textSecondary">
      <span className="w-9 text-right text-tune-textSecondary font-semibold">
        {formatDuration(currentTime)}
      </span>

      <div
        ref={containerRef}
        onPointerDown={(e) => {
          setIsDragging(true);
          handlePointerAction(e);
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => {
          setIsDragging(false);
          setHoverPosition(null);
          setHoverTime(null);
        }}
        onPointerMove={handlePointerMove}
        className="relative flex-1 h-9 flex items-center cursor-pointer group"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block transition-opacity group-hover:opacity-90"
        />

        {/* Hover timestamp tooltip */}
        {hoverPosition !== null && hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-neutral-900 border border-tune-border text-[11px] text-white shadow-xl pointer-events-none transition-transform"
            style={{ left: `${hoverPosition}px` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      <span className="w-9 text-left text-tune-textMuted">
        {formatDuration(duration)}
      </span>
    </div>
  );
};
