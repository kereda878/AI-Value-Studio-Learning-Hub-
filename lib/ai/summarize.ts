import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Static system prompt — eligible for prompt caching across all summarization calls
const SUMMARY_SYSTEM = `You are a knowledge curation assistant for Genpact, a global professional services company.
Summarize articles in 2-3 sentences that highlight the key business insight and why it matters for people working in AI, technology, operations, and finance at an enterprise level.
Be concise, professional, and forward-looking.`;

const TAGS_SYSTEM = `Generate 3-5 relevant tags for a thought leadership article at Genpact.
Tags should be short (1-3 words) and relevant to enterprise, AI, operations, finance, or technology topics.
Respond with only a JSON array: ["tag1", "tag2", "tag3"]`;

/** Non-streaming summary — used by the upload form and RSS ingestion */
export async function summarizeArticle(
  title: string,
  content: string,
  url?: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: [{ type: "text", text: SUMMARY_SYSTEM, cache_control: { type: "ephemeral" } }] as Parameters<typeof client.messages.create>[0]["system"],
    messages: [{
      role: "user",
      content: `Summarize this article for a Genpact employee audience:\n\nTitle: ${title}\n\n${content || url || ""}`,
    }],
  });

  return (message.content[0] as { text: string }).text;
}

/** Streaming summary — yields text chunks as they arrive from Claude */
export async function* streamSummarize(
  title: string,
  body: string,
  url?: string
): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: [{ type: "text", text: SUMMARY_SYSTEM, cache_control: { type: "ephemeral" } }] as Parameters<typeof client.messages.create>[0]["system"],
    messages: [{
      role: "user",
      content: `Summarize this article for a Genpact employee audience:\n\nTitle: ${title}\n\n${body || url || ""}`,
    }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export async function suggestTags(title: string, summary: string): Promise<string[]> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: [{ type: "text", text: TAGS_SYSTEM, cache_control: { type: "ephemeral" } }] as Parameters<typeof client.messages.create>[0]["system"],
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
