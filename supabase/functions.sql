-- ============================================================
-- Genpact Knowledge Hub — Database Functions
-- Run this in your Supabase SQL editor after schema.sql
-- ============================================================

-- Atomically increment article read count (avoids race conditions)
CREATE OR REPLACE FUNCTION public.increment_read_count(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles
  SET read_count = read_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get top articles by read count for a given period
CREATE OR REPLACE FUNCTION public.get_trending_articles(days_back INT DEFAULT 7, result_limit INT DEFAULT 10)
RETURNS SETOF public.articles AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM public.articles a
  WHERE a.published_at >= NOW() - (days_back || ' days')::INTERVAL
  ORDER BY a.read_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread articles for a specific user (for recommendations)
CREATE OR REPLACE FUNCTION public.get_unread_articles(p_user_id UUID, result_limit INT DEFAULT 30)
RETURNS SETOF public.articles AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM public.articles a
  WHERE a.id NOT IN (
    SELECT ur.article_id FROM public.user_reads ur WHERE ur.user_id = p_user_id
  )
  ORDER BY a.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
