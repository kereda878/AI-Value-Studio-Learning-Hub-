import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_ARTICLES, DEMO_PENDING_ARTICLES } from "@/lib/demo";
import type { Article, CreateArticleInput } from "@/lib/types";
import { RECENT_ARTICLES_LIMIT } from "@/lib/constants";

// In-memory queue for demo mode (persists for the lifetime of the dev server process)
const demoPendingQueue: Article[] = [...DEMO_PENDING_ARTICLES];

export interface GetArticlesOptions {
  q?: string;
  category?: string;
  limit?: number;
  excludeIds?: string[];
}

export async function getArticles(opts: GetArticlesOptions = {}): Promise<Article[]> {
  const { q, category, limit = RECENT_ARTICLES_LIMIT, excludeIds } = opts;

  if (isDemoMode()) {
    let results = [...DEMO_ARTICLES];
    if (q) results = results.filter(a => a.title.toLowerCase().includes(q.toLowerCase()));
    if (category) results = results.filter(a => a.category === category);
    if (excludeIds?.length) results = results.filter(a => !excludeIds.includes(a.id));
    return results.slice(0, limit);
  }

  const supabase = await createClient();
  let query = supabase.from("articles").select("*").order("published_at", { ascending: false }).limit(limit);
  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (excludeIds?.length) query = query.not("id", "in", `(${excludeIds.join(",")})`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (isDemoMode()) {
    return DEMO_ARTICLES.find(a => a.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("id", id).single<Article>();
  return data ?? null;
}

export async function getArticleCategoryCounts(): Promise<Record<string, number>> {
  if (isDemoMode()) {
    const counts: Record<string, number> = {};
    DEMO_ARTICLES.forEach(a => { if (a.category) counts[a.category] = (counts[a.category] ?? 0) + 1; });
    return counts;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("category");
  const counts: Record<string, number> = {};
  (data ?? []).forEach(a => { if (a.category) counts[a.category] = (counts[a.category] ?? 0) + 1; });
  return counts;
}

export async function createArticle(input: CreateArticleInput, createdBy: string): Promise<Article> {
  if (isDemoMode()) {
    return {
      id: `demo-art-new-${Date.now()}`,
      title: input.title, url: input.url ?? null, content: input.content ?? null,
      summary: input.summary ?? null, ai_summary: input.ai_summary ?? null,
      category: input.category ?? null, tags: input.tags ?? [], source: input.source ?? null,
      author: input.author ?? null, image_url: input.image_url ?? null,
      is_featured: input.is_featured ?? false, read_count: 0, ai_tags: [],
      status: "published" as const, suggested_by_ai: false,
      created_by: createdBy, published_at: new Date().toISOString(), created_at: new Date().toISOString(),
    };
  }
  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient.from("articles").insert({
    title: input.title, url: input.url ?? null, content: input.content ?? null,
    summary: input.summary ?? null, ai_summary: input.ai_summary ?? null,
    category: input.category ?? null, tags: input.tags ?? [], source: input.source ?? null,
    author: input.author ?? null, image_url: input.image_url ?? null,
    is_featured: input.is_featured ?? false, created_by: createdBy,
  }).select().single<Article>();
  if (error) throw new Error(error.message);
  return data!;
}

export async function getPendingArticles(): Promise<Article[]> {
  if (isDemoMode()) return [...demoPendingQueue];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles").select("*").eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

export async function addToPendingQueue(input: CreateArticleInput, createdBy: string): Promise<Article> {
  const article: Article = {
    id: `pending-${Date.now()}`,
    title: input.title, url: input.url ?? null, content: input.content ?? null,
    summary: input.summary ?? null, ai_summary: input.ai_summary ?? null,
    category: input.category ?? null, tags: input.tags ?? [], source: input.source ?? null,
    author: input.author ?? null, image_url: input.image_url ?? null,
    is_featured: false, read_count: 0, ai_tags: [],
    status: "pending", suggested_by_ai: input.suggested_by_ai ?? false,
    created_by: createdBy, published_at: new Date().toISOString(), created_at: new Date().toISOString(),
  };
  if (isDemoMode()) {
    demoPendingQueue.unshift(article);
    return article;
  }
  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient.from("articles").insert({
    ...input, status: "pending", created_by: createdBy,
  }).select().single<Article>();
  if (error) throw new Error(error.message);
  return data!;
}

export async function approveArticle(id: string): Promise<void> {
  if (isDemoMode()) {
    const idx = demoPendingQueue.findIndex(a => a.id === id);
    if (idx >= 0) demoPendingQueue.splice(idx, 1);
    return;
  }
  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("articles").update({ status: "published" }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteArticle(id: string): Promise<void> {
  if (isDemoMode()) {
    const idx = demoPendingQueue.findIndex(a => a.id === id);
    if (idx >= 0) demoPendingQueue.splice(idx, 1);
    return;
  }
  const serviceClient = await createServiceClient();
  const { error } = await serviceClient.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function incrementReadCount(articleId: string): Promise<void> {
  if (isDemoMode()) return;
  const serviceClient = await createServiceClient();
  await serviceClient.rpc("increment_read_count", { article_id: articleId });
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (!ids.length) return [];
  if (isDemoMode()) return DEMO_ARTICLES.filter(a => ids.includes(a.id));
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}
