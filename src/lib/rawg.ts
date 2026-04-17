const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || '';

// Simple in-memory cache to avoid redundant API calls
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  if (entry) cache.delete(key);
  return undefined;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

async function rawgFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.set('key', RAWG_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`RAWG API error: ${res.status}`);
  return res.json();
}

export type RawgGame = {
  id: number;
  name: string;
  background_image?: string;
  released?: string;
  genres?: Array<{ name: string }>;
  rating?: number;
};

export type GameDetails = RawgGame & {
  description?: string;
  description_raw?: string;
  platforms?: Array<{ platform: { name: string } }>;
  developers?: Array<{ name: string }>;
  publishers?: Array<{ name: string }>;
  stores?: Array<{ store: { name: string } }>;
  screenshots?: Array<{ id: number; image: string }>;
  metacritic?: number;
  playtime?: number;
  achievements_count?: number;
  website?: string;
  rating_top?: number;
  ratings_count?: number;
  reviews_count?: number;
  parent_platforms?: Array<{ platform: { name: string } }>;
  logo?: string;
  image?: string;
  image_background?: string;
};

// Search for games on RAWG API
export async function searchGames(query: string): Promise<RawgGame[]> {
  try {
    if (!RAWG_API_KEY) {
      console.warn('RAWG API key is not configured. Using mock data.');
      return getMockGames(query);
    }

    const cacheKey = `search:${query}`;
    const cached = getCached<RawgGame[]>(cacheKey);
    if (cached) return cached;

    const data = await rawgFetch('/games', { search: query, page_size: 20 });

    const results = data.results || [];
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching games:', error);
    return getMockGames(query);
  }
}

// Get detailed information about a game
export async function getGameDetails(id: number): Promise<GameDetails | null> {
  try {
    if (!RAWG_API_KEY) {
      return null;
    }

    const cacheKey = `details:${id}`;
    const cached = getCached<GameDetails>(cacheKey);
    if (cached) return cached;

    const data = await rawgFetch(`/games/${id}`);

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
}

// Get game screenshots
export async function getGameScreenshots(id: number): Promise<GameDetails['screenshots']> {
  try {
    if (!RAWG_API_KEY) {
      return [];
    }

    const cacheKey = `screenshots:${id}`;
    const cached = getCached<GameDetails['screenshots']>(cacheKey);
    if (cached) return cached;

    const data = await rawgFetch(`/games/${id}/screenshots`, { page_size: 12 });

    const results = data.results || [];
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return [];
  }
}

// Get game Reddit posts (for community tips and reviews)
// Note: RAWG has deprecated this endpoint; returns empty gracefully.
export async function getGameRedditPosts(id: number): Promise<any[]> {
  try {
    if (!RAWG_API_KEY) {
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const data = await rawgFetch(`/games/${id}/reddit`, { page_size: 10 });
      return data.results || [];
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return [];
  }
}

// Get similar games
export async function getSimilarGames(id: number): Promise<RawgGame[]> {
  try {
    if (!RAWG_API_KEY) {
      return [];
    }

    const cacheKey = `similar:${id}`;
    const cached = getCached<RawgGame[]>(cacheKey);
    if (cached) return cached;

    const data = await rawgFetch('/games', { page_size: 8, ordering: '-rating' });

    const results = data.results?.slice(0, 6) || [];
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching similar games:', error);
    return [];
  }
}

// Mock games for development (when API key is not configured)
function getMockGames(query: string): RawgGame[] {
  const mockGames: RawgGame[] = [
    {
      id: 1,
      name: 'The Witcher 3: Wild Hunt',
      background_image: 'https://media.rawg.io/media/games/511/5118aff5091cb3efeccfbea552f1fbc9.jpg',
      released: '2015-05-19',
      genres: [{ name: 'RPG' }, { name: 'Adventure' }],
      rating: 4.6,
    },
    {
      id: 3,
      name: 'Elden Ring',
      background_image: 'https://media.rawg.io/media/games/34b/34b1f1850a1cb2606ba1f7f0179d52fc.jpg',
      released: '2022-02-25',
      genres: [{ name: 'RPG' }, { name: 'Action' }],
      rating: 4.5,
    },
    {
      id: 5,
      name: 'Baldur\'s Gate 3',
      background_image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7088b9302.jpg',
      released: '2023-08-03',
      genres: [{ name: 'RPG' }],
      rating: 4.7,
    },
  ];

  // Filter by query if provided
  if (query.toLowerCase().trim() === '') {
    return mockGames;
  }

  return mockGames.filter(game =>
    game.name.toLowerCase().includes(query.toLowerCase())
  );
}
