'use client';

import { GameDetails } from '@/lib/rawg';
import { Award, Zap, Users, Building2, Gamepad2, Globe, Cpu } from 'lucide-react';

interface GameInfoPanelProps {
  details: GameDetails | null;
}

export function GameInfoPanel({ details }: GameInfoPanelProps) {
  if (!details) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Ratings & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {details.rating != null && details.rating > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{details.rating.toFixed(1)}</div>
            <div className="text-xs text-slate-400 mt-1">RAWG Рейтинг</div>
          </div>
        )}

        {details.metacritic != null && details.metacritic > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{details.metacritic}</div>
            <div className="text-xs text-slate-400 mt-1">Metacritic</div>
          </div>
        )}

        {details.playtime != null && details.playtime > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{details.playtime}h</div>
            <div className="text-xs text-slate-400 mt-1">Ср. время игры</div>
          </div>
        )}

        {details.achievements_count != null && details.achievements_count > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{details.achievements_count}</div>
            <div className="text-xs text-slate-400 mt-1">Достижения</div>
          </div>
        )}
      </div>

      {/* Description */}
      {details.description_raw && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Об игре</h2>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-6">
            {details.description_raw}
          </p>
        </div>
      )}

      {/* Developers & Publishers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Developers */}
        {details.developers && details.developers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Users size={18} className="text-violet-400" />
              Разработчики
            </div>
            <div className="flex flex-wrap gap-2">
              {details.developers.map((dev) => (
                <span
                  key={dev.name}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300"
                >
                  {dev.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Publishers */}
        {details.publishers && details.publishers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Building2 size={18} className="text-violet-400" />
              Издатели
            </div>
            <div className="flex flex-wrap gap-2">
              {details.publishers.map((pub) => (
                <span
                  key={pub.name}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300"
                >
                  {pub.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platforms */}
      {details.platforms && details.platforms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Gamepad2 size={18} className="text-violet-400" />
            Platforms
          </div>
          <div className="flex flex-wrap gap-2">
            {details.platforms.map((platform) => (
              <span
                key={platform.platform.name}
                className="px-3 py-1 bg-violet-900/30 border border-violet-700/50 rounded-full text-xs text-violet-200"
              >
                {platform.platform.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
        {details.released && (
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Дата выхода</div>
            <div className="text-sm text-white font-semibold mt-1">
              {new Date(details.released).toLocaleDateString()}
            </div>
          </div>
        )}

        {details.ratings_count != null && details.ratings_count > 0 && (
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Оценки</div>
            <div className="text-sm text-white font-semibold mt-1">
              {details.ratings_count.toLocaleString()}
            </div>
          </div>
        )}

        {details.reviews_count != null && details.reviews_count > 0 && (
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Обзоры</div>
            <div className="text-sm text-white font-semibold mt-1">
              {details.reviews_count.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Website Link */}
      {details.website && (
        <a
          href={details.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white rounded-lg transition-colors font-medium"
        >
          <Globe size={16} />
          Официальный сайт
        </a>
      )}
    </div>
  );
}
