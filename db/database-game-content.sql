-- Custom game content managed by admins
-- Supplements RAWG API data with custom logos, descriptions, screenshots, tags

CREATE TABLE IF NOT EXISTS public.game_custom_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_rawg_id integer NOT NULL UNIQUE,
  game_name text NOT NULL,
  logo_url text,
  banner_url text,
  description text,
  tags text[] DEFAULT '{}',
  screenshots text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_by uuid REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.game_custom_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read custom content (needed on game pages)
CREATE POLICY "Anyone can read game custom content"
  ON public.game_custom_content FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Only admins can insert game custom content"
  ON public.game_custom_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update
CREATE POLICY "Only admins can update game custom content"
  ON public.game_custom_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "Only admins can delete game custom content"
  ON public.game_custom_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Index for fast lookup by RAWG ID
CREATE INDEX IF NOT EXISTS idx_game_custom_content_rawg_id
  ON public.game_custom_content(game_rawg_id);

-- ============================================
-- Supabase Storage bucket for game content
-- Run this in SQL Editor OR create the bucket
-- manually via Supabase Dashboard > Storage
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('game-content', 'game-content', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view uploaded files (public bucket)
CREATE POLICY "Public read access for game-content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-content');

-- Only admins can upload files
CREATE POLICY "Admin upload for game-content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'game-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update/overwrite files
CREATE POLICY "Admin update for game-content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'game-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete files
CREATE POLICY "Admin delete for game-content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'game-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
