import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";
import { getPendingArticles, addToPendingQueue } from "@/lib/db/articles";

export async function GET() {
  return withAdmin(async () => {
    const articles = await getPendingArticles();
    return NextResponse.json({ articles });
  });
}

export async function POST(request: Request) {
  return withAdmin(async (userId) => {
    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const article = await addToPendingQueue(body, userId);
    return NextResponse.json({ article }, { status: 201 });
  });
}
