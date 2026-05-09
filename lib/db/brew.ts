import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { MorningBrew, UpsertBrewInput } from "@/lib/types";
import { getArticlesByIds } from "./articles";
import { todayISO } from "@/lib/utils";

export async function getTodaysBrew(): Promise<MorningBrew | null> {
  return getBrewByDate(todayISO());
}

export async function getBrewByDate(date: string): Promise<MorningBrew | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("morning_brew")
    .select("*")
    .eq("brew_date", date)
    .single<MorningBrew>();

  if (error || !data) return null;

  const articles = await getArticlesByIds(data.article_ids ?? []);
  return { ...data, articles };
}

export async function upsertBrew(input: UpsertBrewInput): Promise<MorningBrew> {
  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient
    .from("morning_brew")
    .upsert(
      {
        brew_date: input.brew_date,
        article_ids: input.article_ids,
        ai_intro: input.ai_intro ?? null,
        theme: input.theme ?? null,
      },
      { onConflict: "brew_date" }
    )
    .select()
    .single<MorningBrew>();

  if (error) throw new Error(error.message);
  return data!;
}
