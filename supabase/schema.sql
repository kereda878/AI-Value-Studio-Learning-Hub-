-- ============================================================
-- Genpact Knowledge Hub — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Profiles (extends auth.users with roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'reader')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles"    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  summary      TEXT,
  content      TEXT,
  url          TEXT,
  image_url    TEXT,
  category     TEXT,
  tags         TEXT[] DEFAULT '{}',
  source       TEXT,
  author       TEXT,
  ai_summary   TEXT,
  ai_tags      TEXT[] DEFAULT '{}',
  is_featured  BOOLEAN DEFAULT FALSE,
  read_count   INTEGER DEFAULT 0,
  created_by   UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read articles"          ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admins can insert articles"        ON public.articles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update articles"        ON public.articles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete articles"        ON public.articles FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service role can manage articles"  ON public.articles FOR ALL USING (auth.role() = 'service_role');

-- Morning Brew (daily curated digests)
CREATE TABLE IF NOT EXISTS public.morning_brew (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brew_date   DATE NOT NULL UNIQUE,
  article_ids UUID[] NOT NULL DEFAULT '{}',
  ai_intro    TEXT,
  theme       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.morning_brew ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read morning brew"          ON public.morning_brew FOR SELECT USING (true);
CREATE POLICY "Service role can manage morning brew"  ON public.morning_brew FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage morning brew"        ON public.morning_brew FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User reading history (for AI recommendations)
CREATE TABLE IF NOT EXISTS public.user_reads (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

ALTER TABLE public.user_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own history"   ON public.user_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.user_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access"     ON public.user_reads FOR ALL USING (auth.role() = 'service_role');

-- Article saves / bookmarks
CREATE TABLE IF NOT EXISTS public.user_saves (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

ALTER TABLE public.user_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.user_saves FOR ALL USING (auth.uid() = user_id);

-- Seed sample categories (informational — not a table constraint)
-- Categories: AI & Automation, Leadership, Finance, Operations, Technology, Strategy, People & Culture

-- Notification preferences (opt-in email digest)
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_email   BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_hour INT NOT NULL DEFAULT 8 CHECK (delivery_hour BETWEEN 0 AND 23),
  tz            TEXT NOT NULL DEFAULT 'America/New_York',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs"         ON public.notification_prefs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role manages all prefs" ON public.notification_prefs FOR ALL USING (auth.role() = 'service_role');

-- Digest send log (open/click tracking per user per brew date)
CREATE TABLE IF NOT EXISTS public.digest_sends (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brew_date  DATE NOT NULL,
  sent_at    TIMESTAMPTZ DEFAULT NOW(),
  opened_at  TIMESTAMPTZ,
  clicked    JSONB DEFAULT '{}',
  UNIQUE (user_id, brew_date)
);

ALTER TABLE public.digest_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sends"           ON public.digest_sends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages all sends" ON public.digest_sends FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- To make yourself an admin after signing up, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
