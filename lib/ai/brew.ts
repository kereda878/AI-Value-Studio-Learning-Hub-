import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface BrewArticle {
  title: string;
  category: string | null;
  ai_summary: string | null;
}

interface BrewIntroResult {
  intro: string;
  theme: string;
}

const FALLBACK: BrewIntroResult = {
  intro: "Good morning! Here are today's top thought leadership picks to fuel your day.",
  theme: "Today's Reading",
};

export async function generateBrewIntro(articles: BrewArticle[]): Promise<BrewIntroResult> {
  const articleList = articles
    .map((a, i) => `${i + 1}. [${a.category ?? "General"}] ${a.title}: ${a.ai_summary ?? ""}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: `You are the editor of Genpact's daily Morning Brew — a curated digest of 2-3 thought leadership articles for Genpact employees.
Write an engaging, warm, and inspiring intro paragraph (3-4 sentences) that ties the day's articles together with a unifying theme.
Also identify a 3-5 word theme title for today's edition.
Respond in JSON: { "intro": "...", "theme": "..." }`,
    messages: [{
      role: "user",
      content: `Today's articles:\n${articleList}\n\nGenerate the Morning Brew intro and theme.`,
    }],
  });

  try {
    const text = (message.content[0] as { text: string }).text;
    return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return FALLBACK;
  }
}
