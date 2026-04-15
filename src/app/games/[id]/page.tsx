'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGameById, updateGame, deleteGame, Game, DetailedRatings } from '@/lib/supabase';
import { 
  ReviewEditor, 
  StatusSelector, 
  DetailedRatingSelector,
  ScreenshotGallery, 
  GameInfoPanel, 
  SimilarGames,
  CommunityDiscussions,
  GameScratchpad,
  SteamDeckCompanion
} from '@/components';
import { 
  getGameDetails, 
  getGameScreenshots, 
  getSimilarGames, 
  getGameRedditPosts,
  GameDetails 
} from '@/lib/rawg';
import { ArrowLeft, Trash2, Loader } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [similarGames, setSimilarGames] = useState<any[]>([]);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    async function loadGame() {
      setIsLoading(true);
      try {
        const data = await fetchGameById(gameId);
        if (data) {
          setGame(data);
          
          // Load RAWG data if rawg_id exists
          if (data.rawg_id) {
            try {
              const [details, shots, similar, reddit] = await Promise.all([
                getGameDetails(data.rawg_id),
                getGameScreenshots(data.rawg_id),
                getSimilarGames(data.rawg_id),
                getGameRedditPosts(data.rawg_id),
              ]);
              
              setGameDetails(details || null);
              setScreenshots(shots || []);
              setSimilarGames(similar || []);
              setRedditPosts(reddit || []);
            } catch (rawgErr) {
              console.warn('Failed to load RAWG data:', rawgErr);
              // Don't fail the entire page if RAWG data fails
            }
          }
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError('Failed to load game');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [gameId]);

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
    if (!game || !confirm('Are you sure you want to delete this game from your diary?')) return;

    setIsDeleting(true);
    try {
      const success = await deleteGame(game.id);
      if (success) {
        router.push('/');
      } else {
        alert('Failed to delete game');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = handleDeleteAsync;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-violet-500" size={32} />
          <p className="text-slate-300">Loading game details...</p>
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
            Back to Library
          </Link>
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-2">{error || 'Game not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cinematic Background Banner */}
      {(game.cover_url || screenshots[0]?.image || gameDetails?.background_image) && (
        <div className="absolute top-0 left-0 w-full h-[70vh] z-0 pointer-events-none">
          <Image
            src={gameDetails?.background_image || screenshots[0]?.image || game.cover_url!}
            alt={game.title}
            fill
            className="object-cover object-top opacity-60"
            priority
          />
          {/* Subtle vignette and fade to background color */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-violet-400 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to Library
          </Link>

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
                <div className="flex flex-col gap-4 mb-6">
                  {game.logo_url && (
                    <div className="relative h-12 sm:h-16 lg:h-20 w-fit max-w-xs">
                      <Image 
                        src={game.logo_url} 
                        alt={`${game.title} logo`} 
                        fill 
                        className="object-contain object-left drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        priority
                      />
                    </div>
                  )}
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl tracking-tighter">
                    {game.title}
                  </h1>
                </div>
                {game.genres && (
                  <p className="text-lg sm:text-xl text-slate-300 font-medium drop-shadow-md">
                    {game.genres}
                  </p>
                )}
              </div>

              {/* Status Selector Card */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <StatusSelector
                  value={game.status}
                  onChange={handleStatusChange}
                />
              </div>

              {/* Rating Button */}
              {game.status === 'Completed' && (
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-between shadow-lg shadow-violet-900/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">⭐</span>
                    <div className="text-left">
                      <div className="text-lg">Детальная оценка игры</div>
                      <div className="text-sm font-normal text-violet-200 mt-0.5">
                        {game.detailed_ratings
                          ? 'Анализ по 7 критериям'
                          : 'Нажми чтобы оценить'}
                      </div>
                    </div>
                  </div>
                  {game.detailed_ratings && (
                    <div className="text-right flex flex-col items-end">
                      <div className="text-2xl font-black">
                        {((Object.values(game.detailed_ratings).reduce((a, b) => a + b, 0) / 90) * 10).toFixed(1)}
                        <span className="text-sm text-violet-300 ml-1">/ 10</span>
                      </div>
                    </div>
                  )}
                </button>
              )}

              {/* Steam Deck Companion */}
              <div className="mt-8">
                <SteamDeckCompanion 
                  status={game.steam_deck_status}
                  settings={game.steam_deck_settings}
                  onSave={handleSteamDeckChange}
                />
              </div>

              {/* Review Editor Card */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
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

              {/* Community Discussions */}
              {redditPosts.length > 0 && (
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                  <CommunityDiscussions posts={redditPosts} />
                </div>
              )}

              {/* Game Info Panel */}
              {gameDetails && (
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                  <GameInfoPanel details={gameDetails} />
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/40 hover:bg-red-600/50 border border-red-500/50 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove from Diary
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-sm text-slate-300 shadow-xl">
                <p>
                  Added to diary on{' '}
                  <span className="text-slate-200 font-medium">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </p>
                {game.updated_at !== game.created_at && (
                  <p className="mt-2">
                    Last updated on{' '}
                    <span className="text-slate-200 font-medium">
                      {new Date(game.updated_at).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Scratchpad & Screenshots */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                
                {/* Always show scratchpad */}
                <GameScratchpad gameId={game.id} />

                {screenshots.length > 0 && (
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
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
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <SimilarGames games={similarGames} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {game && (
        <DetailedRatingSelector
          value={game.detailed_ratings}
          onChange={handleDetailedRatingsChange}
          gameTitle={game.title}
          isOpen={isRatingModalOpen}
          onOpenChange={setIsRatingModalOpen}
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
