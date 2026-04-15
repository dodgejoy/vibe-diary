'use client';

import { useState } from 'react';
import { SearchBar, SearchResults } from '@/components';
import { searchGames, RawgGame, getGameDetails } from '@/lib/rawg';
import { addGame, checkAchievements } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddGamePage() {
  const router = useRouter();
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

      // Fetch detailed game info to get logo
      let logoUrl: string | undefined;
      try {
        const gameDetails = await getGameDetails(game.id);
        // Try multiple possible logo fields from RAWG API
        if (gameDetails?.logo) {
          logoUrl = gameDetails.logo;
        } else if (gameDetails?.image_background) {
          logoUrl = gameDetails.image_background;
        } else {
          logoUrl = game.background_image;
        }
        console.log('Game details:', { id: game.id, logo: gameDetails?.logo, image_background: gameDetails?.image_background });
      } catch (error) {
        console.warn('Failed to fetch game logo:', error);
        logoUrl = game.background_image;
      }

      const result = await addGame({
        title: game.name,
        cover_url: coverUrl,
        logo_url: logoUrl,
        status: 'Not Started',
        notes: '',
        rawg_id: game.id,
        release_date: game.released,
        genres: genres,
      });

      if (result) {
        // Check and unlock achievements
        try {
          const unlockedIds = await checkAchievements('test_user');
          if (unlockedIds.length > 0) {
            console.log('Achievements unlocked:', unlockedIds);
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        }

        // Show success message and redirect
        router.push(`/games/${result.id}`);
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to Library
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Add a Game
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Search for a game and add it to your diary
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Info Section */}
        {!hasSearched && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-300 text-lg">
              Search for a game above to get started
            </p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Search Results
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {searchResults.length} game{searchResults.length !== 1 ? 's' : ''} found
              </p>
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
  );
}
