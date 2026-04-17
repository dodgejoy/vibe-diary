'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RawgGame } from '@/lib/rawg';

interface SimilarGamesProps {
  games: RawgGame[];
}

export function SimilarGames({ games }: SimilarGamesProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Похожие игры</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/add-game?search=${encodeURIComponent(game.name)}`}
            className="group relative overflow-hidden rounded-xl bg-slate-800/80 hover:bg-slate-700/80 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-violet-500/50 shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              {game.background_image ? (
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <span className="text-xs">Нет изображения</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-violet-300 transition-colors">
                {game.name}
              </h3>
              {game.rating && (
                <div className="text-xs text-violet-300 mt-2 font-medium">
                  ★ {game.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/0 via-violet-500/0 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Link>
        ))}
      </div>
    </div>
  );
}
