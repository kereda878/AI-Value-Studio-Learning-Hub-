import { createClient } from "@/lib/supabase/server";
import { READ_HISTORY_LIMIT } from "@/lib/constants";

export async function trackRead(userId: string, articleId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("user_reads")
    .upsert({ user_id: userId, article_id: articleId }, { onConflict: "user_id,article_id" });
}

export async function getUserReadIds(userId: string, limit = READ_HISTORY_LIMIT): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_reads")
    .select("article_id")
    .eq("user_id", userId)
    .order("read_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(r => r.article_id);
}

export async function getUserSaveIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_saves")
    .select("article_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map(s => s.article_id));
}

export async function addSave(userId: string, articleId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("user_saves").insert({ user_id: userId, article_id: articleId });
}

export async function removeSave(userId: string, articleId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("user_saves").delete().match({ user_id: userId, article_id: articleId });
}

export async function isSaved(userId: string, articleId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_saves")
    .select("article_id")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .single();
  return !!data;
}
