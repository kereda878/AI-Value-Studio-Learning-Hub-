"use client";

import { useState } from "react";
import {
  Link2, Loader2, X, CheckCircle2, Plus, Send,
  Image as ImageIcon, Sparkles, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { CATEGORIES } from "@/lib/constants";

interface FetchedMeta {
  title: string | null;
  description: string | null;
  image: string | null;
  source: string | null;
  author: string | null;
  body: string | null;
  url: string;
}

type Mode = "idle" | "fetching" | "preview" | "saving" | "done" | "error";
type SummaryMode = "idle" | "streaming" | "done" | "error";

export default function AdminURLSubmit() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [meta, setMeta] = useState<FetchedMeta | null>(null);
  const [category, setCategory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  // AI summary state
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("idle");
  const [aiSummary, setAiSummary] = useState("");
  const [aiTags, setAiTags] = useState<string[]>([]);

  async function startSummaryStream(
    fetchedMeta: FetchedMeta,
    bypassCache = false
  ) {
    setSummaryMode("streaming");
    setAiSummary("");
    setAiTags([]);

    try {
      const res = await fetch("/api/articles/summarize-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fetchedMeta.title,
          body: fetchedMeta.body,
          url: fetchedMeta.url,
          bypassCache,
        }),
      });

      if (!res.ok || !res.body) {
        setSummaryMode("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const stripped = line.replace(/^data: /, "").trim();
          if (!stripped) continue;
          try {
            const event = JSON.parse(stripped) as
              | { type: "chunk"; text: string }
              | { type: "tags"; tags: string[] }
              | { type: "done" }
              | { type: "error"; message: string };

            if (event.type === "chunk") {
              setAiSummary((prev) => prev + event.text);
            } else if (event.type === "tags") {
              setAiTags(event.tags);
            } else if (event.type === "done") {
              setSummaryMode("done");
            } else if (event.type === "error") {
              setSummaryMode("error");
            }
          } catch {
            // ignore malformed events
          }
        }
      }
    } catch {
      setSummaryMode("error");
    }
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setMode("fetching");
    setErrorMsg("");
    setSummaryMode("idle");
    setAiSummary("");
    setAiTags([]);

    try {
      const res = await fetch("/api/articles/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not fetch URL");
      setMeta(data);
      setMode("preview");
      // Kick off streaming summary immediately
      startSummaryStream(data);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Could not fetch URL");
      setMode("error");
    }
  }

  async function handleSave(toQueue: boolean) {
    if (!meta?.title) return;
    setMode("saving");
    setPublishNow(!toQueue);
    try {
      const endpoint = toQueue ? "/api/articles/queue" : "/api/articles";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meta.title,
          url: meta.url,
          summary: meta.description,
          source: meta.source,
          author: meta.author,
          image_url: meta.image,
          category: category || undefined,
          ai_summary: aiSummary || undefined,
          ai_tags: aiTags.length ? aiTags : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      setMode("done");
      setTimeout(reset, 3000);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
      setMode("error");
    }
  }

  function reset() {
    setUrl("");
    setMeta(null);
    setCategory("");
    setMode("idle");
    setErrorMsg("");
    setSummaryMode("idle");
    setAiSummary("");
    setAiTags([]);
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/[0.07] p-5">
      {mode === "done" ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 size={15} />
          {publishNow ? "Article published!" : "Added to review queue."}
        </div>
      ) : (
        <>
          {/* URL input row */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://hbr.org/article-you-want-to-share..."
                disabled={mode === "fetching" || mode === "preview" || mode === "saving"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[#D0D0D0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#F45B69]/40 disabled:opacity-50 transition-colors"
              />
            </div>
            {mode === "preview" || mode === "saving" ? (
              <button
                onClick={reset}
                className="p-2.5 rounded-xl text-[#5A5A5A] hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X size={16} />
              </button>
            ) : (
              <Button
                onClick={handleFetch}
                disabled={!url.trim() || mode === "fetching"}
                size="sm"
                className="shrink-0 px-4"
              >
                {mode === "fetching" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Fetch"
                )}
              </Button>
            )}
          </div>

          {mode === "error" && (
            <p className="text-[#F45B69] text-xs mb-3 px-1">{errorMsg}</p>
          )}

          {/* Preview card */}
          {meta && (mode === "preview" || mode === "saving") && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-3">
              {/* Article metadata row */}
              <div className="flex gap-3 p-3">
                {meta.image ? (
                  <img
                    src={meta.image}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <ImageIcon size={20} className="text-[#3A3A3A]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1">
                    {meta.title ?? "No title found"}
                  </p>
                  <p className="text-[#6A6A6A] text-xs line-clamp-2 leading-relaxed mb-1.5">
                    {meta.description ?? "No description available"}
                  </p>
                  <div className="flex items-center gap-2 text-[#4A4A4A] text-xs">
                    {meta.source && (
                      <span className="text-[#7A7A7A]">{meta.source}</span>
                    )}
                    {meta.author && (
                      <>
                        <span>·</span>
                        <span>{meta.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Summary section */}
              <div className="border-t border-white/[0.06] mx-3" />
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#D4956A]" />
                    <span className="text-[#D4956A] text-xs font-semibold uppercase tracking-wider">
                      AI Summary
                    </span>
                    {summaryMode === "streaming" && (
                      <Loader2 size={10} className="animate-spin text-[#D4956A]" />
                    )}
                  </div>
                  {(summaryMode === "done" || summaryMode === "error") && meta && (
                    <button
                      onClick={() => startSummaryStream(meta, true)}
                      className="flex items-center gap-1 text-[#5A5A5A] hover:text-[#D4956A] text-xs transition-colors"
                    >
                      <RefreshCw size={10} /> Regenerate
                    </button>
                  )}
                </div>

                {summaryMode === "idle" && (
                  <p className="text-[#4A4A4A] text-xs italic">Starting summary…</p>
                )}
                {summaryMode === "error" && (
                  <p className="text-[#F45B69] text-xs">Could not generate summary.</p>
                )}
                {(summaryMode === "streaming" || summaryMode === "done") && (
                  <>
                    <p className="text-[#B8976A] text-xs leading-relaxed">
                      {aiSummary}
                      {summaryMode === "streaming" && (
                        <span className="inline-block w-0.5 h-3 bg-[#D4956A] ml-0.5 animate-pulse align-middle" />
                      )}
                    </p>
                    {aiTags.length > 0 && summaryMode === "done" && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {aiTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-[#D4956A]/10 border border-[#D4956A]/20 text-[#C8946A] px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Category + action buttons */}
              <div className="border-t border-white/[0.06] mx-3" />
              <div className="px-3 py-3">
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category (optional)</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-2 px-3 pb-3">
                <Button
                  onClick={() => handleSave(true)}
                  disabled={mode === "saving"}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  <Plus size={13} /> Add to Queue
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={mode === "saving"}
                  size="sm"
                  className="flex-1"
                >
                  {mode === "saving" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Publish Now
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
