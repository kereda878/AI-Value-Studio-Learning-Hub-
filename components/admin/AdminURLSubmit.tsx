"use client";

import { useState } from "react";
import { Link2, Loader2, X, CheckCircle2, Plus, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { CATEGORIES } from "@/lib/constants";

interface FetchedMeta {
  title: string | null;
  description: string | null;
  image: string | null;
  source: string | null;
  author: string | null;
  url: string;
}

type Mode = "idle" | "fetching" | "preview" | "saving" | "done" | "error";

export default function AdminURLSubmit() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [meta, setMeta] = useState<FetchedMeta | null>(null);
  const [category, setCategory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  async function handleFetch() {
    if (!url.trim()) return;
    setMode("fetching");
    setErrorMsg("");
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
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/[0.07] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#F45B69]/15 border border-[#F45B69]/25 flex items-center justify-center">
          <Link2 size={13} className="text-[#F45B69]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Quick Publish from URL</h3>
          <p className="text-[#5A5A5A] text-xs">Paste any article link — we'll fetch the details automatically</p>
        </div>
      </div>

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
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleFetch()}
                placeholder="https://hbr.org/article-you-want-to-share..."
                disabled={mode === "fetching" || mode === "preview" || mode === "saving"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[#D0D0D0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#F45B69]/40 disabled:opacity-50 transition-colors"
              />
            </div>
            {mode === "preview" || mode === "saving" ? (
              <button onClick={reset} className="p-2.5 rounded-xl text-[#5A5A5A] hover:text-white hover:bg-white/[0.05] transition-colors">
                <X size={16} />
              </button>
            ) : (
              <Button onClick={handleFetch} disabled={!url.trim() || mode === "fetching"} size="sm" className="shrink-0 px-4">
                {mode === "fetching" ? <Loader2 size={14} className="animate-spin" /> : "Fetch"}
              </Button>
            )}
          </div>

          {mode === "error" && (
            <p className="text-[#F45B69] text-xs mb-3 px-1">{errorMsg}</p>
          )}

          {/* Preview card */}
          {meta && (mode === "preview" || mode === "saving") && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-3">
              <div className="flex gap-3 p-3">
                {meta.image ? (
                  <img src={meta.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
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
                    {meta.source && <span className="text-[#7A7A7A]">{meta.source}</span>}
                    {meta.author && <><span>·</span><span>{meta.author}</span></>}
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <Select
                  label="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select category (optional)</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  {mode === "saving"
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Send size={13} />}
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
