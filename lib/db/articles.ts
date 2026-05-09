import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Article, CreateArticleInput } from "@/lib/types";
import { RECENT_ARTICLES_LIMIT } from "@/lib/constants";

export interface GetArticlesOptions {
  q?: string;
  category?: string;
  limit?: number;
  excludeIds?: string[];
}

export async function getArticles(opts: GetArticlesOptions = {}): Promise<Article[]> {
  const supabase = await createClient();
  const { q, category, limit = RECENT_ARTICLES_LIMIT, excludeIds } = opts;

  let query = supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (excludeIds?.length) query = query.not("id", "in", `(${excludeIds.join(",")})`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single<Article>();

  if (error) return null;
  return data;
}

export async function getArticleCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("category");
  const counts: Record<string, number> = {};
  (data ?? []).forEach(a => {
    if (a.category) counts[a.category] = (counts[a.category] ?? 0) + 1;
  });
  return counts;
}

export async function createArticle(
  input: CreateArticleInput,
  createdBy: string
): Promise<Article> {
  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient
    .from("articles")
    .insert({
      title: input.title,
      url: input.url ?? null,
      content: input.content ?? null,
      summary: input.summary ?? null,
      ai_summary: input.ai_summary ?? null,
      category: input.category ?? null,
      tags: input.tags ?? [],
      source: input.source ?? null,
      author: input.author ?? null,
      image_url: input.image_url ?? null,
      is_featured: input.is_featured ?? false,
      created_by: createdBy,
    })
    .select()
    .single<Article>();

  if (error) throw new Error(error.message);
  return data!;
}

export async function deleteArticle(id: string): Promise<void> {
  const serviceClient = await createServiceClient();
  const { error } = await serviceClient.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function incrementReadCount(articleId: string): Promise<void> {
  const serviceClient = await createServiceClient();
  await serviceClient.rpc("increment_read_count", { article_id: articleId });
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .in("id", ids);
  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}
