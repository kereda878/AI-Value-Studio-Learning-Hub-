import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/supabase/guard";

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

      // Derive source from hostname
      const hostname = new URL(url).hostname.replace(/^www\./, "");

      return NextResponse.json({
        title: meta.title,
        description: meta.description,
        image: meta.image,
        source: meta.siteName ?? hostname,
        author: meta.author,
        url,
      });
    } catch {
      return NextResponse.json({ error: "Could not fetch that URL" }, { status: 422 });
    }
  });
}
