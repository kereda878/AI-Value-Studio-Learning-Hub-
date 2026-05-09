import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";
import { summarizeArticle, suggestTags } from "@/lib/ai/summarize";

export async function POST(request: Request) {
  return withAdmin(async () => {
    const { title, content, url } = await request.json();
    if (!title && !content && !url) {
      return NextResponse.json({ error: "Provide title, content, or url" }, { status: 400 });
    }
    const summary = await summarizeArticle(title ?? "", content ?? "", url);
    const tags = await suggestTags(title ?? "", summary);
    return NextResponse.json({ summary, tags });
  });
}
