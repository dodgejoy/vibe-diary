import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Create a mock client if credentials are not available
let supabase: any;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Return a mock client for build time
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      getSession: async () => ({ data: { session: null }, error: { message: 'Supabase not configured' } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: { message: 'Supabase not configured' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    }),
  };
}

export { supabase };

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return data.user ?? null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function signInWithEmail(email: string, password: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase is not configured. Add your project URL and anon key first.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(email: string, password: string): Promise<{ error: string | null; needsEmailConfirmation: boolean }> {
  if (!isSupabaseConfigured) {
    return {
      error: 'Supabase is not configured. Add your project URL and anon key first.',
      needsEmailConfirmation: false,
    };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  return {
    error: error?.message ?? null,
    needsEmailConfirmation: !data.session,
  };
}

export async function signOutCurrentUser(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase is not configured.' };
  }

  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export type UserProfile = {
  user_id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

async function requireAdmin(): Promise<string> {
  const userId = await requireUserId();
  const profile = await fetchCurrentUserProfile(userId);

  if (!profile || profile.role !== 'admin') {
    throw new Error('Admin access is required for this action.');
  }

  return userId;
}

export async function fetchCurrentUserProfile(userId?: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const resolvedUserId = userId ?? await getCurrentUserId();
  if (!resolvedUserId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', resolvedUserId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching current user profile:', error);
    }
    return null;
  }

  return data;
}

export async function fetchAdminProfiles(): Promise<UserProfile[]> {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    return [];
  }
}

export async function fetchAdminGames(): Promise<Game[]> {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin games:', error);
    return [];
  }
}

export async function updateUserRole(targetUserId: string, role: UserProfile['role']): Promise<{ error: string | null }> {
  try {
    const currentUserId = await requireAdmin();

    if (currentUserId === targetUserId && role !== 'admin') {
      return { error: 'You cannot remove admin role from the currently signed-in admin account here.' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', targetUserId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { error: error?.message ?? 'Failed to update user role.' };
  }
}

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('You must be signed in to access this data.');
  }

  return userId;
}

export type DetailedRatings = {
  gameplay: number;      // 0-20
  visuals: number;       // 0-15
  atmosphere: number;    // 0-15
  sound: number;         // 0-10
  technical: number;     // 0-10
  content: number;       // 0-10
  impression: number;    // 0-10
  story?: number;        // 0-15, only for story-driven singleplayer games
};

/** Max possible score for a given rating object (90 base, +15 if story is present). */
export function getMaxScore(ratings: DetailedRatings): number {
  return 'story' in ratings && ratings.story !== undefined ? 105 : 90;
}

/** Normalized 0–10 score. */
export function getNormalizedScore(ratings: DetailedRatings): number {
  const total = Object.values(ratings).reduce((a, b) => a + (b ?? 0), 0);
  return (total / getMaxScore(ratings)) * 10;
}

export type Game = {
  id: string;
  user_id?: string;
  title: string;
  cover_url?: string;
  status: 'Not Started' | 'Playing' | 'Completed' | 'Abandoned';
  notes?: string;
  detailed_ratings?: DetailedRatings | null;
  review_title?: string;
  pros?: string[];
  cons?: string[];
  steam_deck_status?: 'verified' | 'playable' | 'unsupported' | 'unknown';
  steam_deck_settings?: string;
  cover_id?: number;
  release_date?: string;
  genres?: string;
  rawg_id?: number;
  created_at: string;
  updated_at: string;
};

// Popular game entry returned by the RPC function
export type PopularGame = {
  title: string;
  cover_url: string | null;
  rawg_id: number | null;
  genres: string | null;
  release_date: string | null;
  user_count: number;
  avg_score: number | null;
};

// Fetch popular games across all users (requires get_popular_games RPC)
export async function fetchPopularGames(limit = 12): Promise<PopularGame[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.rpc('get_popular_games', { result_limit: limit });
    if (error) throw error;
    return (data as PopularGame[]) || [];
  } catch (error) {
    console.error('Error fetching popular games:', error);
    return [];
  }
}

// Fetch all games
export async function fetchGames(): Promise<Game[]> {
  try {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

// Fetch a single game by ID
export async function fetchGameById(id: string): Promise<Game | null> {
  try {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}

// Add a new game
export async function addGame(game: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Game | null> {
  try {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('games')
      .insert([{ ...game, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding game:', error);
    return null;
  }
}

// Update a game
export async function updateGame(id: string, updates: Partial<Game>): Promise<Game | null> {
  try {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('games')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating game:', error);
    return null;
  }
}

// Delete a game
export async function deleteGame(id: string): Promise<boolean> {
  try {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
}

export async function deleteAnyGameAsAdmin(id: string): Promise<{ error: string | null }> {
  try {
    await requireAdmin();

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting game as admin:', error);
    return { error: error?.message ?? 'Failed to delete game.' };
  }
}
