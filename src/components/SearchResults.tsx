'use client';

import Image from 'next/image';
import { RawgGame } from '@/lib/rawg';
import { Plus, Loader } from 'lucide-react';
import { useState } from 'react';

interface SearchResultsProps {
  games: RawgGame[];
  isLoading?: boolean;
  onAddGame?: (game: RawgGame) => Promise<void>;
}

export function SearchResults({ games, isLoading = false, onAddGame }: SearchResultsProps) {
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddGame = async (game: RawgGame) => {
    if (!onAddGame) return;
    
    setAddingId(game.id);
    try {
      await onAddGame(game);
      setAddedIds(prev => new Set(prev).add(game.id));
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-violet-500" size={32} />
          <p className="text-slate-300">Поиск игр...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Игры не найдены. Попробуйте другой запрос.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => {
        const isAdded = addedIds.has(game.id);
        const isAdding = addingId === game.id;

        return (
          <div
            key={game.id}
            className="flex gap-4 p-4 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all"
          >
            {/* Game Image */}
            {game.background_image && (
              <div className="flex-shrink-0 h-24 w-40 relative rounded overflow-hidden bg-slate-900">
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Game Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {game.name}
                </h3>
                {game.released && (
                  <p className="text-sm text-slate-400">
                    Вышла: {new Date(game.released).getFullYear()}
                  </p>
                )}
                {game.genres && game.genres.length > 0 && (
                  <p className="text-xs text-slate-300 mt-1">
                    {game.genres.map(g => g.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Rating */}
              {game.rating && (
                <p className="text-sm text-violet-300 font-medium">
                  ★ {game.rating.toFixed(1)} / 5.0
                </p>
              )}
            </div>

            {/* Add Button */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => handleAddGame(game)}
                disabled={isAdding || isAdded}
                className={`p-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  isAdded
                    ? 'bg-emerald-600 text-emerald-100 cursor-default'
                    : isAdding
                    ? 'bg-slate-700 text-slate-300 cursor-wait'
                    : 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer'
                }`}
              >
                {isAdding ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span className="hidden sm:inline text-sm">
                  {isAdded ? 'Добавлено' : 'Добавить'}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
