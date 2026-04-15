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

  const getScoreData = (score: number) => {
    if (score >= 80) return { color: 'text-yellow-400', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' };
    if (score >= 70) return { color: 'text-emerald-400', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { color: 'text-blue-400', shadow: 'shadow-blue-500/20', bg: 'bg-blue-500/10' };
    if (score >= 50) return { color: 'text-orange-400', shadow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' };
    return { color: 'text-rose-400', shadow: 'shadow-rose-500/20', bg: 'bg-rose-500/10' };
  };

  const scoreData = getScoreData(totalScore);

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
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 30;
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
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-40 transition-all duration-500"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle global gradient glow in background */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Left panel: Radial Chart and Total */}
          <div className="w-full md:w-[45%] p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center relative">
            <div className="absolute top-8 left-8">
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{gameTitle}</h3>
            </div>
            
            <div className="relative w-full aspect-square max-w-[280px] mt-8 flex-1 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl overflow-visible">
                <defs>
                  <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0.05" />
                  </radialGradient>
                  {/* Glowing filter for nodes */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

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
                    className="text-slate-700/20"
                    strokeWidth={level === 4 ? "2" : "1"}
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
                      strokeDasharray="4 4"
                    />
                  );
                })}
                
                {/* Data Polygon Profile */}
                <polygon
                  points={pointsString}
                  fill="url(#radarGradient)"
                  stroke="#a855f7"
                  strokeWidth="3"
                  className="transition-all duration-500 ease-out"
                />
                
                {/* Data Points / Nodes */}
                {points.map((p, i) => (
                  <circle
                    key={i} cx={p.x} cy={p.y} r="5" fill={CRITERIA[i].hex}
                    className="transition-all duration-500 ease-out"
                    filter="url(#glow)"
                  />
                ))}
              </svg>
            </div>

            <div className="mt-6 text-center space-y-1">
              <div className="flex items-center justify-center gap-3">
                <div className={`p-2 rounded-xl ${scoreData.bg} ${scoreData.color} shadow-lg ${scoreData.shadow}`}>
                  <Star className="fill-current drop-shadow-md" size={32} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-6xl font-black ${scoreData.color} tracking-tighter drop-shadow-lg`}>
                    {normalizedScore}
                  </span>
                  <span className="text-2xl text-slate-500 font-bold">/10</span>
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-widest uppercase pt-2 drop-shadow-md">
                {getScoreLabel(totalScore)}
              </div>
              <div className="text-slate-400 font-medium">Суммарно: <span className="text-white">{totalScore}</span> / 90</div>
            </div>
          </div>

          {/* Right panel: Sliders */}
          <div className="w-full md:w-[55%] p-8 bg-slate-900/30 relative flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Детализация</h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Отрегулируйте метрики для точной оценки</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all hover:scale-105 hover:shadow-lg border border-white/5"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {CRITERIA.map((criterion) => (
                <div key={criterion.key} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <label className="font-bold text-slate-300 text-sm tracking-widest uppercase group-hover:text-white transition-colors">
                      {criterion.name}
                    </label>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white leading-none drop-shadow-sm">
                        {ratings[criterion.key]}
                      </span>
                      <span className="text-sm text-slate-500 font-bold">/ {criterion.max}</span>
                    </div>
                  </div>

                  <div className="relative h-4 bg-slate-950/80 rounded-full overflow-hidden shadow-inner border border-white/5 border-t-black/50">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${criterion.color} transition-all duration-300 ease-out opacity-90 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
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

            <div className="mt-8 pt-8 border-t border-white/5">
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] border border-white/10"
              >
                <Check size={22} strokeWidth={3} />
                Сохранить в дневник
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles for Sliders & Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
      `}} />
    </>
  );
}
