import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";
import { generateBrewIntro } from "@/lib/ai/brew";

export async function POST(request: Request) {
  return withAdmin(async () => {
    const { articles } = await request.json();
    if (!articles?.length) {
      return NextResponse.json({ error: "No articles provided" }, { status: 400 });
    }
    const result = await generateBrewIntro(articles);
    return NextResponse.json(result);
  });
}
