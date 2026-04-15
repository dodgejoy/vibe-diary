'use client';

import { useState, useEffect } from 'react';
import { DetailedRatings } from '@/lib/supabase';
import { X, Check, Star } from 'lucide-react';

interface DetailedRatingSelectorProps {
  value?: DetailedRatings | null;
  onChange: (ratings: DetailedRatings) => void;
  gameTitle?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CRITERIA = [
  { key: 'gameplay' as const, name: 'Геймплей', max: 20, color: 'from-blue-500 to-indigo-500', hex: '#6366f1' },
  { key: 'visuals' as const, name: 'Визуал', max: 15, color: 'from-cyan-400 to-blue-500', hex: '#0ea5e9' },
  { key: 'atmosphere' as const, name: 'Атмосфера', max: 15, color: 'from-fuchsia-500 to-purple-600', hex: '#a855f7' },
  { key: 'sound' as const, name: 'Звук', max: 10, color: 'from-violet-400 to-fuchsia-500', hex: '#d946ef' },
  { key: 'technical' as const, name: 'Техника', max: 10, color: 'from-emerald-400 to-teal-500', hex: '#14b8a6' },
  { key: 'content' as const, name: 'Контент', max: 10, color: 'from-orange-400 to-amber-500', hex: '#f59e0b' },
  { key: 'impression' as const, name: 'Впечатление', max: 10, color: 'from-rose-400 to-pink-500', hex: '#f43f5e' },
];

export function DetailedRatingSelector({
  value,
  onChange,
  gameTitle = 'Игра',
  isOpen = true,
  onOpenChange,
}: DetailedRatingSelectorProps) {
  const [ratings, setRatings] = useState<DetailedRatings>(
    value || { gameplay: 0, visuals: 0, atmosphere: 0, sound: 0, technical: 0, content: 0, impression: 0 }
  );

  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0);
  const maxScore = 90;
  const normalizedScore = ((totalScore / maxScore) * 10).toFixed(1);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-yellow-400 shadow-yellow-500/20';
    if (score >= 70) return 'text-green-400 shadow-green-500/20';
    if (score >= 60) return 'text-blue-400 shadow-blue-500/20';
    if (score >= 50) return 'text-orange-400 shadow-orange-500/20';
    return 'text-red-400 shadow-red-500/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Шедевр';
    if (score >= 75) return 'Отлично';
    if (score >= 65) return 'Хорошо';
    if (score >= 55) return 'Неплохо';
    if (score >= 40) return 'Приемлемо';
    return 'Слабо';
  };

  const handleCriterionChange = (key: keyof DetailedRatings, newValue: number) => {
    const criterion = CRITERIA.find((c) => c.key === key);
    const clampedValue = Math.max(0, Math.min(newValue, criterion?.max || 0));

    const updatedRatings = { ...ratings, [key]: clampedValue };
    setRatings(updatedRatings);
    onChange(updatedRatings);
  };

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  if (!open) return null;

  // Radar Chart Calculations
  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 20;
  const angleStep = (Math.PI * 2) / CRITERIA.length;

  const getPoint = (percentage: number, i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + radius * percentage * Math.cos(angle),
      y: center + radius * percentage * Math.sin(angle),
    };
  };

  const points = CRITERIA.map((crit, i) => {
    const percentage = ratings[crit.key] / crit.max;
    return getPoint(percentage, i);
  });
  
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-all duration-300"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left panel: Radial Chart and Total */}
          <div className="w-full md:w-1/3 bg-slate-950/50 p-8 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col items-center justify-center relative">
            <div className="absolute top-4 left-4">
              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{gameTitle}</h3>
            </div>
            
            <div className="relative w-full aspect-square max-w-[200px] mt-6">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
                {/* Background Web */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, level) => (
                  <polygon
                    key={level}
                    points={CRITERIA.map((_, i) => {
                      const p = getPoint(scale, i);
                      return `${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-700/30"
                    strokeWidth="1"
                  />
                ))}
                {/* Axes */}
                {CRITERIA.map((_, i) => {
                  const p = getPoint(1, i);
                  return (
                    <line
                      key={i}
                      x1={center} y1={center} x2={p.x} y2={p.y}
                      stroke="currentColor"
                      className="text-slate-700/30"
                      strokeWidth="1"
                    />
                  );
                })}
                {/* Data Polygon */}
                <polygon
                  points={pointsString}
                  fill="url(#radarGradient)"
                  stroke="#a855f7"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                {/* Data Points */}
                {points.map((p, i) => (
                  <circle
                    key={i} cx={p.x} cy={p.y} r="4" fill={CRITERIA[i].hex}
                    className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  />
                ))}
                <defs>
                  <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className={`fill-current ${getScoreColor(totalScore)}`} size={32} />
                <span className={`text-5xl font-black ${getScoreColor(totalScore)} tracking-tighter`}>
                  {normalizedScore}
                </span>
                <span className="text-xl text-slate-500 font-bold mt-3">/ 10</span>
              </div>
              <div className="text-lg font-bold text-white tracking-wide uppercase">
                {getScoreLabel(totalScore)}
              </div>
              <div className="text-slate-400 text-sm mt-1">{totalScore} из 90 баллов</div>
            </div>
          </div>

          {/* Right panel: Sliders */}
          <div className="w-full md:w-2/3 p-8 bg-slate-900 border-t border-white/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Детальная оценка</h2>
                <p className="text-slate-400 text-sm mt-1">Оцени каждый аспект игры</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[50vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar">
              {CRITERIA.map((criterion) => (
                <div key={criterion.key} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-slate-200 text-sm tracking-wide">
                      {criterion.name}
                    </label>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white leading-none">
                        {ratings[criterion.key]}
                      </span>
                      <span className="text-xs text-slate-500 font-bold ml-1">/ {criterion.max}</span>
                    </div>
                  </div>

                  <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${criterion.color} transition-all duration-300 ease-out`}
                      style={{ width: `${(ratings[criterion.key] / criterion.max) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={criterion.max}
                      value={ratings[criterion.key]}
                      onChange={(e) => handleCriterionChange(criterion.key, parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-white/10"
              >
                <Check size={18} strokeWidth={3} />
                Сохранить оценки
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a little local style for the custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}} />
    </>
  );
}

