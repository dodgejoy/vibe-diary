import axios from 'axios';

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || '';

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

    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        search: query,
        page_size: 20,
      },
    });

    return response.data.results || [];
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

    const response = await axios.get(`${RAWG_BASE_URL}/games/${id}`, {
      params: {
        key: RAWG_API_KEY,
      },
    });

    return response.data;
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

    const response = await axios.get(`${RAWG_BASE_URL}/games/${id}/screenshots`, {
      params: {
        key: RAWG_API_KEY,
        page_size: 12,
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return [];
  }
}

// Get game Reddit posts (for community tips and reviews)
export async function getGameRedditPosts(id: number): Promise<any[]> {
  try {
    if (!RAWG_API_KEY) {
      return [];
    }

    const response = await axios.get(`${RAWG_BASE_URL}/games/${id}/reddit`, {
      params: {
        key: RAWG_API_KEY,
        page_size: 10,
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching reddit posts:', error);
    return [];
  }
}

// Get similar games
export async function getSimilarGames(id: number): Promise<RawgGame[]> {
  try {
    if (!RAWG_API_KEY) {
      return [];
    }

    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        page_size: 8,
        ordering: '-rating',
      },
    });

    return response.data.results?.slice(0, 6) || [];
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
