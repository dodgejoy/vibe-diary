'use client';

import { useState, useMemo, memo } from 'react';
import { useTranslation } from '@/i18n';
import {
  Gamepad2,
  Star,
  BookOpen,
  Share2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Sparkles,
  ArrowRight,
  UserCircle2,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Mock Data ─── */

const MOCK_GAMES = [
  {
    id: '1',
    title: 'The Witcher 3: Wild Hunt',
    cover: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6571c2.jpg',
    status: 'Completed' as const,
    score: 9.4,
    genres: 'RPG, Adventure',
    year: 2015,
  },
  {
    id: '2',
    title: 'Hollow Knight',
    cover: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
    status: 'Playing' as const,
    score: 8.7,
    genres: 'Platformer, Metroidvania',
    year: 2017,
  },
  {
    id: '3',
    title: 'Hades',
    cover: 'https://media.rawg.io/media/games/1f4/1f47a270b8f241e4571e04f7c95e2b36.jpg',
    status: 'Completed' as const,
    score: 9.1,
    genres: 'Roguelike, Action',
    year: 2020,
  },
  {
    id: '4',
    title: 'Celeste',
    cover: 'https://media.rawg.io/media/games/594/59487800889ebac294c7c2c070d02356.jpg',
    status: 'Not Started' as const,
    score: 0,
    genres: 'Platformer, Indie',
    year: 2018,
  },
  {
    id: '5',
    title: 'Elden Ring',
    cover: 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg',
    status: 'Abandoned' as const,
    score: 7.2,
    genres: 'RPG, Souls-like',
    year: 2022,
  },
];

const DEMO_RATINGS = {
  gameplay: { value: 18, max: 20 },
  visuals: { value: 14, max: 15 },
  atmosphere: { value: 13, max: 15 },
  sound: { value: 9, max: 10 },
  technical: { value: 7, max: 10 },
  content: { value: 9, max: 10 },
  impression: { value: 9, max: 10 },
  story: { value: 14, max: 15 },
};

/* ─── Status helpers ─── */

const STATUS_CONFIG = {
  'Not Started': { icon: Clock, bg: 'bg-slate-600', text: 'text-white' },
  Playing: { icon: Play, bg: 'bg-violet-600', text: 'text-white' },
  Completed: { icon: CheckCircle, bg: 'bg-emerald-600', text: 'text-white' },
  Abandoned: { icon: XCircle, bg: 'bg-red-600', text: 'text-white' },
} as const;

/* ─── Sub-components ─── */

const DemoTab = memo(function DemoTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
          : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
});

/* ─── Library Tab ─── */

