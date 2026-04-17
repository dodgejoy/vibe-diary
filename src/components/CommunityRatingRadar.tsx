'use client';

import { useMemo } from 'react';
import { CommunityRatings } from '@/lib/supabase';
import { Users } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface CommunityRatingRadarProps {
  ratings: CommunityRatings;
}

type CriterionDisplay = {
  key: string;
  name: string;
  value: number;
  max: number;
  icon: string;
  color: string;
};

function buildCriteria(r: CommunityRatings, t: (key: string) => string): CriterionDisplay[] {
  const base: CriterionDisplay[] = [
    { key: 'gameplay', name: t('communityRating.gameplay'), value: r.avg_gameplay, max: 20, icon: '🎮', color: '#6366f1' },
    { key: 'visuals', name: t('communityRating.visuals'), value: r.avg_visuals, max: 15, icon: '🎨', color: '#0ea5e9' },
    { key: 'atmosphere', name: t('communityRating.atmosphere'), value: r.avg_atmosphere, max: 15, icon: '🌌', color: '#a855f7' },
    { key: 'sound', name: t('communityRating.sound'), value: r.avg_sound, max: 10, icon: '🎵', color: '#d946ef' },
    { key: 'technical', name: t('communityRating.technical'), value: r.avg_technical, max: 10, icon: '⚙️', color: '#14b8a6' },
    { key: 'content', name: t('communityRating.content'), value: r.avg_content, max: 10, icon: '📦', color: '#f59e0b' },
    { key: 'impression', name: t('communityRating.impression'), value: r.avg_impression, max: 10, icon: '💎', color: '#f43f5e' },
  ];

  if (r.has_story && r.avg_story > 0) {
    base.push({ key: 'story', name: t('communityRating.story'), value: r.avg_story, max: 15, icon: '📖', color: '#eab308' });
  }

  return base;
}

function getAvgScore(criteria: CriterionDisplay[]): number {
  const total = criteria.reduce((sum, c) => sum + c.value, 0);
  const max = criteria.reduce((sum, c) => sum + c.max, 0);
  return max > 0 ? (total / max) * 10 : 0;
}

export function CommunityRatingRadar({ ratings }: CommunityRatingRadarProps) {
  const { t } = useTranslation();
  const criteria = useMemo(() => buildCriteria(ratings, t), [ratings, t]);
  const avgScore = useMemo(() => getAvgScore(criteria), [criteria]);

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 48;
  const angleStep = (Math.PI * 2) / criteria.length;

  const getPoint = (pct: number, i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + radius * pct * Math.cos(angle),
      y: center + radius * pct * Math.sin(angle),
    };
  };

  const getLabelPoint = (i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius + 30;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = criteria.map((c, i) => getPoint(c.value / c.max, i));
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  const scoreColor = avgScore >= 7.5 ? '#facc15' : avgScore >= 6 ? '#34d399' : avgScore >= 4.5 ? '#60a5fa' : '#fb923c';

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-violet-400" />
          <h3 className="text-lg font-bold text-white">{t('communityRating.title')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            {ratings.rater_count} {ratings.rater_count === 1 ? t('communityRating.ratingOne') : ratings.rater_count < 5 ? t('communityRating.ratingFew') : t('communityRating.ratingMany')}
          </span>
          <span className="text-2xl font-black" style={{ color: scoreColor }}>
            {avgScore.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 font-bold">/10</span>
        </div>
      </div>

      {/* Radar chart */}
      <div className="flex justify-center">
        <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[360px] overflow-visible">
          <defs>
            <radialGradient id="communityRadarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
            </radialGradient>
            <filter id="communityGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background web rings */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, lvl) => (
            <polygon
              key={lvl}
              points={criteria.map((_, i) => {
                const p = getPoint(scale, i);
                return `${p.x},${p.y}`;
              }).join(' ')}
              fill="none"
              stroke="currentColor"
              className="text-slate-700/20"
              strokeWidth={lvl === 4 ? '2' : '1'}
            />
          ))}

          {/* Axes */}
          {criteria.map((_, i) => {
            const p = getPoint(1, i);
            return (
              <line
                key={i}
                x1={center} y1={center} x2={p.x} y2={p.y}
                stroke="currentColor"
                className="text-slate-700/30"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={pointsStr}
            fill="url(#communityRadarGrad)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            className="transition-all duration-500 ease-out"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y} r="4.5"
              fill={criteria[i].color}
              className="transition-all duration-500 ease-out"
              filter="url(#communityGlow)"
            />
          ))}

          {/* Labels */}
          {criteria.map((c, i) => {
            const lp = getLabelPoint(i);
            return (
              <text
                key={c.key}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-400 text-[10px] font-bold"
              >
                {c.icon} {c.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Breakdown bars */}
      <div className="mt-4 space-y-2">
        {criteria.map((c) => {
          const pct = (c.value / c.max) * 100;
          return (
            <div key={c.key} className="flex items-center gap-2 text-xs">
              <span className="w-5 text-center">{c.icon}</span>
              <span className="w-24 text-slate-400 font-medium truncate">{c.name}</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: c.color }}
                />
              </div>
              <span className="w-12 text-right text-slate-300 font-bold tabular-nums">
                {c.value}/{c.max}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
