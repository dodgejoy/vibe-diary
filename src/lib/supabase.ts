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
};

export type Game = {
  id: string;
  user_id?: string;
  title: string;
  cover_url?: string;
  logo_url?: string;
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

// ============================================
// ACHIEVEMENT SYSTEM TYPES & FUNCTIONS
// ============================================

export type Achievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'games' | 'ratings' | 'playtime' | 'collections';
  trigger_type: string;
  trigger_requirement: Record<string, any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward_points: number;
  created_at: string;
  updated_at: string;
};

export type UserAchievement = {
  id: string;
  achievement_id: string;
  user_id: string;
  unlocked_at: string;
  progress: number; // 0-100
  created_at: string;
};

export type AchievementStats = {
  id: string;
  user_id: string;
  total_achievements: number;
  total_reward_points: number;
  last_achieved_at?: string;
  created_at: string;
  updated_at: string;
};

export type AdminUserAchievement = UserAchievement & {
  achievement?: Achievement | null;
};

// Fetch all available achievements
export async function fetchAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

export async function fetchAdminAchievementStats(): Promise<AchievementStats[]> {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from('achievement_stats')
      .select('*')
      .order('total_reward_points', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin achievement stats:', error);
    return [];
  }
}

export async function fetchAdminUserAchievements(): Promise<AdminUserAchievement[]> {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin user achievements:', error);
    return [];
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

// Fetch user's unlocked achievements
export async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

// Fetch user's achievement statistics
export async function fetchAchievementStats(userId: string): Promise<AchievementStats | null> {
  try {
    const { data, error } = await supabase
      .from('achievement_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no stats exist yet, create them
      // PGRST116 = no rows returned, but also check for "not found" in message
      if (error.code === 'PGRST116' || error.message?.includes('not found')) {
        return await createAchievementStats(userId);
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return null;
  }
}

// Create initial achievement stats for a user
export async function createAchievementStats(userId: string): Promise<AchievementStats | null> {
  try {
    const { data, error } = await supabase
      .from('achievement_stats')
      .insert([{
        user_id: userId,
        total_achievements: 0,
        total_reward_points: 0,
      }])
      .select()
      .single();

    if (error) {
      // If the record already exists (duplicate key), fetch and return it instead
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return await fetchAchievementStats(userId);
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating achievement stats:', error);
    return null;
  }
}

// Unlock an achievement for a user
export async function unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
  try {
    // Check if already unlocked
    const { data: existing, error: existingError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      // Already unlocked, return existing
      return existing;
    }

    // If error is NOT "no rows found", throw it
    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    // Get achievement to get reward points
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievements')
      .select('reward_points')
      .eq('id', achievementId)
      .single();

    if (achievementError) throw achievementError;

    // Insert new user achievement
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        progress: 100,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update achievement stats
    try {
      const { data: statsData } = await supabase
        .from('achievement_stats')
        .select('total_achievements, total_reward_points')
        .eq('user_id', userId)
        .single();

      if (statsData) {
        await supabase
          .from('achievement_stats')
          .update({
            total_achievements: (statsData.total_achievements || 0) + 1,
            total_reward_points: (statsData.total_reward_points || 0) + (achievementData?.reward_points || 0),
            last_achieved_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    } catch (statsError) {
      console.warn('Error updating achievement stats:', statsError);
      // Don't fail the whole unlock if stats update fails
    }

    return data;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
}

// Update achievement progress
export async function updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .update({ progress: Math.min(progress, 100) })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .select()
      .single();

    if (error) throw error;

    // If progress reaching 100%, automatically unlock
    if (progress >= 100) {
      await unlockAchievement(userId, achievementId);
    }

    return data;
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    return null;
  }
}

// Check and unlock achievements based on game stats
export async function checkAchievements(userId: string): Promise<string[]> {
  const unlockedAchievementIds: string[] = [];

  try {
    // Get all games for this user
    const games = await fetchGames();
    const achievements = await fetchAchievements();
    const userAchievements = await fetchUserAchievements(userId);

    // Track which achievements have been unlocked
    const unlockedAchievementIdsSet = new Set(userAchievements.map(ua => ua.achievement_id));

    // Count games by status
    const gameCount = games.length;
    const completedCount = games.filter(g => g.status === 'Completed').length;
    const playingCount = games.filter(g => g.status === 'Playing').length;
    const ratedCount = games.filter(g => g.detailed_ratings).length;

    // Check each achievement
    for (const achievement of achievements) {
      if (unlockedAchievementIdsSet.has(achievement.id)) {
        continue; // Already unlocked
      }

      let shouldUnlock = false;

      switch (achievement.trigger_type) {
        case 'game_count':
          if (gameCount >= achievement.trigger_requirement.count) {
            shouldUnlock = true;
          }
          break;

        case 'status_change':
          if (achievement.trigger_requirement.status === 'completed' &&
              completedCount >= achievement.trigger_requirement.count) {
            shouldUnlock = true;
          }
          break;

        case 'concurrent_playing':
          if (playingCount >= achievement.trigger_requirement.count) {
            shouldUnlock = true;
          }
          break;

        case 'rating_count':
          if (ratedCount >= achievement.trigger_requirement.count) {
            shouldUnlock = true;
          }
          break;

        case 'perfect_rating':
          const perfectGame = games.find(g =>
            g.detailed_ratings &&
            (g.detailed_ratings.gameplay + g.detailed_ratings.visuals +
              g.detailed_ratings.atmosphere + g.detailed_ratings.sound +
              g.detailed_ratings.technical + g.detailed_ratings.content +
              g.detailed_ratings.impression) === 90
          );
          if (perfectGame) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        const result = await unlockAchievement(userId, achievement.id);
        if (result) {
          unlockedAchievementIds.push(achievement.id);
        }
      }
    }

    return unlockedAchievementIds;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}