function LibraryDemo() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('demo.library.tracked'), value: '5', color: 'violet' },
          { label: t('demo.library.completed'), value: '2', color: 'emerald' },
          { label: t('demo.library.playing'), value: '1', color: 'sky' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-slate-800/60 border border-${stat.color}-500/20 rounded-xl p-3 text-center`}
          >
            <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {MOCK_GAMES.map((game) => {
          const statusConf = STATUS_CONFIG[game.status];
          const StatusIcon = statusConf.icon;

          return (
            <div
              key={game.id}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900 border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.cover}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent" />

                {/* Status badge */}
                <div
                  className={`absolute top-2 left-2 ${statusConf.bg} rounded-md px-2 py-0.5 flex items-center gap-1`}
                >
                  <StatusIcon size={10} className={statusConf.text} />
                  <span className="text-[10px] font-bold text-white">
                    {t(`demo.status.${game.status}`)}
                  </span>
                </div>

                {/* Score */}
                {game.score > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-slate-950/80 backdrop-blur-sm rounded-md border border-white/10">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{game.score.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 flex-1">
                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
                  {game.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 truncate">{game.genres}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Ratings Tab ─── */

function RatingsDemo() {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState(DEMO_RATINGS);

  const totalScore = useMemo(() => {
    const sum = Object.values(ratings).reduce((a, r) => a + r.value, 0);
    const max = Object.values(ratings).reduce((a, r) => a + r.max, 0);
    return (sum / max) * 10;
  }, [ratings]);

  const criteria = [
    { key: 'gameplay', emoji: '🎮', label: t('demo.ratings.gameplay') },
    { key: 'visuals', emoji: '🎨', label: t('demo.ratings.visuals') },
    { key: 'atmosphere', emoji: '🌌', label: t('demo.ratings.atmosphere') },
    { key: 'sound', emoji: '🎵', label: t('demo.ratings.sound') },
    { key: 'story', emoji: '📖', label: t('demo.ratings.story') },
    { key: 'technical', emoji: '⚙️', label: t('demo.ratings.technical') },
    { key: 'content', emoji: '📦', label: t('demo.ratings.content') },
    { key: 'impression', emoji: '💫', label: t('demo.ratings.impression') },
  ];

  const handleChange = (key: string, val: number) => {
    setRatings((prev) => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], value: val },
    }));
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🤩';
    if (score >= 8) return '😍';
    if (score >= 7) return '😊';
    if (score >= 5) return '😐';
    return '😞';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-6">
      {/* Left - Score ring */}
      <div className="flex flex-col items-center justify-center bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <div className="text-5xl mb-3">{getScoreEmoji(totalScore)}</div>
        <div className="text-4xl font-black text-white">
          {totalScore.toFixed(1)}
          <span className="text-base text-slate-500 ml-1">/ 10</span>
        </div>
        <div className="text-sm font-semibold text-violet-400 mt-1">The Witcher 3</div>
        <p className="text-xs text-slate-500 mt-3 text-center max-w-[200px]">
          {t('demo.ratings.dragHint')}
        </p>
      </div>

      {/* Right - Sliders */}
      <div className="space-y-3">
        {criteria.map(({ key, emoji, label }) => {
          const r = ratings[key as keyof typeof ratings];
          const pct = (r.value / r.max) * 100;
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-semibold text-slate-300">{label}</span>
                </div>
                <span className="text-xs font-bold text-white">
                  {r.value}
                  <span className="text-slate-500">/{r.max}</span>
                </span>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${pct}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={r.max}
                  value={r.value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Review Tab ─── */

function ReviewDemo() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Mock review title */}
      <div className="bg-slate-800/60 border border-white/5 rounded-xl p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
          {t('demo.review.titleLabel')}
        </div>
        <div className="text-lg font-bold text-white">{t('demo.review.sampleTitle')}</div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
            <span>👍</span> {t('demo.review.pros')}
          </div>
          <ul className="space-y-2">
            {[t('demo.review.pro1'), t('demo.review.pro2'), t('demo.review.pro3')].map((pro) => (
              <li
                key={pro}
                className="text-sm text-emerald-200/80 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-800/30"
              >
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3">
            <span>👎</span> {t('demo.review.cons')}
          </div>
          <ul className="space-y-2">
            {[t('demo.review.con1'), t('demo.review.con2')].map((con) => (
              <li
                key={con}
                className="text-sm text-rose-200/80 bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-800/30"
              >
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
          {t('demo.review.notesLabel')}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          {t('demo.review.sampleNotes')}
        </p>
      </div>
    </div>
  );
}

/* ─── Share Card Tab ─── */

function ShareDemo() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[380px] bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Cover */}
        <div className="relative h-[180px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6571c2.jpg"
            alt="The Witcher 3"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />

          {/* Score badge */}
          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
            <div className="text-xl font-black text-white">9.4</div>
            <div className="text-[10px] text-violet-400 font-semibold text-center">{t('demo.share.masterpiece')}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-black text-white leading-tight">The Witcher 3: Wild Hunt</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-md font-semibold">RPG</span>
              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-md font-semibold">Adventure</span>
              <span className="text-xs text-slate-500">2015</span>
            </div>
          </div>

          {/* Mini rating bars */}
          <div className="space-y-2">
            {[
              { label: t('demo.ratings.gameplay'), value: 18, max: 20 },
              { label: t('demo.ratings.visuals'), value: 14, max: 15 },
              { label: t('demo.ratings.story'), value: 14, max: 15 },
              { label: t('demo.ratings.atmosphere'), value: 13, max: 15 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 w-24 truncate">{item.label}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-300 w-10 text-right">
                  {item.value}/{item.max}
                </span>
              </div>
            ))}
          </div>

          {/* Review snippet */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-2">
              &ldquo;{t('demo.review.sampleNotes')}&rdquo;
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs font-bold text-violet-400">VIBE DIARY</span>
            <div className="flex items-center gap-1">
              <CheckCircle size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-400 font-semibold">{t('demo.share.completed')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Tab ─── */

function StatsDemo() {
  const { t } = useTranslation();

  const bars = [
    { label: t('demo.stats.completed'), value: 42, color: 'bg-emerald-500' },
    { label: t('demo.stats.playing'), value: 8, color: 'bg-violet-500' },
    { label: t('demo.stats.notStarted'), value: 15, color: 'bg-slate-500' },
    { label: t('demo.stats.abandoned'), value: 5, color: 'bg-red-500' },
  ];

  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bar chart */}
      <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white mb-4">{t('demo.stats.byStatus')}</h4>
        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">{bar.label}</span>
                <span className="text-xs font-bold text-white">{bar.value}</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                  style={{ width: `${(bar.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5">
          <div className="text-3xl font-black text-white">70</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
            {t('demo.stats.totalGames')}
          </div>
        </div>

        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5">
          <div className="text-3xl font-black text-violet-400">8.2</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
            {t('demo.stats.avgScore')}
          </div>
        </div>

        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">🏆</div>
          <div>
            <div className="text-sm font-bold text-white">RPG</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              {t('demo.stats.topGenre')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Demo Component ─── */

type Tab = 'library' | 'ratings' | 'review' | 'share' | 'stats';

export function InteractiveDemo() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('library');

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'library', icon: Gamepad2, label: t('demo.tabs.library') },
    { id: 'ratings', icon: Star, label: t('demo.tabs.ratings') },
    { id: 'review', icon: BookOpen, label: t('demo.tabs.review') },
    { id: 'share', icon: Share2, label: t('demo.tabs.share') },
    { id: 'stats', icon: BarChart3, label: t('demo.tabs.stats') },
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/50">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-semibold mb-5">
            <Eye size={16} />
            {t('demo.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {t('demo.title')}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('demo.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {tabs.map((tab) => (
            <DemoTab
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl min-h-[400px]">
          {/* Demo label */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-widest mb-5">
            <Sparkles size={12} className="text-violet-500" />
            {t('demo.interactivePreview')}
          </div>

          {activeTab === 'library' && <LibraryDemo />}
          {activeTab === 'ratings' && <RatingsDemo />}
          {activeTab === 'review' && <ReviewDemo />}
          {activeTab === 'share' && <ShareDemo />}
          {activeTab === 'stats' && <StatsDemo />}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:-translate-y-1 text-lg"
          >
            <UserCircle2 size={22} />
            {t('demo.cta')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
