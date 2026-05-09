import Anthropic from "@anthropic-ai/sdk";
import { RECOMMENDATIONS_LIMIT } from "@/lib/constants";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ArticleStub {
  id: string;
  title: string;
  category: string | null;
  ai_summary?: string | null;
}

export async function getRecommendedIds(
  readHistory: Pick<ArticleStub, "title" | "category">[],
  candidates: ArticleStub[]
): Promise<string[]> {
  if (!candidates.length) return [];

  const historyText = readHistory.length
    ? readHistory.map(a => `- [${a.category}] ${a.title}`).join("\n")
    : "No reading history yet.";

  const candidatesText = candidates
    .map(a => `ID:${a.id} | [${a.category}] ${a.title}: ${a.ai_summary ?? ""}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system: `You are a personalized learning assistant for Genpact employees.
Based on a user's reading history, recommend ${RECOMMENDATIONS_LIMIT} articles from the candidates list they would find most valuable.
Respond with only a JSON array of article IDs: ["id1", "id2", "id3"]`,
    messages: [{
      role: "user",
      content: `Reading history:\n${historyText}\n\nCandidates:\n${candidatesText}\n\nReturn ${RECOMMENDATIONS_LIMIT} recommended article IDs as JSON array.`,
    }],
  });

  try {
    const text = (message.content[0] as { text: string }).text;
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return candidates.slice(0, RECOMMENDATIONS_LIMIT).map(a => a.id);
  }
}
