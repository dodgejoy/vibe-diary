'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Game } from '@/lib/supabase';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, Gamepad2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-800/80 hover:to-slate-800/80 transition-all duration-300 cursor-pointer h-full shadow-lg hover:shadow-2xl hover:shadow-violet-500/25 border border-slate-700/50 hover:border-violet-500/50 backdrop-blur-sm hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-900">
          {game.cover_url ? (
            <Image
              src={game.cover_url}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-125 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
              <span className="text-sm">No Cover Image</span>
            </div>
          )}
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Logo Badge */}
          {game.logo_url && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-lg p-2 shadow-lg hover:bg-white transition-all group-hover:shadow-xl">
              <Image
                src={game.logo_url}
                alt={`${game.title} logo`}
                width={40}
                height={40}
                className="object-contain w-auto h-auto max-w-[40px] max-h-[40px]"
                onError={(e) => {
                  // Hide logo if it fails to load
                  (e.target as HTMLElement).parentElement?.style.setProperty('display', 'none');
                }}
              />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 space-y-3 relative">
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-violet-300 transition-colors text-sm sm:text-base">
            {game.title}
          </h3>

          {/* Status Badge & Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={game.status} />
            
            {game.steam_deck_status && game.steam_deck_status !== 'unknown' && (
              <div className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm
                ${game.steam_deck_status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  game.steam_deck_status === 'playable' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-rose-500/20 text-rose-400'}`}
              >
                <Gamepad2 size={12} />
                DECK
              </div>
            )}

            {game.detailed_ratings && (
              <div className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 rounded text-white backdrop-blur-sm">
                ⭐ {((Object.values(game.detailed_ratings).reduce((a, b) => a + b, 0) / 90) * 10).toFixed(1)}/10
              </div>
            )}
          </div>

          {/* Hover Indicator */}
          <div className="flex items-center justify-end text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}
