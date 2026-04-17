'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchGameById, updateGame, deleteGame, addGame, Game, DetailedRatings, getNormalizedScore } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { StatusSelector } from '@/components';
import { 
  getGameDetails, 
  getGameScreenshots, 
  getSimilarGames, 
  GameDetails 
} from '@/lib/rawg';
import { ArrowLeft, Trash2, Loader, Share2, Plus } from 'lucide-react';

// Dynamic imports for heavy components (code-split)
const ReviewEditor = dynamic(() => import('@/components/ReviewEditor').then(m => ({ default: m.ReviewEditor })));
const DetailedRatingSelector = dynamic(() => import('@/components/DetailedRatingSelector').then(m => ({ default: m.DetailedRatingSelector })));
const ScreenshotGallery = dynamic(() => import('@/components/ScreenshotGallery').then(m => ({ default: m.ScreenshotGallery })));
const GameInfoPanel = dynamic(() => import('@/components/GameInfoPanel').then(m => ({ default: m.GameInfoPanel })));
const SimilarGames = dynamic(() => import('@/components/SimilarGames').then(m => ({ default: m.SimilarGames })));
const CommunityDiscussions = dynamic(() => import('@/components/CommunityDiscussions').then(m => ({ default: m.CommunityDiscussions })));
const GameScratchpad = dynamic(() => import('@/components/GameScratchpad').then(m => ({ default: m.GameScratchpad })));
const SteamDeckCompanion = dynamic(() => import('@/components/SteamDeckCompanion').then(m => ({ default: m.SteamDeckCompanion })));
const GameShareModal = dynamic(() => import('@/components/GameShareModal').then(m => ({ default: m.GameShareModal })));

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gameId = params.id as string;
  const isRawgId = /^\d+$/.test(gameId);

  const [game, setGame] = useState<Game | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [similarGames, setSimilarGames] = useState<any[]>([]);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Read-only mode: viewing by RAWG ID without owning the game
  const isReadOnly = isRawgId && !game?.id;

  useEffect(() => {
    async function loadGame() {
      setIsLoading(true);
      try {
        if (isRawgId) {
          // Numeric ID → load from RAWG API directly
          const rawgId = parseInt(gameId, 10);
          const [details, shots, similar] = await Promise.all([
            getGameDetails(rawgId),
            getGameScreenshots(rawgId),
            getSimilarGames(rawgId),
          ]);

          if (details) {
            setGameDetails(details);
            setScreenshots(shots || []);
            setSimilarGames(similar || []);
            // Build a minimal Game object from RAWG data for display
            setGame({
              id: '',
              title: details.name,
              cover_url: details.background_image,
              status: 'Not Started',
              genres: details.genres?.map(g => g.name).join(', '),
              release_date: details.released,
              rawg_id: rawgId,
              created_at: '',
              updated_at: '',
            });
          } else {
            setError('Игра не найдена');
          }
        } else {
          // UUID → load from user's library
          const data = await fetchGameById(gameId);
          if (data) {
            setGame(data);

            if (data.rawg_id) {
              try {
                const [details, shots, similar] = await Promise.all([
                  getGameDetails(data.rawg_id),
                  getGameScreenshots(data.rawg_id),
                  getSimilarGames(data.rawg_id),
                ]);

                setGameDetails(details || null);
                setScreenshots(shots || []);
                setSimilarGames(similar || []);
              } catch (rawgErr) {
                console.warn('Failed to load RAWG data:', rawgErr);
              }
            }
          } else {
            setError('Игра не найдена');
          }
        }
      } catch (err) {
        setError('Не удалось загрузить игру');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [gameId, isRawgId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!game) return;
    const updated = await updateGame(game.id, { status: newStatus as 'Not Started' | 'Playing' | 'Completed' | 'Abandoned' });
    if (updated) {
      setGame(updated);
    }
  };

  const handleReviewChange = async (data: { review_title: string; pros: string[]; cons: string[]; notes: string }) => {
    if (!game) return;
    const updated = await updateGame(game.id, data);
    if (updated) {
      setGame({ ...game, ...data });
    }
  };

  const handleSteamDeckChange = async (data: { steam_deck_status: 'verified'|'playable'|'unsupported'|'unknown'; steam_deck_settings: string }) => {
    if (!game) return;
    const updated = await updateGame(game.id, data);
    if (updated) {
      setGame({ ...game, ...data });
    }
  };

  const handleDetailedRatingsChange = async (ratings: DetailedRatings) => {
    if (!game) return;
    const updated = await updateGame(game.id, { detailed_ratings: ratings });
    if (updated) {
      setGame(updated);
    }
  };

  const handleDeleteAsync = async () => {
    if (!game || !confirm('Вы уверены, что хотите удалить эту игру из дневника?')) return;

    setIsDeleting(true);
    try {
      const success = await deleteGame(game.id);
      if (success) {
        router.push('/');
      } else {
        alert('Не удалось удалить игру');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = handleDeleteAsync;

  const handleAddToLibrary = async () => {
    if (!game || !gameDetails) return;
    setIsAdding(true);
    try {
      const added = await addGame({
        title: game.title,
        cover_url: game.cover_url,
        status: 'Not Started',
        genres: game.genres,
        release_date: game.release_date,
        rawg_id: game.rawg_id,
      });
      if (added) {
        router.push(`/games/${added.id}`);
      }
    } catch (err) {
      console.error('Failed to add game:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-violet-500" size={32} />
          <p className="text-slate-300">Загрузка данных об игре...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Назад в библиотеку
          </Link>
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg">
            <p className="font-medium">Ошибка</p>
            <p className="text-sm mt-2">{error || 'Игра не найдена'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-violet-500/30">
      {/* Background ambient glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/15 blur-[80px] rounded-full pointer-events-none" />

      {/* Cinematic Background Banner */}
      {(game.cover_url || screenshots[0]?.image || gameDetails?.background_image) && (
        <>
        <div className="absolute top-0 left-0 w-full h-[80vh] z-0 pointer-events-none overflow-hidden">
          <Image
            src={gameDetails?.background_image || screenshots[0]?.image || game.cover_url!}
            alt={game.title}
            fill
            className="object-cover object-top opacity-15 mix-blend-screen scale-105"
            priority
          />
          {/* Smooth fade to page background — multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/90" />
        </div>
        {/* Extra bleed layer to eliminate hard edge at banner bottom */}
        <div className="absolute top-[65vh] left-0 w-full h-[20vh] z-0 pointer-events-none bg-gradient-to-b from-transparent to-slate-950" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-10">
            <Link
              href={isRawgId ? '/popular' : '/'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-xl group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{isRawgId ? 'Назад' : 'Назад в библиотеку'}</span>
            </Link>

            <div className="flex items-center gap-3">
              {isReadOnly && user && (
                <button
                  onClick={handleAddToLibrary}
                  disabled={isAdding}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/20 rounded-xl text-white font-bold transition-all shadow-lg shadow-emerald-900/40 group active:scale-95 disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  )}
                  <span>{isAdding ? 'Добавление...' : 'В мою библиотеку'}</span>
                </button>
              )}

              {isReadOnly && !user && (
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 border border-violet-400/20 rounded-xl text-white font-bold transition-all shadow-lg shadow-violet-900/40 group active:scale-95"
                >
                  <Plus size={18} />
                  <span>Войти и добавить</span>
                </Link>
              )}

              {!isReadOnly && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 border border-violet-400/20 rounded-xl text-white font-bold transition-all shadow-lg shadow-violet-900/40 group active:scale-95"
                >
                  <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
                  <span>Поделиться</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - About 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {game.release_date && (
                    <span className="px-3 py-1 bg-slate-700/60 rounded-full text-sm text-slate-300 border border-slate-600/50">
                      {new Date(game.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-2xl tracking-tight leading-tight">
                    {game.title}
                  </h1>
                </div>
                {game.genres && (
                  <p className="inline-flex px-4 py-1.5 bg-violet-900/30 border border-violet-500/20 text-violet-300 font-bold uppercase tracking-widest text-sm rounded-lg backdrop-blur-md">
                    {game.genres}
                  </p>
                )}
              </div>

              {/* Status Selector Card */}
              {!isReadOnly && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                  <StatusSelector
                    value={game.status}
                    onChange={handleStatusChange}
                  />
                </div>
              )}

              {/* Rating Button */}
              {!isReadOnly && game.status === 'Completed' && (
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="w-full relative overflow-hidden group bg-slate-900/80 border border-white/10 hover:border-violet-500/50 text-white font-semibold py-5 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-between shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5" />
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="p-3 bg-violet-500/20 rounded-xl group-hover:scale-110 group-hover:bg-violet-500/30 transition-all text-2xl border border-violet-500/20">
                      <span className="drop-shadow-md">⭐</span>
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold tracking-tight">Детальная оценка игры</div>
                      <div className="text-sm font-medium text-slate-400 mt-1">
                        {game.detailed_ratings
                          ? `Изменить оценку по ${Object.keys(game.detailed_ratings).length} критериям`
                          : 'Оценить по уникальным критериям'}
                      </div>
                    </div>
                  </div>
                  {game.detailed_ratings && (
                    <div className="relative z-10 text-right flex flex-col items-end">
                      <div className="text-3xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
                        {getNormalizedScore(game.detailed_ratings).toFixed(1)}
                        <span className="text-sm text-slate-500 ml-1">/ 10</span>
                      </div>
                    </div>
                  )}
                </button>
              )}

              {/* Steam Deck Companion */}
              {!isReadOnly && (
              <div className="mt-8">
                <SteamDeckCompanion 
                  status={game.steam_deck_status}
                  settings={game.steam_deck_settings}
                  onSave={handleSteamDeckChange}
                />
              </div>
              )}

              {/* Review Editor Card */}
              {!isReadOnly && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
                  Моя Рецензия / Заметки
                </h3>
                <ReviewEditor
                  initialTitle={game.review_title}
                  initialPros={game.pros}
                  initialCons={game.cons}
                  initialNotes={game.notes}
                  onSave={handleReviewChange}
                />
              </div>
              )}

              {/* Community Discussions */}
              {redditPosts.length > 0 && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                  <CommunityDiscussions posts={redditPosts} />
                </div>
              )}

              {/* Game Info Panel */}
              {gameDetails && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                  <GameInfoPanel details={gameDetails} />
                </div>
              )}

              {/* Delete Button */}
              {!isReadOnly && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/40 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Удалить из дневника
                  </>
                )}
              </button>
              )}

              {/* Additional Info */}
              {!isReadOnly && (
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-sm text-slate-300 shadow-xl">
                <p>
                  Добавлена в дневник{' '}
                  <span className="text-slate-200 font-medium">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </p>
                {game.updated_at !== game.created_at && (
                  <p className="mt-2">
                    Последнее обновление{' '}
                    <span className="text-slate-200 font-medium">
                      {new Date(game.updated_at).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
              )}
            </div>

            {/* Right Column - Scratchpad & Screenshots */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                
                {/* Always show scratchpad */}
                {!isReadOnly && <GameScratchpad gameId={game.id} />}

                {screenshots.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Скриншоты</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {screenshots.slice(0, 8).map((screenshot, idx) => (
                      <div
                        key={screenshot.id}
                        className="relative h-32 rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => setSelectedScreenshot(screenshot.image)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedScreenshot(screenshot.image)}
                      >
                        <Image
                          src={screenshot.image}
                          alt={`Screenshot ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 300px"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-2xl drop-shadow-lg">🔍</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Games Section */}
          {similarGames.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-700/50">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <SimilarGames games={similarGames} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {!isReadOnly && game && (
        <DetailedRatingSelector
          value={game.detailed_ratings}
          onChange={handleDetailedRatingsChange}
          gameTitle={game.title}
          genres={game.genres}
          isOpen={isRatingModalOpen}
          onOpenChange={setIsRatingModalOpen}
        />
      )}

      {/* Share Modal */}
      {!isReadOnly && game && (
        <GameShareModal
          game={game}
          gameDetails={gameDetails}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition text-2xl z-10"
              aria-label="Close"
            >
              ✕
            </button>
            <Image
              src={selectedScreenshot}
              alt="Screenshot"
              width={1920}
              height={1080}
              className="w-full h-auto rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
