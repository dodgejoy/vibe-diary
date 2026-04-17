'use client';

import { useState, useRef, useCallback } from 'react';
import { Game, getNormalizedScore, getMaxScore } from '@/lib/supabase';
import { GameDetails } from '@/lib/rawg';
import { X, Download, Eye, EyeOff, Layout, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useTranslation } from '@/i18n';

interface GameShareModalProps {
  game: Game;
  gameDetails: GameDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = 'dark' | 'midnight' | 'amoled';

const THEMES: Record<CardTheme, { name: string; bg: string; cardBg: string; surface: string; border: string; text: string; muted: string; accent: string }> = {
  dark: {
    name: 'dark',
    bg: '#0f172a',
    cardBg: '#0f172a',
    surface: 'rgba(30,41,59,0.5)',
    border: 'rgba(255,255,255,0.08)',
    text: '#f8fafc',
    muted: '#94a3b8',
    accent: '#a78bfa',
  },
  midnight: {
    name: 'midnight',
    bg: '#0c0a1a',
    cardBg: '#0c0a1a',
    surface: 'rgba(30,20,60,0.5)',
    border: 'rgba(139,92,246,0.15)',
    text: '#f8fafc',
    muted: '#818cf8',
    accent: '#c084fc',
  },
  amoled: {
    name: 'amoled',
    bg: '#000000',
    cardBg: '#000000',
    surface: 'rgba(20,20,20,0.8)',
    border: 'rgba(255,255,255,0.06)',
    text: '#ffffff',
    muted: '#71717a',
    accent: '#a78bfa',
  },
};

const STATUS_LABELS_SHARE: Record<string, string> = {
  'Not Started': 'Не начата',
  'Playing': 'Играю',
  'Completed': 'Пройдена',
  'Abandoned': 'Заброшена',
};

export function GameShareModal({ game, gameDetails, isOpen, onClose }: GameShareModalProps) {
  const { t: tr } = useTranslation();
  const [showPersonalScore, setShowPersonalScore] = useState(true);
  const [showMetacritic, setShowMetacritic] = useState(true);
  const [showRawg, setShowRawg] = useState(true);
  const [showReview, setShowReview] = useState(true);
  const [showGenres, setShowGenres] = useState(true);
  const [showStatus, setShowStatus] = useState(true);
  const [showPlaytime, setShowPlaytime] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [theme, setTheme] = useState<CardTheme>('dark');
  const [isGenerating, setIsGenerating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) return;

    setIsGenerating(true);
    try {
      // Run toPng twice — first pass warms up fonts/images, second gives a clean render
      await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: false,
        pixelRatio: 3,
        backgroundColor: THEMES[theme].bg,
      });

