'use client';

import { useEffect, useState } from 'react';
import { GameGrid } from '@/components';
import { fetchGames, Game } from '@/lib/supabase';
import { Loader, Plus, Gamepad2, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      setIsLoading(true);
      try {
        const data = await fetchGames();
        setGames(data);
      } catch (err) {
        setError('Failed to load games. Please check your Supabase configuration.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  const featuredGame = games.length > 0 ? games[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-violet-500/30">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[500px] flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/50">
        {/* Dynamic Background */}
        {featuredGame?.cover_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 transform scale-105 motion-safe:animate-[pulse_10s_ease-in-out_infinite_alternate]"
              style={{ backgroundImage: `url(${featuredGame.cover_url})` }}
            />
            {/* Gradient overlays to blend into the background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/30 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
          </>
        ) : (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto w-full z-10">
          <div className="text-center md:text-left mb-12 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-white drop-shadow-md">Your Gaming</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-pulse drop-shadow-sm">
                Journey Matters
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl font-light">
              Don't let your epic moments fade away. Track your progress, write immersive reviews, and build your ultimate personal game library.
            </p>
          </div>

          {/* Premium Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-violet-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                  <Gamepad2 size={28} />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white group-hover:text-violet-100 transition-colors">{games.length}</div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Games Tracked</div>
                </div>
              </div>
            </div>

            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                    {games.filter(g => g.status === 'Completed').length}
                  </div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Completed</div>
                </div>
              </div>
            </div>

            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
                  <Clock size={28} />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white group-hover:text-sky-100 transition-colors">
                    {games.filter(g => g.status === 'Playing').length}
                  </div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Currently Playing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-inner">🎮</span>
              Your Game Library
            </h2>
            
            {/* Quick Add Button next to title for easy access */}
            {!isLoading && !error && games.length > 0 && (
              <Link
                href="/add-game"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={18} className="text-violet-400" />
                <span>Add Game</span>
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-800 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-400 font-medium tracking-wide animate-pulse">Syncing library...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-950/30 border border-red-500/20 text-red-200 p-8 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto text-center">
              <div className="inline-block p-4 bg-red-900/30 rounded-full mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connection Error</h3>
              <p className="text-red-300/80 mb-6">{error}</p>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 inline-block text-left">
                <p className="text-sm text-slate-300">
                  Ensure your Supabase keys are correctly set in <code className="bg-slate-800 px-2 py-1 rounded text-violet-300 border border-slate-700">.env.local</code>:
                </p>
                <ul className="text-sm mt-3 space-y-1 text-slate-400 font-mono">
                  <li>NEXT_PUBLIC_SUPABASE_URL=...</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</li>
                </ul>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-b from-slate-900/50 to-slate-900/20 rounded-3xl border border-slate-800/50 backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-slate-900 shadow-xl">
                  <Gamepad2 size={40} className="text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Your library is empty</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                  Every great journey starts with a single game. Add your first title and begin documenting your adventures.
                </p>
                <Link
                  href="/add-game"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:-translate-y-1"
                >
                  <Plus size={22} />
                  Add Your First Game
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <GameGrid games={games} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
