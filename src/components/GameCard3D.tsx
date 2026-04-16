'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Game } from '@/lib/supabase';
import { StatusBadge } from './StatusBadge';
import { Heart, Star } from 'lucide-react';
import { useState, useRef } from 'react';

interface GameCard3DProps {
  game: Game;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

export function GameCard3D({ game, isFavorite = false, onToggleFavorite }: GameCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;
    setMousePos({ x: xPct, y: yPct });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const totalScore = game.detailed_ratings
    ? Object.values(game.detailed_ratings).reduce((a, b) => a + b, 0)
    : null;

  const normalizedScore = totalScore !== null ? ((totalScore / 90) * 10).toFixed(1) : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' };
    if (score >= 70) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
    if (score >= 50) return { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' };
    return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Шедевр';
    if (score >= 75) return 'Отлично';
    if (score >= 65) return 'Хорошо';
    if (score >= 55) return 'Неплохо';
    if (score >= 40) return 'Приемлемо';
    return 'Слабо';
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;

    if (target?.closest('[data-favorite-button="true"]')) {
      return;
    }

    router.push(`/games/${game.id}`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleCardClick}
      className={`h-full w-full group transition-transform duration-300 ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-900 h-full border border-slate-800/80 transition-all duration-300"
        style={{
          boxShadow: isHovered
            ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15)'
            : '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="absolute top-3 right-3 z-40">
          <button
            type="button"
            data-favorite-button="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(game.id);
            }}
            className="p-2.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 hover:bg-slate-900 transition-all shadow-xl"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={16}
              className={`transition-colors duration-300 ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                  : 'text-white/70 hover:text-rose-400'
              }`}
            />
          </button>
        </div>

        <div className="block h-full cursor-pointer">
          <div
            className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(1200px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.1), transparent 40%)`
            }}
          />

          <div
            className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(139, 92, 246, 0.3)',
            }}
          />

          <div className="relative h-64 w-full overflow-hidden bg-slate-900/50">
            {game.cover_url ? (
              <Image
                src={game.cover_url}
                alt={game.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out origin-center"
                draggable={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-800/50 text-slate-500">
                <span className="text-sm font-medium tracking-widest uppercase">No Cover</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-300" />

            {game.logo_url && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center z-20 pointer-events-none transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <Image
                  src={game.logo_url}
                  alt={`${game.title} logo`}
                  width={140}
                  height={60}
                  className="object-contain max-h-[60px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    (e.target as HTMLElement).parentElement?.style.setProperty('display', 'none');
                  }}
                />
              </div>
            )}
          </div>

          <div className="p-5 space-y-4 relative z-30 bg-slate-900">
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight leading-tight line-clamp-2 group-hover:text-violet-400 transition-colors">
                {game.title}
              </h3>

              {(game.release_date || game.genres) && (
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {game.release_date && (
                    <span className="shrink-0 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">
                      {new Date(game.release_date).getFullYear()}
                    </span>
                  )}
                  {game.genres && (
                    <span className="truncate">
                      {game.genres.split(',').map(g => g.trim()).slice(0, 2).join(' • ')}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <StatusBadge status={game.status} />

              {totalScore !== null && normalizedScore !== null && (
                <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg shadow-inner transition-colors duration-300 ${getScoreColor(totalScore).bg} ${getScoreColor(totalScore).border} ${getScoreColor(totalScore).text}`}>
                    <Star size={14} className="fill-current drop-shadow-md" />
                    <span className="text-sm font-bold">{normalizedScore}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${getScoreColor(totalScore).text} opacity-80`}>
                    {getScoreLabel(totalScore)}
                  </span>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </div>
        </div>
      </div>
    </div>
  );
}
