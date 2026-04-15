-- Create games table for Game Diary
-- This table stores all games added to the user's game diary

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read their own games
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (auth.uid()::text = (SELECT auth.uid()::text));

-- Create policy to allow authenticated users to insert games
CREATE POLICY "Users can insert games"
  ON games FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT auth.uid()::text));

-- Create policy to allow users to update their own games
CREATE POLICY "Users can update their own games"
  ON games FOR UPDATE
  USING (auth.uid()::text = (SELECT auth.uid()::text));

-- Create policy to allow users to delete their own games
CREATE POLICY "Users can delete their own games"
  ON games FOR DELETE
  USING (auth.uid()::text = (SELECT auth.uid()::text));

-- MIGRATION: Add logo_url column if upgrading from older schema
-- If you already have the games table without logo_url, run:
-- ALTER TABLE games ADD COLUMN logo_url TEXT;
-- This stores the URL of the game logo fetched from RAWG API

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
  user_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievement Stats: User achievement statistics
CREATE TABLE achievement_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
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
