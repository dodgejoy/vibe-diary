'use client';

import { Game } from '@/lib/supabase';
import { GameCard3D } from './GameCard3D';
import { useState } from 'react';
import { Filter } from 'lucide-react';

interface GameGridProps {
  games: Game[];
}

type SortOption = 'newest' | 'oldest' | 'rating' | 'title' | 'status';
type StatusFilter = 'all' | 'Not Started' | 'Playing' | 'Completed' | 'Abandoned';

export function GameGrid({ games }: GameGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter games
  const filteredGames = games.filter((game) => {
    if (statusFilter === 'all') return true;
    return game.status === statusFilter;
  });

  // Sort games
  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        const statusOrder = {
          'Playing': 0,
          'Not Started': 1,
          'Completed': 2,
          'Abandoned': 3,
        };
        return (statusOrder[a.status as keyof typeof statusOrder] || 99) -
               (statusOrder[b.status as keyof typeof statusOrder] || 99);
      default:
        return 0;
    }
  });

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          No games yet
        </h3>
        <p className="text-slate-400 mb-6">
          Start by adding your first game to your diary
        </p>
        <a
          href="/add-game"
          className="px-6 py-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          Add Your First Game
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <Filter size={18} />
            Фильтры
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors appearance-none cursor-pointer"
          >
            <option value="newest">Новые сначала</option>
            <option value="oldest">Старые сначала</option>
            <option value="rating">По рейтингу</option>
            <option value="title">По названию (A-Z)</option>
            <option value="status">По статусу</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3 animate-in fade-in">
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
                {status === 'all' ? 'Все игры' : status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Показано {sortedGames.length} из {games.length} игр
      </div>

      {/* Game Grid */}
      {sortedGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
          {sortedGames.map((game) => (
            <div key={game.id} style={{ perspective: '1000px' }}>
              <GameCard3D game={game} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Games not found
          </h3>
          <p className="text-slate-400">
            No games found with the selected filters
          </p>
        </div>
      )}
    </div>
  );
}
