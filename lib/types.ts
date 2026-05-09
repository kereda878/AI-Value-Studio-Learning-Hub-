// ─── Domain types only. Constants live in lib/constants.ts ───────────────────

export type Role = "admin" | "reader";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export type ArticleStatus = "published" | "pending";

export interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  url: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[];
  source: string | null;
  author: string | null;
  ai_summary: string | null;
  ai_tags: string[];
  is_featured: boolean;
  read_count: number;
  status: ArticleStatus;
  suggested_by_ai: boolean;
  created_by: string | null;
  published_at: string;
  created_at: string;
}

export interface ArticleSuggestion {
  id: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  search_hint: string;
}

export interface MorningBrew {
  id: string;
  brew_date: string;
  article_ids: string[];
  ai_intro: string | null;
  theme: string | null;
  created_at: string;
  articles?: Article[];
}

export interface UserRead {
  user_id: string;
  article_id: string;
  read_at: string;
}

export interface UserSave {
  user_id: string;
  article_id: string;
  saved_at: string;
}

// Input shapes for creating/updating records
export interface CreateArticleInput {
  title: string;
  url?: string;
  content?: string;
  summary?: string;
  ai_summary?: string;
  category?: string;
  tags?: string[];
  source?: string;
  author?: string;
  image_url?: string;
  is_featured?: boolean;
  status?: ArticleStatus;
  suggested_by_ai?: boolean;
}

export interface UpsertBrewInput {
  brew_date: string;
  article_ids: string[];
  ai_intro?: string;
  theme?: string;
}