      const link = document.createElement('a');
      link.download = `${game.title.replace(/\s+/g, '-').toLowerCase()}-vibe-diary.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  }, [game.title, theme]);

  if (!isOpen) return null;

  const totalScore = game.detailed_ratings
    ? Object.values(game.detailed_ratings).reduce((a, b) => a + (b ?? 0), 0)
    : null;
  const normalizedScore = game.detailed_ratings ? getNormalizedScore(game.detailed_ratings).toFixed(1) : null;
  const maxScore = game.detailed_ratings ? getMaxScore(game.detailed_ratings) : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: '#facc15', border: 'rgba(234,179,8,0.3)', bg: 'rgba(234,179,8,0.15)', gradient: 'from-yellow-400 to-amber-500', label: tr('shareModal.scoreMasterpiece') };
    if (score >= 70) return { text: '#34d399', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.15)', gradient: 'from-emerald-400 to-teal-500', label: tr('shareModal.scoreExcellent') };
    if (score >= 60) return { text: '#60a5fa', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.15)', gradient: 'from-blue-400 to-indigo-500', label: tr('shareModal.scoreGood') };
    if (score >= 50) return { text: '#fb923c', border: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.15)', gradient: 'from-orange-400 to-red-500', label: tr('shareModal.scoreDecent') };
    return { text: '#fb7185', border: 'rgba(244,63,94,0.3)', bg: 'rgba(244,63,94,0.15)', gradient: 'from-rose-400 to-pink-500', label: tr('shareModal.scoreWeak') };
  };

  const scoreStyle = totalScore !== null ? getScoreColor(totalScore) : null;
  const t = THEMES[theme];

  // Rating breakdown for the card
  const ratingCategories = game.detailed_ratings ? [
    { key: 'gameplay', label: tr('ratingSelector.gameplay'), max: 20 },
    { key: 'visuals', label: tr('ratingSelector.visuals'), max: 15 },
    { key: 'atmosphere', label: tr('ratingSelector.atmosphere'), max: 15 },
    { key: 'sound', label: tr('ratingSelector.sound'), max: 10 },
    { key: 'technical', label: tr('ratingSelector.technical'), max: 10 },
    { key: 'content', label: tr('ratingSelector.content'), max: 10 },
    { key: 'impression', label: tr('ratingSelector.impression'), max: 10 },
    ...('story' in game.detailed_ratings && game.detailed_ratings.story !== undefined
      ? [{ key: 'story', label: tr('ratingSelector.story'), max: 15 }]
      : []),
  ] : [];

  const toggleItems = [
    { label: tr('shareModal.showCover'), value: showCover, toggle: () => setShowCover(!showCover) },
    { label: tr('shareModal.showRating'), value: showPersonalScore, toggle: () => setShowPersonalScore(!showPersonalScore) },
    { label: tr('shareModal.showReview'), value: showReview, toggle: () => setShowReview(!showReview) },
    { label: tr('shareModal.showGenres'), value: showGenres, toggle: () => setShowGenres(!showGenres) },
    { label: tr('shareModal.showStatus'), value: showStatus, toggle: () => setShowStatus(!showStatus) },
    { label: tr('shareModal.showPlaytime'), value: showPlaytime, toggle: () => setShowPlaytime(!showPlaytime) },
    { label: tr('shareModal.showMetacritic'), value: showMetacritic, toggle: () => setShowMetacritic(!showMetacritic) },
    { label: tr('shareModal.showRawg'), value: showRawg, toggle: () => setShowRawg(!showRawg) },
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Fullscreen container */}
      <div className="fixed inset-0 z-[101] flex items-start lg:items-center justify-center overflow-y-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-6 pointer-events-none">

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl bg-slate-900/60 border border-white/10 rounded-2xl sm:rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto my-auto">

          {/* Settings Panel */}
          <div className="w-full lg:w-72 xl:w-80 p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/70 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Layout size={18} className="text-violet-500" />
                {tr('shareModal.settings')}
              </h2>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="mb-5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                <Palette size={12} />
                {tr('shareModal.cardTheme')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(THEMES) as CardTheme[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      theme === key
                        ? 'bg-violet-500/20 border-violet-500/50 text-white'
                        : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {tr(`shareModal.theme${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility toggles */}
            <div className="space-y-1.5 mb-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{tr('shareModal.visibility')}</label>
              {toggleItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.toggle}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                    item.value
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'bg-slate-950/50 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold tracking-tight">{item.label}</span>
                  {item.value ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              ))}
            </div>

            {/* Download Button */}
            <div>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50 text-sm"
              >
                {isGenerating ? (
                  <span className="animate-pulse">{tr('shareModal.generating')}</span>
                ) : (
                  <>
                    <Download size={18} strokeWidth={3} />
                    {tr('shareModal.exportPng')}
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-3">
                HD PNG • 3x {tr('shareModal.exportHint').split('•')[1]?.trim() || 'разрешение'}
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-slate-950/80 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[70vh] lg:max-h-[85vh] flex flex-col items-center">
            <div className="hidden lg:flex w-full justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2.5 bg-slate-900 border border-white/5 hover:border-white/10 rounded-full transition-all group"
              >
                <X size={18} className="text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* ─── THE EXPORT CARD ─── */}
            <div
              ref={cardRef}
              style={{
                width: '420px',
                backgroundColor: t.bg,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  border: `1px solid ${t.border}`,
                }}
              >
                {/* Background blur from cover - inline styles for html-to-image */}
                {showCover && game.cover_url && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={game.cover_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.15,
                        filter: 'blur(40px)',
                        transform: 'scale(1.3)',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to bottom, transparent 0%, ${t.bg}cc 50%, ${t.bg} 100%)`,
                    }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, padding: '28px' }}>

                  {/* Title + Meta */}
                  <div style={{ marginBottom: '20px' }}>
                    <h1 style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: t.text,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      margin: 0,
                    }}>
                      {game.title}
                    </h1>

                    {showGenres && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {game.release_date && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            background: t.surface,
                            border: `1px solid ${t.border}`,
                            borderRadius: '8px',
                            color: t.muted,
                          }}>
                            {new Date(game.release_date).getFullYear()}
                          </span>
                        )}
                        {game.genres && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: t.accent,
                          }}>
                            {game.genres.split(',').map(g => g.trim()).slice(0, 3).join(' • ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cover Image */}
                  {showCover && game.cover_url && (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '220px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${t.border}`,
                      marginBottom: '20px',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={game.cover_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      {/* Score Badge on Cover */}
                      {showPersonalScore && normalizedScore && scoreStyle && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: `${t.bg}ee`,
                          border: `2px solid ${scoreStyle.border}`,
                          borderRadius: '16px',
                        }}>
                          <span style={{ fontSize: '8px', fontWeight: 900, color: scoreStyle.text, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>
                            {scoreStyle.label}
                          </span>
                          <span style={{ fontSize: '24px', fontWeight: 900, color: scoreStyle.text, lineHeight: 1 }}>
                            {normalizedScore}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: t.muted }}>/10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score without cover */}
                  {(!showCover || !game.cover_url) && showPersonalScore && normalizedScore && scoreStyle && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      background: scoreStyle.bg,
                      border: `1px solid ${scoreStyle.border}`,
                      borderRadius: '16px',
                      marginBottom: '20px',
                    }}>
                      <div>
                        <span style={{ fontSize: '36px', fontWeight: 900, color: scoreStyle.text, lineHeight: 1 }}>{normalizedScore}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: t.muted, marginLeft: '2px' }}>/10</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 900, color: scoreStyle.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{scoreStyle.label}</div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: t.muted }}>{totalScore} из {maxScore} баллов</div>
                      </div>
                    </div>
                  )}

                  {/* Status + Playtime Row */}
                  {(showStatus || (showPlaytime && gameDetails?.playtime)) && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {showStatus && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          borderRadius: '10px',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: game.status === 'Completed' ? '#34d399' : game.status === 'Playing' ? '#a78bfa' : game.status === 'Abandoned' ? '#fb7185' : '#94a3b8' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: t.text }}>{STATUS_LABELS_SHARE[game.status] || game.status}</span>
                        </div>
                      )}
                      {showPlaytime && gameDetails?.playtime && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          borderRadius: '10px',
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: t.muted }}>⏱ {gameDetails.playtime}ч</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating Breakdown Bars */}
                  {showPersonalScore && game.detailed_ratings && ratingCategories.length > 0 && (
                    <div style={{
                      padding: '16px',
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      borderRadius: '16px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                        {tr('shareModal.detailedRating')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {ratingCategories.map((cat) => {
                          const value = (game.detailed_ratings as Record<string, number>)[cat.key] ?? 0;
                          const pct = (value / cat.max) * 100;
                          return (
                            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: t.muted, width: '72px', textAlign: 'right', flexShrink: 0 }}>{cat.label}</span>
                              <div style={{ flex: 1, height: '6px', background: `${t.border}`, borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: scoreStyle?.text || t.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: t.text, width: '32px', flexShrink: 0 }}>{value}/{cat.max}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Review Section */}
                  {showReview && (game.review_title || game.notes || (game.pros && game.pros.length > 0) || (game.cons && game.cons.length > 0)) && (
                    <div style={{ marginBottom: '16px' }}>

                      {game.review_title && (
                        <div style={{
                          padding: '10px 14px',
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          borderRadius: '12px',
                          marginBottom: '10px',
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: t.text }}>{game.review_title}</span>
                        </div>
                      )}

                      {/* Pros & Cons */}
                      {((game.pros && game.pros.length > 0) || (game.cons && game.cons.length > 0)) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: game.notes ? '10px' : '0' }}>
                          {game.pros && game.pros.length > 0 && (
                            <div style={{
                              padding: '12px',
                              background: 'rgba(16,185,129,0.08)',
                              border: '1px solid rgba(16,185,129,0.2)',
                              borderRadius: '12px',
                            }}>
                              <div style={{ fontSize: '9px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                                {tr('shareModal.prosTitle')}
                              </div>
                              {game.pros.slice(0, 3).map((p, i) => (
                                <div key={i} style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: 'rgba(167,243,208,0.8)',
                                  padding: '3px 0',
                                  borderBottom: i < Math.min(game.pros!.length, 3) - 1 ? '1px solid rgba(16,185,129,0.1)' : 'none',
                                }}>
                                  {p}
                                </div>
                              ))}
                            </div>
                          )}
                          {game.cons && game.cons.length > 0 && (
                            <div style={{
                              padding: '12px',
                              background: 'rgba(244,63,94,0.08)',
                              border: '1px solid rgba(244,63,94,0.2)',
                              borderRadius: '12px',
                            }}>
                              <div style={{ fontSize: '9px', fontWeight: 900, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                                {tr('shareModal.consTitle')}
                              </div>
                              {game.cons.slice(0, 3).map((c, i) => (
                                <div key={i} style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: 'rgba(254,202,202,0.8)',
                                  padding: '3px 0',
                                  borderBottom: i < Math.min(game.cons!.length, 3) - 1 ? '1px solid rgba(244,63,94,0.1)' : 'none',
                                }}>
                                  {c}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {game.notes && (
                        <div style={{
                          padding: '14px',
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          borderRadius: '12px',
                          position: 'relative',
                        }}>
                          <div style={{ fontSize: '9px', fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
                            {tr('shareModal.opinion')}
                          </div>
                          <p style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: t.text,
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {game.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: `1px solid ${t.border}`,
                    marginTop: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '8px', fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {tr('shareModal.rateGamesOn')} <span style={{ color: t.accent }}>Vibe Diary</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {showMetacritic && gameDetails?.metacritic && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '8px', fontWeight: 800, color: t.muted, marginBottom: '3px' }}>MC</span>
                          <div style={{
                            padding: '3px 8px',
                            background: t.surface,
                            border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#34d399',
                            textAlign: 'center',
                            minWidth: '28px',
                          }}>
                            {gameDetails.metacritic}
                          </div>
                        </div>
                      )}
                      {showRawg && gameDetails?.rating && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '8px', fontWeight: 800, color: t.muted, marginBottom: '3px' }}>RAWG</span>
                          <div style={{
                            padding: '3px 8px',
                            background: t.surface,
                            border: `1px solid rgba(139,92,246,0.3)`,
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 900,
                            color: t.accent,
                            textAlign: 'center',
                            minWidth: '28px',
                          }}>
                            {gameDetails.rating.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
