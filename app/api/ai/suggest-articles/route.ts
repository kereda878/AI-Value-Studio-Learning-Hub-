import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";
import { isDemoMode, DEMO_AI_SUGGESTIONS } from "@/lib/demo";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  return withAdmin(async () => {
    const { existingCategories } = await request.json().catch(() => ({ existingCategories: [] }));

    if (isDemoMode()) {
      return NextResponse.json({ suggestions: DEMO_AI_SUGGESTIONS });
    }

    const categoryContext = (existingCategories as string[]).length
      ? `Current library topics: ${(existingCategories as string[]).join(", ")}.`
      : "";

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: `You are a content curator for Genpact, a global professional services company specializing in AI, operations, and finance transformation.
Your job is to suggest specific thought leadership articles that Genpact employees at all levels would find valuable and actionable.
Focus on enterprise AI adoption, digital operations, finance transformation, leadership, and workforce development.`,
      messages: [
        {
          role: "user",
          content: `${categoryContext}

Suggest 6 thought leadership articles to publish this week. For each article return ONLY a JSON object with:
- id: unique string like "sug-001"
- title: compelling article title
- source: specific publication (HBR, McKinsey, MIT Sloan, Gartner, Forrester, Deloitte Insights, etc.)
- category: one of [AI & Automation, Finance, Leadership, Technology, Operations, People & Culture, Data & Analytics, Strategy]
- summary: 2 sentences — key insight + why it matters for Genpact employees
- search_hint: Google search query to find this article

Return ONLY a JSON array, no markdown fences.`,
        },
      ],
    });

    try {
      const text = (message.content[0] as { text: string }).text.trim();
      const suggestions = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      return NextResponse.json({ suggestions });
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  });
}
