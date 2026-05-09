import { NextResponse } from "next/server";
import { withAdmin, withAuth } from "@/lib/supabase/guard";
import { getTodaysBrew, upsertBrew } from "@/lib/db/brew";

export async function GET() {
  return withAuth(async () => {
    const brew = await getTodaysBrew();
    return NextResponse.json({ brew });
  });
}

export async function POST(request: Request) {
  return withAdmin(async () => {
    const body = await request.json();
    if (!body.article_ids?.length) {
      return NextResponse.json({ error: "Select at least one article" }, { status: 400 });
    }
    const brew = await upsertBrew(body);
    return NextResponse.json({ brew });
  });
}
