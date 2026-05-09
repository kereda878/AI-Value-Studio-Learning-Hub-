import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a knowledge curation assistant for Genpact, a global professional services company.
Summarize articles in 2-3 sentences that highlight the key business insight and why it matters for people working in AI, technology, operations, and finance at an enterprise level.
Be concise, professional, and forward-looking.`;

export async function summarizeArticle(
  title: string,
  content: string,
  url?: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Summarize this article for a Genpact employee audience:\n\nTitle: ${title}\n\n${content || url || ""}`,
    }],
  });

  return (message.content[0] as { text: string }).text;
}

export async function suggestTags(title: string, summary: string): Promise<string[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    system: `Generate 3-5 relevant tags for a thought leadership article at Genpact.
Tags should be short (1-3 words) and relevant to enterprise, AI, operations, finance, or technology topics.
Respond with only a JSON array: ["tag1", "tag2", "tag3"]`,
    messages: [{
      role: "user",
      content: `Title: ${title}\nSummary: ${summary}`,
    }],
  });

  try {
    const text = (message.content[0] as { text: string }).text;
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return [];
  }
}
