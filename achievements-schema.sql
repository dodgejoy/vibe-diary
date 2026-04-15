-- ============================================
-- ACHIEVEMENT SYSTEM DATABASE SCHEMA
-- ============================================
-- Add to your Supabase SQL Editor and run

-- ============================================
-- 1. ACHIEVEMENTS TABLE (Built-in badges)
-- ============================================
CREATE TABLE public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL, -- lucide icon name or emoji
  category text NOT NULL, -- 'games', 'ratings', 'playtime', 'collections'
  trigger_type text NOT NULL, -- 'game_count', 'rating_score', 'playtime_hours', 'status_change', 'custom'
  trigger_requirement jsonb NOT NULL, -- {'count': 5} for game_count, etc.
  rarity text DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  reward_points integer DEFAULT 10, -- XP points for this achievement
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default achievements
INSERT INTO public.achievements (slug, name, description, icon, category, trigger_type, trigger_requirement, rarity, reward_points) VALUES
-- Game Milestones
('first_game', 'First Entry', 'Add your first game to the diary', '🎮', 'games', 'game_count', '{"count": 1}'::jsonb, 'common', 5),
('collector', 'Collector', 'Add 10 games to your library', '📚', 'games', 'game_count', '{"count": 10}'::jsonb, 'common', 10),
('completionist', 'Completionist', 'Mark 5 games as completed', 'CheckCircle', 'games', 'status_change', '{"status": "completed", "count": 5}'::jsonb, 'rare', 20),
('explorer', 'Explorer', 'Add 50 games to your library', '🗺️', 'games', 'game_count', '{"count": 50}'::jsonb, 'epic', 50),
('marathon_runner', 'Marathon Runner', 'Add 100 games to your library', '🏃', 'games', 'game_count', '{"count": 100}'::jsonb, 'legendary', 100),

-- Rating Milestones
('critic', 'Critic', 'Rate 10 games in detail', '⭐', 'ratings', 'rating_count', '{"count": 10}'::jsonb, 'common', 10),
('perfectionist', 'Perfectionist', 'Give a 90/90 rating to a game', '💯', 'ratings', 'perfect_rating', '{"score": 90}'::jsonb, 'epic', 30),
('harsh_critic', 'Harsh Critic', 'Give a 20 point rating to a game', '😤', 'ratings', 'low_rating', '{"score": 20}'::jsonb, 'rare', 15),

-- Genre Exploration
('genre_master_action', 'Action Master', 'Complete 3 action games', '⚡', 'games', 'genre_complete', '{"genre": "action", "count": 3}'::jsonb, 'rare', 15),
('genre_master_rpg', 'RPG Master', 'Complete 3 RPG games', '🗡️', 'games', 'genre_complete', '{"genre": "rpg", "count": 3}'::jsonb, 'rare', 15),
('genre_master_adventure', 'Adventure Seeker', 'Complete 3 adventure games', '🧭', 'games', 'genre_complete', '{"genre": "adventure", "count": 3}'::jsonb, 'rare', 15),

-- Status Streaks
('on_a_roll', 'On a Roll', 'Have 5 games currently being played', 'Flame', 'games', 'concurrent_playing', '{"count": 5}'::jsonb, 'rare', 25);

-- ============================================
-- 2. USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Will be filled when auth is implemented
  unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  progress integer DEFAULT 0, -- Progress towards achievement (0-100%)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Composite index for quick lookups
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON public.user_achievements(user_id, unlocked_at DESC);

-- ============================================
-- 3. ACHIEVEMENT STATISTICS TABLE
-- ============================================
CREATE TABLE public.achievement_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  total_achievements integer DEFAULT 0,
  total_reward_points integer DEFAULT 0,
  last_achieved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Index for quick user stats lookup
CREATE INDEX idx_achievement_stats_user ON public.achievement_stats(user_id);

-- ============================================
-- MIGRATION SQL (Run if upgrading from v1.0)
-- ============================================
-- These are the same CREATE TABLE statements above
-- Just paste them into Supabase SQL Editor and run

-- ============================================
-- QUERIES FOR ACHIEVEMENT CHECKING
-- ============================================

-- Get all achievements for a user
-- SELECT * FROM public.user_achievements 
-- WHERE user_id = $1 
-- ORDER BY unlocked_at DESC;

-- Get achievement progress
-- SELECT 
--   a.id, a.name, a.description,
--   ua.progress,
--   CASE WHEN ua.id IS NOT NULL THEN 'unlocked' ELSE 'locked' END as status,
--   ua.unlocked_at
-- FROM public.achievements a
-- LEFT JOIN public.user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
-- ORDER BY a.category, a.name;

-- Count games by status
-- SELECT status, COUNT(*) FROM public.games 
-- WHERE user_id = $1 
-- GROUP BY status;

-- Get user achievement stats
-- SELECT * FROM public.achievement_stats WHERE user_id = $1;
