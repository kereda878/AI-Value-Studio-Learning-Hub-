import { NextResponse } from "next/server";
import { withAuth } from "@/lib/supabase/guard";
import { createClient } from "@/lib/supabase/server";
import { getRecommendedIds } from "@/lib/ai/recommend";
import { getArticlesByIds } from "@/lib/db/articles";
import { RECOMMENDATIONS_LIMIT } from "@/lib/constants";

export async function POST(request: Request) {
  return withAuth(async () => {
    const { readIds = [] } = await request.json();
    const supabase = await createClient();

    // Fetch read context and unread candidates in parallel
    const [readHistory, { data: candidateData }] = await Promise.all([
      readIds.length
        ? supabase.from("articles").select("title, category").in("id", readIds).then(r => r.data ?? [])
        : Promise.resolve([]),
      readIds.length
        ? supabase.from("articles").select("id, title, category, ai_summary")
            .not("id", "in", `(${readIds.join(",")})`)
            .order("published_at", { ascending: false }).limit(30)
        : supabase.from("articles").select("id, title, category, ai_summary")
            .order("published_at", { ascending: false }).limit(30),
    ]);

    const candidates = candidateData ?? [];
    if (!candidates.length) return NextResponse.json({ articles: [] });

    const recommendedIds = await getRecommendedIds(readHistory, candidates);
    const articles = await getArticlesByIds(recommendedIds);
    return NextResponse.json({ articles });
  });
}
