import { NextResponse } from "next/server";
import { withAdmin, withAuth } from "@/lib/supabase/guard";
import { getArticles, createArticle, deleteArticle } from "@/lib/db/articles";

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const articles = await getArticles({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      limit: parseInt(searchParams.get("limit") ?? "20"),
    });
    return NextResponse.json({ articles });
  });
}

export async function POST(request: Request) {
  return withAdmin(async (userId) => {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const article = await createArticle(body, userId);
    return NextResponse.json({ article }, { status: 201 });
  });
}

export async function DELETE(request: Request) {
  return withAdmin(async () => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await deleteArticle(id);
    return NextResponse.json({ success: true });
  });
}
