import React, { useRef } from 'react';
import { X, Sparkles, Download, Flame, Clock, Trophy } from 'lucide-react';
import { Song } from '@/types/music';
import { computeWrappedStats } from '../../utils/statsTracker';

interface TuneWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSongs: Song[];
}

export const TuneWrappedModal: React.FC<TuneWrappedModalProps> = ({
  isOpen,
  onClose,
  allSongs
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const stats = computeWrappedStats(allSongs);

  const handleDownloadCard = () => {
    // Generate high-res image using Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw rich gradient background
    const grad = ctx.createLinearGradient(0, 0, 800, 1000);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.4, '#1e1b4b');
    grad.addColorStop(0.8, '#311042');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative radial glow
    const radial = ctx.createRadialGradient(400, 250, 20, 400, 250, 400);
    radial.addColorStop(0, 'rgba(29, 185, 84, 0.35)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 800, 600);

    // Brand Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🎵 Tune Wrapped', 60, 90);

    ctx.fillStyle = '#1db954';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('OFFLINE LISTENING REPORT', 60, 125);

    // Personality Badge
    ctx.fillStyle = '#222738';
    ctx.beginPath();
    ctx.roundRect(60, 160, 680, 80, 16);
    ctx.fill();

    ctx.fillStyle = '#b3b3b3';
    ctx.font = '14px sans-serif';
    ctx.fillText('YOUR MUSIC PERSONALITY', 85, 190);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`✨ ${stats.musicPersonality}`, 85, 224);

    // Metrics Row
    const drawMetricBox = (x: number, y: number, w: number, h: number, title: string, value: string, icon: string) => {
      ctx.fillStyle = '#1e2333';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${icon} ${title}`, x + 20, y + 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(value, x + 20, y + 80);
    };

    drawMetricBox(60, 265, 325, 110, 'TIME LISTENED', `${stats.totalMinutes} Mins`, '⏱');
    drawMetricBox(415, 265, 325, 110, 'TOTAL PLAYS', `${stats.totalPlays} Tracks`, '🔥');

    // Top Songs Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏆 Top Played Tracks', 60, 425);

    stats.topSongs.slice(0, 5).forEach((song, i) => {
      const y = 460 + i * 70;
      ctx.fillStyle = i === 0 ? 'rgba(29, 185, 84, 0.15)' : '#181b29';
      ctx.beginPath();
      ctx.roundRect(60, y, 680, 56, 12);
      ctx.fill();

      ctx.fillStyle = i === 0 ? '#1db954' : '#64748b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`#${i + 1}`, 85, y + 35);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(song.title.slice(0, 32), 130, y + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(song.artist.slice(0, 35), 130, y + 46);

      ctx.fillStyle = '#1db954';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`${song.plays} plays`, 640, y + 35);
    });

    // Top Artists
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🎤 Top Artists', 60, 850);

    const artistText = stats.topArtists.map((a) => a.artist).join('  •  ') || 'Various Artists';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(artistText.slice(0, 60), 60, 890);

    // Footer Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('Tune — 100% Offline Music Player', 60, 955);

    // Trigger download
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tune-Wrapped-${new Date().getFullYear()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-indigo-950/70 to-neutral-950 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        {/* Scrollable Content */}
        <div ref={cardRef} className="overflow-y-auto p-8 space-y-6 flex-1">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tune-accent/20 border border-tune-accent/40 text-tune-accent text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles size={14} />
              <span>Tune Wrapped</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Listening Story
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              All your local music stats, completely offline & private
            </p>
          </div>

          {/* Personality Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 text-center">
            <span className="text-[11px] uppercase font-bold tracking-widest text-indigo-300 block mb-1">
              Your Music Personality
            </span>
            <span className="text-2xl font-black text-white tracking-tight">
              ✨ {stats.musicPersonality}
            </span>
          </div>

          {/* Stats Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tune-accent/20 text-tune-accent flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white block">
                  {stats.totalMinutes} min
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Listened</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame size={20} />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white block">
                  {stats.totalPlays} plays
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Songs</span>
              </div>
            </div>
          </div>

          {/* Top Songs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Trophy size={16} className="text-amber-400" />
              <span>Your Top Tracks</span>
            </div>

            <div className="space-y-2">
              {stats.topSongs.map((song, i) => (
                <div
                  key={`${song.title}-${i}`}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    i === 0
                      ? 'bg-tune-accent/10 border-tune-accent/30 text-white'
                      : 'bg-slate-800/30 border-slate-700/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-3">
                    <span className={`font-black text-sm w-5 ${i === 0 ? 'text-tune-accent' : 'text-slate-500'}`}>
                      #{i + 1}
                    </span>
                    <div className="truncate">
                      <span className="font-bold block truncate text-white">{song.title}</span>
                      <span className="text-[11px] text-slate-400 truncate">{song.artist}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-tune-accent flex-shrink-0">
                    {song.plays} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            {stats.streakDays} days listening
          </span>

          <button
            onClick={handleDownloadCard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-tune-accent hover:bg-tune-accentHover text-black font-bold text-xs transition shadow-lg shadow-tune-accent/25 hover:scale-105 active:scale-95"
          >
            <Download size={16} />
            <span>Save Share Card (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
