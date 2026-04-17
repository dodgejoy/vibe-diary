-- Migration: Add RPC function for community average ratings per game
-- Returns average detailed_ratings across all users for a given rawg_id
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_community_ratings(game_rawg_id INTEGER)
RETURNS TABLE (
  rater_count BIGINT,
  avg_gameplay NUMERIC,
  avg_visuals NUMERIC,
  avg_atmosphere NUMERIC,
  avg_sound NUMERIC,
  avg_technical NUMERIC,
  avg_content NUMERIC,
  avg_impression NUMERIC,
  avg_story NUMERIC,
  has_story BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COUNT(*) AS rater_count,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'gameplay')::numeric, 0)), 1) AS avg_gameplay,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'visuals')::numeric, 0)), 1) AS avg_visuals,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'atmosphere')::numeric, 0)), 1) AS avg_atmosphere,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'sound')::numeric, 0)), 1) AS avg_sound,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'technical')::numeric, 0)), 1) AS avg_technical,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'content')::numeric, 0)), 1) AS avg_content,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'impression')::numeric, 0)), 1) AS avg_impression,
    ROUND(AVG(COALESCE((g.detailed_ratings->>'story')::numeric, 0)), 1) AS avg_story,
    BOOL_OR(g.detailed_ratings ? 'story' AND (g.detailed_ratings->>'story') IS NOT NULL) AS has_story
  FROM public.games g
  WHERE g.rawg_id = game_rawg_id
    AND g.detailed_ratings IS NOT NULL;
$$;
