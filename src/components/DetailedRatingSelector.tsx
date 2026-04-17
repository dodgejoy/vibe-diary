'use client';

import { useState, useEffect, useMemo } from 'react';
import { DetailedRatings, getMaxScore, getNormalizedScore } from '@/lib/supabase';
import { X, Check, RotateCcw, Zap, BookOpen } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface DetailedRatingSelectorProps {
  value?: DetailedRatings | null;
  onChange: (ratings: DetailedRatings) => void;
  gameTitle?: string;
  genres?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CriterionDef = {
  key: keyof DetailedRatings;
  name: string;
  max: number;
  color: string;
  hex: string;
  icon: string;
  desc: string;
};

const STORY_GENRES = [
  'rpg', 'adventure', 'action rpg', 'role-playing', 'visual novel',
  'interactive fiction', 'narrative', 'story', 'jrpg', 'crpg',
  'point-and-click', 'walking simulator', 'horror', 'survival horror',
];

function isStoryGame(genres?: string): boolean {
  if (!genres) return false;
  const lower = genres.toLowerCase();
  return STORY_GENRES.some((g) => lower.includes(g));
}

function getMoodEmoji(score: number): string {
  if (score >= 85) return '🤩';
  if (score >= 75) return '😍';
  if (score >= 65) return '😊';
  if (score >= 55) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😕';
  return '💤';
}

export function DetailedRatingSelector({
  value,
  onChange,
  gameTitle = 'Игра',
  genres,
  isOpen = true,
  onOpenChange,
}: DetailedRatingSelectorProps) {
  const { t } = useTranslation();

  const BASE_CRITERIA: CriterionDef[] = [
    { key: 'gameplay', name: t('ratingSelector.gameplay'), max: 20, color: 'from-blue-500 to-indigo-500', hex: '#6366f1', icon: '🎮', desc: t('ratingSelector.gameplayDesc') },
    { key: 'visuals', name: t('ratingSelector.visuals'), max: 15, color: 'from-cyan-400 to-blue-500', hex: '#0ea5e9', icon: '🎨', desc: t('ratingSelector.visualsDesc') },
    { key: 'atmosphere', name: t('ratingSelector.atmosphere'), max: 15, color: 'from-fuchsia-500 to-purple-600', hex: '#a855f7', icon: '🌌', desc: t('ratingSelector.atmosphereDesc') },
    { key: 'sound', name: t('ratingSelector.sound'), max: 10, color: 'from-violet-400 to-fuchsia-500', hex: '#d946ef', icon: '🎵', desc: t('ratingSelector.soundDesc') },
    { key: 'technical', name: t('ratingSelector.technical'), max: 10, color: 'from-emerald-400 to-teal-500', hex: '#14b8a6', icon: '⚙️', desc: t('ratingSelector.technicalDesc') },
    { key: 'content', name: t('ratingSelector.content'), max: 10, color: 'from-orange-400 to-amber-500', hex: '#f59e0b', icon: '📦', desc: t('ratingSelector.contentDesc') },
    { key: 'impression', name: t('ratingSelector.impression'), max: 10, color: 'from-rose-400 to-pink-500', hex: '#f43f5e', icon: '💎', desc: t('ratingSelector.impressionDesc') },
  ];

  const STORY_CRITERION: CriterionDef = {
    key: 'story', name: t('ratingSelector.story'), max: 15, color: 'from-amber-400 to-yellow-500', hex: '#eab308', icon: '📖', desc: t('ratingSelector.storyDesc'),
  };

  const BASE_PRESETS: { name: string; emoji: string; ratings: DetailedRatings }[] = [
    { name: t('ratingSelector.presetMasterpiece'), emoji: '👑', ratings: { gameplay: 18, visuals: 14, atmosphere: 14, sound: 9, technical: 9, content: 9, impression: 10 } },
    { name: t('ratingSelector.presetExcellent'), emoji: '🔥', ratings: { gameplay: 16, visuals: 12, atmosphere: 12, sound: 8, technical: 8, content: 8, impression: 8 } },
    { name: t('ratingSelector.presetGood'), emoji: '👍', ratings: { gameplay: 13, visuals: 10, atmosphere: 10, sound: 7, technical: 7, content: 7, impression: 7 } },
    { name: t('ratingSelector.presetMediocre'), emoji: '😐', ratings: { gameplay: 10, visuals: 8, atmosphere: 7, sound: 5, technical: 5, content: 5, impression: 5 } },
    { name: t('ratingSelector.presetWeak'), emoji: '👎', ratings: { gameplay: 6, visuals: 4, atmosphere: 4, sound: 3, technical: 3, content: 3, impression: 3 } },
  ];

  function presetsWithStory(include: boolean): typeof BASE_PRESETS {
    if (!include) return BASE_PRESETS;
    return BASE_PRESETS.map((p) => ({
      ...p,
      ratings: { ...p.ratings, story: Math.round((Object.values(p.ratings).reduce((a, b) => a + b, 0) / 90) * 15) },
    }));
  }

  function getCriterionLevel(value: number, max: number): { label: string; color: string } {
    const pct = value / max;
    if (pct >= 0.9) return { label: t('ratingSelector.levelExcellent'), color: 'text-yellow-400' };
    if (pct >= 0.75) return { label: t('ratingSelector.levelGreat'), color: 'text-emerald-400' };
    if (pct >= 0.6) return { label: t('ratingSelector.levelGood'), color: 'text-blue-400' };
    if (pct >= 0.4) return { label: t('ratingSelector.levelOk'), color: 'text-orange-400' };
    if (pct > 0) return { label: t('ratingSelector.levelWeak'), color: 'text-rose-400' };
    return { label: t('ratingSelector.levelNone'), color: 'text-slate-600' };
  }

  const showStory = isStoryGame(genres) || (value != null && 'story' in value && value.story !== undefined);
  const CRITERIA = useMemo(() => showStory ? [...BASE_CRITERIA, STORY_CRITERION] : BASE_CRITERIA, [showStory]);
  const PRESETS = useMemo(() => presetsWithStory(showStory), [showStory]);

  const defaultRatings: DetailedRatings = showStory
    ? { gameplay: 0, visuals: 0, atmosphere: 0, sound: 0, technical: 0, content: 0, impression: 0, story: 0 }
    : { gameplay: 0, visuals: 0, atmosphere: 0, sound: 0, technical: 0, content: 0, impression: 0 };

  const [ratings, setRatings] = useState<DetailedRatings>(value || defaultRatings);

  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const totalScore = Object.values(ratings).reduce((a, b) => a + (b ?? 0), 0);
  const maxScore = getMaxScore(ratings);
  const normalizedScore = getNormalizedScore(ratings).toFixed(1);
  const scorePercent = totalScore / maxScore;

  const getScoreData = (score: number) => {
    if (score >= 80) return { color: 'text-yellow-400', hex: '#facc15', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' };
    if (score >= 70) return { color: 'text-emerald-400', hex: '#34d399', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { color: 'text-blue-400', hex: '#60a5fa', shadow: 'shadow-blue-500/20', bg: 'bg-blue-500/10' };
    if (score >= 50) return { color: 'text-orange-400', hex: '#fb923c', shadow: 'shadow-orange-500/20', bg: 'bg-orange-500/10' };
    return { color: 'text-rose-400', hex: '#fb7185', shadow: 'shadow-rose-500/20', bg: 'bg-rose-500/10' };
  };

  const scoreData = getScoreData(totalScore);

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t('ratingSelector.scoreMasterpiece');
    if (score >= 75) return t('ratingSelector.scoreExcellent');
    if (score >= 65) return t('ratingSelector.scoreGood');
    if (score >= 55) return t('ratingSelector.scoreDecent');
    if (score >= 40) return t('ratingSelector.scoreAcceptable');
    return t('ratingSelector.scoreWeak');
  };

  const handleCriterionChange = (key: keyof DetailedRatings, newValue: number) => {
    const criterion = CRITERIA.find((c) => c.key === key);
    const clampedValue = Math.max(0, Math.min(newValue, criterion?.max || 0));

    const updatedRatings = { ...ratings, [key]: clampedValue };
    setRatings(updatedRatings);
    onChange(updatedRatings);
  };

  const applyPreset = (preset: DetailedRatings) => {
    setRatings(preset);
    onChange(preset);
  };

  const resetRatings = () => {
    setRatings(defaultRatings);
    onChange(defaultRatings);
  };

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  if (!open) return null;

  // Radar Chart Calculations
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 50;
  const angleStep = (Math.PI * 2) / CRITERIA.length;

  const getPoint = (percentage: number, i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + radius * percentage * Math.cos(angle),
      y: center + radius * percentage * Math.sin(angle),
    };
  };

  const getLabelPoint = (i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius + 32;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  const points = CRITERIA.map((crit, i) => {
    const percentage = (ratings[crit.key] ?? 0) / crit.max;
    return getPoint(percentage, i);
  });
  
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Score ring
  const ringSize = 160;
  const ringCenter = ringSize / 2;
  const ringRadius = 66;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - scorePercent);

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-40 transition-all duration-500"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-6xl max-h-[95vh] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle global gradient glow in background */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Left panel: Radial Chart, Score Ring, Mood */}
          <div className="w-full md:w-[42%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-between relative overflow-y-auto">
            <div className="w-full">
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{gameTitle}</h3>
            </div>

            {/* Score Ring */}
            <div className="relative my-4 flex items-center justify-center">
              <svg width={ringSize} height={ringSize} className="rotate-[-90deg]">
                <circle cx={ringCenter} cy={ringCenter} r={ringRadius} fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth="10" />
                <circle
                  cx={ringCenter} cy={ringCenter} r={ringRadius} fill="none"
                  stroke={scoreData.hex}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700 ease-out"
                  style={{ filter: `drop-shadow(0 0 8px ${scoreData.hex}40)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl leading-none">{getMoodEmoji(totalScore)}</span>
                <span className={`text-3xl font-black ${scoreData.color} tracking-tighter mt-1`}>
                  {normalizedScore}
                </span>
                <span className="text-xs text-slate-500 font-bold">/10</span>
              </div>
            </div>

            <div className="text-center mb-2">
              <div className={`text-xl font-black text-white tracking-widest uppercase drop-shadow-md`}>
                {getScoreLabel(totalScore)}
              </div>
              <div className="text-slate-400 text-sm font-medium mt-1">{totalScore} / {maxScore} {t('common.points')}</div>
            </div>
            
            {/* Radar Chart */}
            <div className="relative w-full aspect-square max-w-[260px] flex items-center justify-center">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl overflow-visible">
                <defs>
                  <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0.05" />
                  </radialGradient>
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
                
                {/* Data Polygon */}
                <polygon
                  points={pointsString}
                  fill="url(#radarGradient)"
                  stroke="#a855f7"
                  strokeWidth="3"
                  className="transition-all duration-500 ease-out"
                />
                
                {/* Data Points */}
                {points.map((p, i) => (
                  <circle
                    key={i} cx={p.x} cy={p.y} r="5" fill={CRITERIA[i].hex}
                    className="transition-all duration-500 ease-out"
                    filter="url(#glow)"
                  />
                ))}

                {/* Criterion Labels on Chart */}
                {CRITERIA.map((crit, i) => {
                  const lp = getLabelPoint(i);
                  return (
                    <text
                      key={crit.key}
                      x={lp.x}
                      y={lp.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-slate-400 text-[10px] font-bold"
                    >
                      {crit.icon} {crit.name}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right panel: Presets + Sliders */}
          <div className="w-full md:w-[58%] p-6 md:p-8 bg-slate-900/30 relative flex flex-col overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">{t('ratingSelector.detailPanel')}</h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">{t('ratingSelector.detailPanelDesc')}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all hover:scale-105 hover:shadow-lg border border-white/5"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap size={14} className="text-violet-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('ratingSelector.quickPresets')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.ratings)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800/80 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-violet-500/30 transition-all"
                  >
                    {preset.emoji} {preset.name}
                  </button>
                ))}
                <button
                  onClick={resetRatings}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800/80 border border-white/5 text-slate-500 hover:text-rose-400 hover:bg-slate-700 hover:border-rose-500/30 transition-all flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  {t('common.reset')}
                </button>
              </div>
              {showStory && (
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
                  <BookOpen size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{t('ratingSelector.storyActive')}</span>
                </div>
              )}
            </div>

            {/* Sliders */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {CRITERIA.map((criterion) => {
                const val = ratings[criterion.key] ?? 0;
                const pct = (val / criterion.max) * 100;
                const level = getCriterionLevel(val, criterion.max);

                return (
                  <div key={criterion.key} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{criterion.icon}</span>
                        <div>
                          <label className="font-bold text-slate-300 text-sm tracking-wide group-hover:text-white transition-colors">
                            {criterion.name}
                          </label>
                          <p className="text-[11px] text-slate-600 font-medium leading-tight">{criterion.desc}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${level.color} hidden sm:inline`}>{level.label}</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black text-white leading-none">
                            {val}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/{criterion.max}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-3.5 bg-slate-950/80 rounded-full overflow-hidden shadow-inner border border-white/5 border-t-black/50">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${criterion.color} transition-all duration-300 ease-out opacity-90 group-hover:opacity-100`}
                        style={{ width: `${pct}%` }}
                      />
                      {/* Tick marks */}
                      {[25, 50, 75].map((tick) => (
                        <div
                          key={tick}
                          className="absolute top-0 h-full w-px bg-white/5"
                          style={{ left: `${tick}%` }}
                        />
                      ))}
                      <input
                        type="range"
                        min="0"
                        max={criterion.max}
                        value={val}
                        onChange={(e) => handleCriterionChange(criterion.key, parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-lg rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] border border-white/10"
              >
                <Check size={22} strokeWidth={3} />
                {t('ratingSelector.saveToDiary')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
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
