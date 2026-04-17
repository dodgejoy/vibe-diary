'use client';

import { Game, getNormalizedScore } from '@/lib/supabase';
import { GameCard3D } from './GameCard3D';
import { useEffect, useMemo, useState } from 'react';
import { Filter, Heart, RotateCcw, Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface GameGridProps {
  games: Game[];
}

type SortOption = 'newest' | 'oldest' | 'rating' | 'title' | 'status';
type StatusFilter = 'all' | 'Not Started' | 'Playing' | 'Completed' | 'Abandoned';
type CollectionFilter = 'all' | 'favorites' | 'rated' | 'unrated';

function getNormalizedRating(game: Game): number {
  if (!game.detailed_ratings) {
    return 0;
  }

  return getNormalizedScore(game.detailed_ratings) / 10;
}

export function GameGrid({ games }: GameGridProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());

  const favoritesStorageKey = `favorite_games_${user?.id || 'anonymous'}`;

  useEffect(() => {
    const savedFavorites = localStorage.getItem(favoritesStorageKey);

    if (!savedFavorites) {
      setFavoriteGameIds(new Set());
      return;
    }

    try {
      setFavoriteGameIds(new Set(JSON.parse(savedFavorites) as string[]));
    } catch {
      setFavoriteGameIds(new Set());
    }
  }, [favoritesStorageKey]);

  const persistFavorites = (nextFavorites: Set<string>) => {
    setFavoriteGameIds(nextFavorites);
    localStorage.setItem(favoritesStorageKey, JSON.stringify(Array.from(nextFavorites)));
  };

  const handleToggleFavorite = (gameId: string) => {
    const nextFavorites = new Set(favoriteGameIds);
    if (nextFavorites.has(gameId)) {
      nextFavorites.delete(gameId);
    } else {
      nextFavorites.add(gameId);
    }

    persistFavorites(nextFavorites);
  };

  const clearFilters = () => {
    setSortBy('newest');
    setStatusFilter('all');
    setCollectionFilter('all');
    setSearchQuery('');
  };

  const ratedCount = useMemo(() => games.filter((game) => Boolean(game.detailed_ratings)).length, [games]);
  const favoriteCount = useMemo(() => games.filter((game) => favoriteGameIds.has(game.id)).length, [games, favoriteGameIds]);
  const averagePersonalScore = useMemo(() => {
    if (!ratedCount) return null;
    return (games.filter((game) => game.detailed_ratings).reduce((sum, game) => sum + getNormalizedRating(game), 0) / ratedCount) * 10;
  }, [games, ratedCount]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : game.title.toLowerCase().includes(normalizedQuery) ||
            (game.genres || '').toLowerCase().includes(normalizedQuery) ||
            game.status.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === 'all' ? true : game.status === statusFilter;

      const matchesCollection =
        collectionFilter === 'all'
          ? true
          : collectionFilter === 'favorites'
          ? favoriteGameIds.has(game.id)
          : collectionFilter === 'rated'
          ? Boolean(game.detailed_ratings)
          : !game.detailed_ratings;

      return matchesSearch && matchesStatus && matchesCollection;
    });
  }, [collectionFilter, favoriteGameIds, games, searchQuery, statusFilter]);

  // Sort games
  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'rating':
          return getNormalizedRating(b) - getNormalizedRating(a);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status': {
          const statusOrder = {
            'Playing': 0,
            'Not Started': 1,
            'Completed': 2,
            'Abandoned': 3,
          };
          return (statusOrder[a.status as keyof typeof statusOrder] || 99) -
                 (statusOrder[b.status as keyof typeof statusOrder] || 99);
        }
        default:
          return 0;
      }
    });
  }, [filteredGames, sortBy]);

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          Игр пока нет
        </h3>
        <p className="text-slate-400 mb-6">
          Добавь свою первую игру в дневник
        </p>
        <a
          href="/add-game"
          className="px-6 py-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          Добавить первую игру
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
            <Sparkles size={14} className="text-violet-400" />
            Отображается
          </div>
          <div className="text-3xl font-extrabold text-white">{sortedGames.length}</div>
          <div className="text-sm text-slate-500 mt-1">Из {games.length} отслеженных игр</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
            <Star size={14} className="text-yellow-400" />
            Личные оценки
          </div>
          <div className="text-3xl font-extrabold text-white">{ratedCount}</div>
          <div className="text-sm text-slate-500 mt-1">
            {averagePersonalScore !== null ? `Средняя ${averagePersonalScore.toFixed(1)} / 10` : 'Оценок пока нет'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
            <Heart size={14} className="text-rose-400" />
            Избранное
          </div>
          <div className="text-3xl font-extrabold text-white">{favoriteCount}</div>
          <div className="text-sm text-slate-500 mt-1">Закреплено для быстрого доступа</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">
            <SlidersHorizontal size={14} className="text-sky-400" />
            Вид библиотеки
          </div>
          <div className="text-lg font-bold text-white line-clamp-2">
            {collectionFilter === 'all' ? 'Вся коллекция' : `${collectionFilter[0].toUpperCase()}${collectionFilter.slice(1)} only`}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {statusFilter === 'all' ? 'Все статусы' : statusFilter}
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по библиотеке по названию, жанру или статусу..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              <Filter size={18} />
              Фильтры
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="rating">По оценке</option>
              <option value="title">По названию (А-Я)</option>
              <option value="status">По статусу</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || collectionFilter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
              >
                <RotateCcw size={16} />
                Сбросить
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Все', count: games.length },
            { key: 'favorites', label: 'Избранное', count: favoriteCount },
            { key: 'rated', label: 'С оценкой', count: ratedCount },
            { key: 'unrated', label: 'Без оценки', count: games.length - ratedCount },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setCollectionFilter(filter.key as CollectionFilter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                collectionFilter === filter.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3 animate-in fade-in">
          <h3 className="font-semibold text-white mb-3">Статус</h3>
          <div className="flex flex-wrap gap-2">
            {['all', 'Not Started', 'Playing', 'Completed', 'Abandoned'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status === 'all' ? 'Все статусы' : status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-slate-400 flex flex-wrap gap-x-4 gap-y-2">
        <span>Показано {sortedGames.length} из {games.length} игр</span>
        {searchQuery && <span>Поиск: "{searchQuery}"</span>}
        {collectionFilter !== 'all' && <span>Коллекция: {collectionFilter}</span>}
        {statusFilter !== 'all' && <span>Статус: {statusFilter}</span>}
      </div>

      {/* Game Grid */}
      {sortedGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
          {sortedGames.map((game) => (
            <div key={game.id} style={{ perspective: '1000px' }}>
              <GameCard3D
                game={game}
                isFavorite={favoriteGameIds.has(game.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-slate-400">
            Попробуйте изменить поиск, фильтр коллекции или статус.
          </p>
        </div>
      )}
    </div>
  );
}
