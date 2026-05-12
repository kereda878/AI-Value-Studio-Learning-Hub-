import { withAdmin } from "@/lib/supabase/guard";
import { isDemoMode } from "@/lib/demo";
import { streamSummarize, suggestTags } from "@/lib/ai/summarize";

// 24-hour summary cache keyed on URL
const summaryCache = new Map<string, { summary: string; tags: string[]; expiresAt: number }>();

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

const DEMO_SUMMARY =
  "This article explores key insights relevant to Genpact's focus areas in AI, operations, and enterprise transformation, " +
  "offering practical perspectives for business leaders navigating digital change. " +
  "The findings highlight how organizations can accelerate value creation through targeted capability building.";
const DEMO_TAGS = ["Enterprise AI", "Digital Transformation", "Strategy"];

export async function POST(request: Request): Promise<Response> {
  return withAdmin(async () => {
    const { title, body, url, bypassCache } = await request.json();

    // ── Cache hit ──────────────────────────────────────────────────────────
    if (!bypassCache && url) {
      const cached = summaryCache.get(url);
      if (cached && cached.expiresAt > Date.now()) {
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "chunk", text: cached.summary })}\n\n`));
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "tags", tags: cached.tags })}\n\n`));
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }
    }

    // ── Demo mode — simulate streaming word-by-word ────────────────────────
    if (isDemoMode()) {
      const words = DEMO_SUMMARY.split(" ");
      const stream = new ReadableStream({
        async start(controller) {
          for (const word of words) {
            controller.enqueue(sse({ type: "chunk", text: word + " " }));
            await new Promise((r) => setTimeout(r, 45));
          }
          controller.enqueue(sse({ type: "tags", tags: DEMO_TAGS }));
          controller.enqueue(sse({ type: "done" }));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // ── Real Claude streaming ──────────────────────────────────────────────
    let fullSummary = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the summary token-by-token
          for await (const chunk of streamSummarize(title, body ?? "", url)) {
            fullSummary += chunk;
            controller.enqueue(sse({ type: "chunk", text: chunk }));
          }

          // Get tags (fast, non-streaming)
          const tags = await suggestTags(title, fullSummary);
          controller.enqueue(sse({ type: "tags", tags }));
          controller.enqueue(sse({ type: "done" }));

          // Cache for 24h
          if (url) {
            summaryCache.set(url, {
              summary: fullSummary,
              tags,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            });
          }
        } catch (err) {
          controller.enqueue(sse({ type: "error", message: String(err) }));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  });
}
