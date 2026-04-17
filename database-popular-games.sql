-- Migration: Add RPC function for popular games across all users
-- This function bypasses RLS to aggregate game popularity data
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_popular_games(result_limit INTEGER DEFAULT 12)
RETURNS TABLE (
  title TEXT,
  cover_url TEXT,
  rawg_id INTEGER,
  genres TEXT,
  release_date DATE,
  user_count BIGINT,
  avg_score NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    g.title,
    MAX(g.cover_url) AS cover_url,
    g.rawg_id,
    MAX(g.genres) AS genres,
    MAX(g.release_date) AS release_date,
    COUNT(DISTINCT g.user_id) AS user_count,
    ROUND(AVG(
      CASE
        WHEN g.detailed_ratings IS NOT NULL THEN
          (
            COALESCE((g.detailed_ratings->>'gameplay')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'visuals')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'atmosphere')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'sound')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'technical')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'content')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'impression')::numeric, 0) +
            COALESCE((g.detailed_ratings->>'story')::numeric, 0)
          ) / CASE
              WHEN g.detailed_ratings ? 'story' AND (g.detailed_ratings->>'story') IS NOT NULL
              THEN 105.0
              ELSE 90.0
            END * 10
        ELSE NULL
      END
    ), 1) AS avg_score
  FROM public.games g
  GROUP BY g.rawg_id, g.title
  HAVING COUNT(DISTINCT g.user_id) >= 1
  ORDER BY COUNT(DISTINCT g.user_id) DESC, MAX(g.created_at) DESC
  LIMIT result_limit;
$$;
