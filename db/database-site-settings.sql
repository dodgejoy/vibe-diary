-- Site Settings table
-- Stores global site configuration as a single JSON row
-- Only admins can update, everyone can read

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default row
INSERT INTO public.site_settings (id, settings)
VALUES ('global', '{}')
ON CONFLICT (id) DO NOTHING;

-- Everyone can read settings (needed for feature flags, announcements)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
