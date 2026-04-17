-- Admin role migration for an EXISTING project.
-- 1. Replace YOUR_ADMIN_EMAIL_HERE with the account email that should become admin.
-- 2. Run the whole script in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE OR REPLACE FUNCTION public.is_admin()
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

INSERT INTO public.profiles (user_id, email)
SELECT id, COALESCE(email, '')
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all games" ON public.games;
DROP POLICY IF EXISTS "Admins can delete all games" ON public.games;

CREATE POLICY "Admins can view all games"
  ON public.games FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can delete all games"
  ON public.games FOR DELETE
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
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

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

UPDATE public.profiles
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE email = 'sayrisshow@gmail.com';

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all unlocked achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Admins can view all achievement stats" ON public.achievement_stats;

CREATE POLICY "Admins can view all unlocked achievements"
  ON public.user_achievements FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all achievement stats"
  ON public.achievement_stats FOR SELECT
  USING (public.is_admin());