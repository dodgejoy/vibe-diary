'use client';

import { useEffect, useState } from 'react';
import { PopularGame, fetchPopularGames } from '@/lib/supabase';
import { Flame, Users, Star, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';
import { useSiteSettings } from '@/lib/siteSettings';

export default function PopularPage() {
  const [games, setGames] = useState<PopularGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { isFeatureEnabled } = useSiteSettings();

  if (!isFeatureEnabled('popularPage')) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t('common.toHome')}
          </Link>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
            <h1 className="text-3xl font-extrabold text-white mb-3">{t('popular.heading')}</h1>
            <p className="text-slate-400">Раздел временно отключён в настройках сайта.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const data = await fetchPopularGames(50);
      if (!cancelled) {
        setGames(data);
        setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-violet-500/30">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] left-[20%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] bg-red-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t('common.toHome')}
          </Link>

          <div className="flex items-start gap-4 sm:gap-5">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3 sm:p-4 rounded-2xl border border-orange-500/20 flex-shrink-0">
              <Flame size={32} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {t('popular.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">{t('popular.brandName')}</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 mt-2 max-w-2xl">
                {t('popular.subtitle')}
              </p>
            </div>
          </div>

          {!isLoading && games.length > 0 && (
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl">
                <TrendingUp size={16} className="text-violet-400" />
                <span className="text-sm font-bold text-white">{games.length}</span>
                <span className="text-sm text-slate-400">{t('popular.gamesInCatalog')}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Games Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-slate-800/60 rounded-2xl" />
                  <div className="mt-3 h-4 bg-slate-800/60 rounded-lg w-3/4" />
                  <div className="mt-2 h-3 bg-slate-800/40 rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-slate-900">
                <Flame size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('popular.nothingYet')}</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {t('popular.nothingYetDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {games.map((game, index) => (
                <PopularGameCard key={game.rawg_id ?? game.title} game={game} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PopularGameCard({ game, rank }: { game: PopularGame; rank: number }) {
  const hasScore = game.avg_score !== null && game.avg_score > 0;
  const href = game.rawg_id ? `/games/${game.rawg_id}` : undefined;

  return (
    <div className="group relative flex flex-col">
      {href ? (
        <Link href={href} className="contents">
          <CardContent game={game} rank={rank} hasScore={hasScore} />
        </Link>
      ) : (
        <CardContent game={game} rank={rank} hasScore={hasScore} />
      )}
    </div>
  );
}

function CardContent({ game, rank, hasScore }: { game: PopularGame; rank: number; hasScore: boolean }) {
  return (
    <>
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

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/90 to-transparent" />

        {rank <= 3 && (
          <div className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black shadow-lg ${
            rank === 1 ? 'bg-yellow-500 text-yellow-950' :
            rank === 2 ? 'bg-slate-300 text-slate-800' :
            'bg-amber-700 text-amber-100'
          }`}>
            {rank}
          </div>
        )}

        {hasScore && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-white/10">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white">{game.avg_score!.toFixed(1)}</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg border border-white/10">
          <Users size={10} className="text-violet-400" />
          <span className="text-xs font-bold text-slate-300">{game.user_count}</span>
        </div>
      </div>

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
}
