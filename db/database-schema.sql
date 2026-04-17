-- Create games table for Game Diary
-- This table stores all games added to the user's game diary

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title VARCHAR(255) NOT NULL,
  cover_url TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'Not Started',
  notes TEXT,
  detailed_ratings JSONB,
  review_title VARCHAR(255),
  pros JSONB,
  cons JSONB,
  steam_deck_status VARCHAR(50) DEFAULT 'unknown',
  steam_deck_settings TEXT,
  cover_id INTEGER,
  release_date DATE,
  genres TEXT,
  rawg_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_user_id ON games(user_id);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_role ON profiles(role);

CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read their own games
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all games"
  ON games FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can delete all games"
  ON games FOR DELETE
  USING (public.is_admin());

-- Create policy to allow authenticated users to insert games
CREATE POLICY "Users can insert games"
  ON games FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to update their own games
CREATE POLICY "Users can update their own games"
  ON games FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to delete their own games
CREATE POLICY "Users can delete their own games"
  ON games FOR DELETE
  USING (user_id = auth.uid());

-- MIGRATION: Add logo_url column if upgrading from older schema
-- If you already have the games table without logo_url, run:
-- ALTER TABLE games ADD COLUMN logo_url TEXT;
-- This stores the URL of the game logo fetched from RAWG API

-- MIGRATION: Attach games to authenticated users
-- ALTER TABLE games ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- UPDATE games SET user_id = auth.uid() WHERE user_id IS NULL;
-- ALTER TABLE games ALTER COLUMN user_id SET DEFAULT auth.uid();
-- ALTER TABLE games ALTER COLUMN user_id SET NOT NULL;
--
-- MIGRATION: Create admin/user profiles
-- INSERT INTO profiles (user_id, email)
-- SELECT id, COALESCE(email, '') FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';

-- MIGRATION: Drop rating column if upgrading from older schema
-- If you have an old rating column (simple 0-5 stars), remove it:
-- ALTER TABLE games DROP COLUMN IF EXISTS rating;
-- We now use detailed_ratings with 7 criteria instead

-- MIGRATION: Add review columns if upgrading from older schema
-- ALTER TABLE games ADD COLUMN review_title VARCHAR(255);
-- ALTER TABLE games ADD COLUMN pros JSONB;
-- ALTER TABLE games ADD COLUMN cons JSONB;

-- MIGRATION: Add Steam Deck fields if upgrading from older schema
-- ALTER TABLE games ADD COLUMN steam_deck_status VARCHAR(50) DEFAULT 'unknown';
-- ALTER TABLE games ADD COLUMN steam_deck_settings TEXT;

-- ============================================
-- ACHIEVEMENT SYSTEM TABLES (v1.1+)
-- ============================================

-- Achievements: Built-in badge definitions
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_requirement JSONB NOT NULL,
  rarity VARCHAR(50) DEFAULT 'common',
  reward_points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements: Track unlocked achievements per user
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievement Stats: User achievement statistics
CREATE TABLE achievement_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_achievements INTEGER DEFAULT 0,
  total_reward_points INTEGER DEFAULT 0,
  last_achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for achievements
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at DESC);
CREATE INDEX idx_achievement_stats_user ON achievement_stats(user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view achievements"
  ON achievements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own unlocked achievements"
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all unlocked achievements"
  ON user_achievements FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can insert own unlocked achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievement progress"
  ON user_achievements FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own achievement stats"
  ON achievement_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all achievement stats"
  ON achievement_stats FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can insert own achievement stats"
  ON achievement_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievement stats"
  ON achievement_stats FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Default achievements
INSERT INTO achievements (slug, name, description, icon, category, trigger_type, trigger_requirement, rarity, reward_points) VALUES
('first_game', 'First Entry', 'Add your first game to the diary', '🎮', 'games', 'game_count', '{"count": 1}'::jsonb, 'common', 5),
('collector', 'Collector', 'Add 10 games to your library', '📚', 'games', 'game_count', '{"count": 10}'::jsonb, 'common', 10),
('completionist', 'Completionist', 'Mark 5 games as completed', '✓', 'games', 'status_change', '{"status": "completed", "count": 5}'::jsonb, 'rare', 20),
('explorer', 'Explorer', 'Add 50 games to your library', '🗺️', 'games', 'game_count', '{"count": 50}'::jsonb, 'epic', 50),
('marathon_runner', 'Marathon Runner', 'Add 100 games to your library', '🏃', 'games', 'game_count', '{"count": 100}'::jsonb, 'legendary', 100),
('critic', 'Critic', 'Rate 10 games in detail', '⭐', 'ratings', 'rating_count', '{"count": 10}'::jsonb, 'common', 10),
('perfectionist', 'Perfectionist', 'Give a 90/90 rating to a game', '💯', 'ratings', 'perfect_rating', '{"score": 90}'::jsonb, 'epic', 30),
('harsh_critic', 'Harsh Critic', 'Give a low rating to a game', '😤', 'ratings', 'low_rating', '{"score": 20}'::jsonb, 'rare', 15),
('on_a_roll', 'On a Roll', 'Have 5 games currently being played', '🔥', 'games', 'concurrent_playing', '{"count": 5}'::jsonb, 'rare', 25);
