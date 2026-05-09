import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";
import { approveArticle, deleteArticle } from "@/lib/db/articles";

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    await approveArticle(id);
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ success: true });
  });
}
