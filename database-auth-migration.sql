-- Migration for EXISTING Supabase projects that already have tables.
-- Use this instead of database-schema.sql when `games` already exists.
--
-- IMPORTANT:
-- 1. Replace YOUR_EMAIL_HERE with the email of the account you just created.
-- 2. This preserves existing games and assigns them to that account.
-- 3. Achievement progress tables are recreated to match the new auth-based schema.

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'sayrisshow@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found for email sayrisshow@gmail.com';
  END IF;

  ALTER TABLE public.games
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

  UPDATE public.games
  SET user_id = target_user_id
  WHERE user_id IS NULL;

  ALTER TABLE public.games
    ALTER COLUMN user_id SET DEFAULT auth.uid();

  ALTER TABLE public.games
    ALTER COLUMN user_id SET NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own games" ON public.games;
DROP POLICY IF EXISTS "Users can insert games" ON public.games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Users can delete their own games" ON public.games;

CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert games"
  ON public.games FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own games"
  ON public.games FOR DELETE
  USING (user_id = auth.uid());

DROP TABLE IF EXISTS public.user_achievements;
DROP TABLE IF EXISTS public.achievement_stats;

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  progress integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.achievement_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_achievements integer DEFAULT 0,
  total_reward_points integer DEFAULT 0,
  last_achieved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON public.user_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_stats_user ON public.achievement_stats(user_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can view own unlocked achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own unlocked achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update own achievement progress" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view own achievement stats" ON public.achievement_stats;
DROP POLICY IF EXISTS "Users can insert own achievement stats" ON public.achievement_stats;
DROP POLICY IF EXISTS "Users can update own achievement stats" ON public.achievement_stats;

CREATE POLICY "Anyone authenticated can view achievements"
  ON public.achievements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own unlocked achievements"
  ON public.user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own unlocked achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievement progress"
  ON public.user_achievements FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own achievement stats"
  ON public.achievement_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievement stats"
  ON public.achievement_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievement stats"
  ON public.achievement_stats FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());