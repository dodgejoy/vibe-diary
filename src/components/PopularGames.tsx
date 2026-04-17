'use client';

import { useEffect, useState } from 'react';
import { PopularGame, fetchPopularGames } from '@/lib/supabase';
import { Flame, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

export function PopularGames() {
  const [games, setGames] = useState<PopularGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const data = await fetchPopularGames(6);
      if (!cancelled) {
        setGames(data);
        setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!isLoading && games.length === 0) return null;

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-2.5 rounded-xl border border-orange-500/20">
              <Flame size={24} className="text-orange-400" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('popular.heading')}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{t('popular.headingSubtitle')}</p>
            </div>
          </div>
          <Link
            href="/popular"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white font-semibold rounded-xl transition-all group"
          >
            <span className="text-sm">{t('common.viewAll')}</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-slate-800/60 rounded-2xl" />
                <div className="mt-3 h-4 bg-slate-800/60 rounded-lg w-3/4" />
                <div className="mt-2 h-3 bg-slate-800/40 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {games.map((game, index) => (
              <PopularGameCard key={game.rawg_id ?? game.title} game={game} rank={index + 1} />
            ))}
          </div>
        )}

        {/* Mobile "See all" link */}
        {!isLoading && games.length > 0 && (
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/popular"
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-white font-semibold rounded-xl transition-all"
            >
              {t('common.viewAll')}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function PopularGameCard({ game, rank }: { game: PopularGame; rank: number }) {
  const hasScore = game.avg_score !== null && game.avg_score > 0;
  const href = game.rawg_id ? `/games/${game.rawg_id}` : undefined;

  const content = (
    <>
      {/* Cover */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 group-hover:border-violet-500/40 transition-all duration-300 bg-slate-900 shadow-lg group-hover:shadow-violet-500/10 group-hover:-translate-y-1">
        {game.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/90 to-transparent" />

        {/* Rank badge */}
        {rank <= 3 && (
          <div className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black shadow-lg ${
            rank === 1 ? 'bg-yellow-500 text-yellow-950' :
            rank === 2 ? 'bg-slate-300 text-slate-800' :
            'bg-amber-700 text-amber-100'
          }`}>
            {rank}
          </div>
        )}

        {/* Score badge */}
        {hasScore && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-white/10">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white">{game.avg_score!.toFixed(1)}</span>
          </div>
        )}

        {/* User count badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-white/10">
          <Users size={10} className="text-violet-400" />
          <span className="text-xs font-bold text-slate-300">{game.user_count}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
          {game.title}
        </h3>
        {game.genres && (
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {game.genres.split(',').map(g => g.trim()).slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </>
  );

  return href ? (
    <Link href={href} className="group relative flex flex-col">
      {content}
    </Link>
  ) : (
    <div className="group relative flex flex-col">
      {content}
    </div>
  );
}
