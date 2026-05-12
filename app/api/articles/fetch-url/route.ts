import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";

interface UrlResult {
  title: string | null;
  description: string | null;
  image: string | null;
  source: string;
  author: string | null;
  body: string;
  url: string;
}

// 24-hour server-side cache keyed on URL
const urlCache = new Map<string, { data: UrlResult; expiresAt: number }>();

function extractBodyText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

function extractMeta(html: string) {
  const og = (prop: string) =>
    html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, "i"))?.[1] ??
    null;

  const meta = (name: string) =>
    html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"))?.[1] ??
    null;

  const title =
    og("title") ??
    html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ??
    null;

  const description = og("description") ?? meta("description") ?? null;
  const image = og("image") ?? null;
  const siteName = og("site_name") ?? null;
  const author = meta("author") ?? og("article:author") ?? null;

  return { title, description, image, siteName, author };
}

export async function POST(request: Request) {
  return withAdmin(async () => {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    // Return cached result if fresh
    const cached = urlCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Genpact-Bookshelf/1.0 (+https://github.com/kereda878/Genpact-Bookshelf)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 422 });
      }

      const html = await res.text();
      const meta = extractMeta(html);
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      const body = extractBodyText(html);

      const result = {
        title: meta.title,
        description: meta.description,
        image: meta.image,
        source: meta.siteName ?? hostname,
        author: meta.author,
        body,
        url,
      };

      urlCache.set(url, { data: result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });

      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: "Could not fetch that URL" }, { status: 422 });
    }
  });
}
