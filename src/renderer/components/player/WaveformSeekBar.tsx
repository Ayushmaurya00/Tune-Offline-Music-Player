import React, { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { getWaveformForSong, generatePseudoWaveform } from '../../utils/waveformGenerator';
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
  const [dragTime, setDragTime] = useState<number | null>(null);

  // Load or generate waveform peaks when song changes
  useEffect(() => {
    if (!currentSong) {
      setWaveformPeaks([]);
      return;
    }

    // Instantly provide pseudo-waveform so the sound line is immediately visible and scrubbable
    const initial = generatePseudoWaveform(currentSong.id, 84);
    setWaveformPeaks(initial);

    let isMounted = true;
    getWaveformForSong(currentSong.id, currentSong.filePath, 84).then((peaks) => {
      if (isMounted && peaks.length > 0) setWaveformPeaks(peaks);
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong]);

  // Determine current active display time (realtime scrub while dragging)
  const activeTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progress = duration > 0 ? Math.min(1, Math.max(0, activeTime / duration)) : 0;

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
  }, [waveformPeaks, progress, accentColor]);

  const getSeekTimeFromEvent = (clientX: number): number => {
    if (!containerRef.current || duration <= 0) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    setIsDragging(true);
    const targetTime = getSeekTimeFromEvent(e.clientX);
    setDragTime(targetTime);
    setHoverTime(targetTime);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setHoverPosition(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (offsetX / rect.width) * duration;

    setHoverPosition(offsetX);
    setHoverTime(targetTime);

    if (isDragging) {
      setDragTime(targetTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // fallback
    }
    const finalTime = getSeekTimeFromEvent(e.clientX);
    seek(finalTime);
    setIsDragging(false);
    setDragTime(null);
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // fallback
    }
    setIsDragging(false);
    setDragTime(null);
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
      setHoverTime(null);
    }
  };

  return (
    <div className="w-full max-w-xl flex items-center gap-3 select-none text-xs font-mono text-tune-textSecondary">
      <span className="w-9 text-right text-tune-textSecondary font-semibold">
        {formatDuration(activeTime)}
      </span>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        className="relative flex-1 h-9 flex items-center cursor-pointer group touch-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block transition-opacity group-hover:opacity-95"
        />

        {/* Circular Scrubber Thumb Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-black/20 pointer-events-none transition-transform duration-75 ${
            isDragging
              ? 'scale-125 ring-4 ring-white/30 opacity-100'
              : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          style={{
            left: `${progress * 100}%`
          }}
        />

        {/* Hover / Drag timestamp tooltip */}
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
        {duration > 0 ? formatDuration(duration) : '--:--'}
      </span>
    </div>
  );
};
