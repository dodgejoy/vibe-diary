'use client';

import { useState, useRef, useCallback } from 'react';
import { Game } from '@/lib/supabase';
import { GameDetails } from '@/lib/rawg';
import { X, Download, Share2, Star, Quote, Eye, EyeOff, Layout, Check, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { toPng } from 'html-to-image';
import Image from 'next/image';

interface GameShareModalProps {
  game: Game;
  gameDetails: GameDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameShareModal({ game, gameDetails, isOpen, onClose }: GameShareModalProps) {
  const [showPersonalScore, setShowPersonalScore] = useState(true);
  const [showMetacritic, setShowMetacritic] = useState(true);
  const [showRawg, setShowRawg] = useState(true);
  const [showReview, setShowReview] = useState(true);
  const [showGenres, setShowGenres] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      const link = document.createElement('a');
      link.download = `${game.title.replace(/\s+/g, '-').toLowerCase()}-share.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  }, [game.title]);

  if (!isOpen) return null;

  const totalScore = game.detailed_ratings
    ? Object.values(game.detailed_ratings).reduce((a, b) => a + b, 0)
    : null;
  const normalizedScore = totalScore !== null ? ((totalScore / 90) * 10).toFixed(1) : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', gradient: 'from-yellow-400 to-amber-500' };
    if (score >= 70) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', gradient: 'from-emerald-400 to-teal-500' };
    if (score >= 60) return { text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/20', gradient: 'from-blue-400 to-indigo-500' };
    if (score >= 50) return { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/20', gradient: 'from-orange-400 to-red-500' };
    return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/20', gradient: 'from-rose-400 to-pink-500' };
  };

  const scoreStyle = totalScore !== null ? getScoreColor(totalScore) : null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Fullscreen container for centering */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 lg:p-8 pointer-events-none">

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">

          {/* Settings Panel (Left/Top) */}
          <div className="w-full lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Layout size={20} className="text-violet-500" />
                Customize
              </h2>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</label>

                <button
                  onClick={() => setShowPersonalScore(!showPersonalScore)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showPersonalScore ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-sm font-bold tracking-tight">Personal Rating</span>
                  {showPersonalScore ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={() => setShowMetacritic(!showMetacritic)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showMetacritic ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-sm font-bold tracking-tight">Metacritic Score</span>
                  {showMetacritic ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={() => setShowRawg(!showRawg)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showRawg ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-sm font-bold tracking-tight">RAWG Rating</span>
                  {showRawg ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={() => setShowReview(!showReview)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showReview ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-sm font-bold tracking-tight">My Review</span>
                  {showReview ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={() => setShowGenres(!showGenres)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showGenres ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-sm font-bold tracking-tight">Genres & Date</span>
                  {showGenres ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-950 hover:bg-slate-100 font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Capturing...</span>
                ) : (
                  <>
                    <Download size={20} strokeWidth={3} />
                    Export Image
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-4">
                HD PNG • 1080x1350 optimized
              </p>
            </div>
          </div>

          {/* Preview Panel (Right/Bottom) */}
          <div className="flex-1 bg-slate-950 p-8 sm:p-12 overflow-y-auto max-h-[80vh] lg:max-h-none flex flex-col items-center justify-start">
            <div className="hidden lg:flex w-full justify-end mb-8">
              <button
                onClick={onClose}
                className="p-3 bg-slate-900 border border-white/5 hover:border-white/10 rounded-full transition-all group pointer-events-auto"
              >
                <X size={20} className="text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Wrapper for transparency and padding around rounded corners */}
            <div ref={cardRef} className="p-4 bg-transparent">
              <div
                className="w-full max-w-[450px] bg-slate-950 rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl transition-all"
                style={{ minHeight: '780px' }}
              >
                {/* Background Image / Blur */}
                <div className="absolute inset-0 z-0">
                  {game.cover_url && (
                    <Image
                      src={game.cover_url}
                      alt=""
                      fill
                      className="object-cover opacity-30 blur-2xl scale-125"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 h-full p-8 flex flex-col">
                  {/* Top Section with Logo/Title */}
                  <div className="flex flex-col gap-4 mb-6">
                    {game.logo_url && (
                      <div className="relative h-12 w-full max-w-[150px]">
                        <Image
                          src={game.logo_url}
                          alt=""
                          fill
                          className="object-contain object-left opacity-80"
                          priority
                        />
                      </div>
                    )}
                    <h1 className="text-3xl font-black text-white tracking-tighter leading-none">{game.title}</h1>

                    {showGenres && (
                      <div className="flex items-center gap-2">
                        {game.release_date && (
                          <span className="text-[10px] font-black px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-slate-400">
                            {new Date(game.release_date).getFullYear()}
                          </span>
                        )}
                        {game.genres && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 truncate">
                            {game.genres.split(',').map(g => g.trim()).slice(0, 2).join(' • ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Illustration / Boxart */}
                  <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-6" style={{ height: '260px' }}>
                    {game.cover_url && (
                      <Image
                        src={game.cover_url}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                      />
                    )}

                    {/* Score Badge Overlay */}
                    {showPersonalScore && normalizedScore && scoreStyle && (
                      <div className={`absolute top-4 right-4 flex items-center gap-2 p-3 bg-slate-950/90 backdrop-blur-xl border-2 ${scoreStyle.border} rounded-[1.5rem] shadow-2xl`}>
                        <div className="flex flex-col items-center px-2">
                          <span className={`text-[8px] font-black ${scoreStyle.text} uppercase tracking-tighter opacity-70`}>My Score</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${scoreStyle.gradient} leading-none`}>
                              {normalizedScore}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">/10</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Snippet - Redesigned to match Editor UI */}
                  {showReview && (game.review_title || game.notes || (game.pros && game.pros.length > 0) || (game.cons && game.cons.length > 0)) && (
                    <div className="space-y-4 mb-8">
                      {game.review_title && (
                        <div className="px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl">
                          <h3 className="text-sm font-black text-white line-clamp-1">{game.review_title}</h3>
                        </div>
                      )}

                      {/* Pros & Cons Blocks */}
                      {((game.pros && game.pros.length > 0) || (game.cons && game.cons.length > 0)) && (
                        <div className="grid grid-cols-2 gap-3">
                          {game.pros && game.pros.length > 0 && (
                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2 shadow-lg">
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <ThumbsUp size={12} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Плюсы</span>
                              </div>
                              <ul className="space-y-1.5">
                                {game.pros.slice(0, 3).map((p, i) => (
                                  <li key={i} className="text-[10px] text-emerald-100/70 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg line-clamp-1">
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {game.cons && game.cons.length > 0 && (
                            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 flex flex-col gap-2 shadow-lg">
                              <div className="flex items-center gap-1.5 text-rose-400">
                                <ThumbsDown size={12} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Минусы</span>
                              </div>
                              <ul className="space-y-1.5">
                                {game.cons.slice(0, 3).map((c, i) => (
                                  <li key={i} className="text-[10px] text-rose-100/70 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg line-clamp-1">
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {game.notes && (
                        <div className="bg-violet-950/10 border border-white/5 rounded-2xl p-4 relative group">
                          <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <MessageSquare size={12} />
                            <span className="text-[8px] font-extrabold uppercase tracking-[0.2em]">Мнение</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                            {game.notes}
                          </p>
                          <Quote size={32} className="absolute bottom-2 right-2 text-white/5 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer / Branding */}
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-end justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-white/50">
                        <Share2 size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                          Оценивай игры на <span className="text-violet-400">Vibe Diary</span> • vibediary.com
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {showMetacritic && gameDetails?.metacritic && (
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-1 font-mono">CRITIC</span>
                          <div className="px-3 py-1 bg-slate-900 border border-emerald-500/30 rounded-lg text-emerald-400 font-black text-xs shadow-xl min-w-[32px] text-center">
                            {gameDetails.metacritic}
                          </div>
                        </div>
                      )}
                      {showRawg && gameDetails?.rating && (
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-1 font-mono">RAWG</span>
                          <div className="px-3 py-1 bg-slate-900 border border-violet-500/30 rounded-lg text-violet-400 font-black text-xs shadow-xl min-w-[32px] text-center">
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
