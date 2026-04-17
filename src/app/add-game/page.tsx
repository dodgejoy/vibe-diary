'use client';

import { useState } from 'react';
import { SearchBar, SearchResults } from '@/components';
import { searchGames, RawgGame } from '@/lib/rawg';
import { addGame } from '@/lib/supabase';
import { useAuth } from '@/components';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

export default function AddGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchGames(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = async (game: RawgGame) => {
    try {
      const coverUrl = game.background_image || '/placeholder-game.jpg';
      const genres = game.genres?.map(g => g.name).join(', ') || '';

      const result = await addGame({
        title: game.name,
        cover_url: coverUrl,
        status: 'Not Started',
        notes: '',
        rawg_id: game.id,
        release_date: game.released,
        genres: genres,
      });

      if (result) {
        router.push(`/games/${result.id}`);
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert(t('addGame.addError'));
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-violet-500/30">
      {/* Background ambient glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all mb-8 shadow-lg backdrop-blur-xl group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">{t('addGame.backToVault')}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight leading-tight">
                {t('addGame.expandTitle')} <br />{t('addGame.expandTitle2')}
              </h1>
              <p className="mt-4 text-lg text-slate-400 font-medium max-w-lg">
                {t('addGame.subtitle')}
              </p>
            </div>
            <div className="hidden lg:block p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
              <PlusCircle size={48} className="text-violet-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
          <div className="relative">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-8">
          {!hasSearched ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-16 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
              <Search size={64} className="mx-auto text-slate-800 group-hover:text-violet-500/20 transition-colors duration-700 mb-6" />
              <h3 className="text-xl font-bold text-slate-400 tracking-widest uppercase mb-2">{t('addGame.readyToDiscover')}</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">
                {t('addGame.rawgInfo')}
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {t('addGame.foundGames')}
                </h2>
                <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 text-xs font-black uppercase tracking-widest group">
                  {searchResults.length} {t('addGame.results')}
                </span>
              </div>
              <SearchResults
                games={searchResults}
                isLoading={isLoading}
                onAddGame={handleAddGame}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
