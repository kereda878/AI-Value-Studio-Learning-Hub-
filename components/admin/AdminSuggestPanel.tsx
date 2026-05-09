"use client";

import { useState } from "react";
import { Sparkles, Loader2, Search, Plus, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { categoryColor } from "@/lib/utils";
import type { ArticleSuggestion } from "@/lib/types";

interface Props {
  existingCategories: string[];
}

export default function AdminSuggestPanel({ existingCategories }: Props) {
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [addingUrl, setAddingUrl] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");
  const [queueLoading, setQueueLoading] = useState<string | null>(null);
  const [queued, setQueued] = useState<Set<string>>(new Set());

  async function getSuggestions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/suggest-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingCategories }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get suggestions");
      setSuggestions(data.suggestions ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function addToQueue(suggestion: ArticleSuggestion, url: string) {
    if (!url.trim()) return;
    setQueueLoading(suggestion.id);
    try {
      const res = await fetch("/api/articles/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          url: url.trim(),
          summary: suggestion.summary,
          category: suggestion.category,
          source: suggestion.source,
          suggested_by_ai: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to queue");
      setQueued(prev => new Set([...prev, suggestion.id]));
      setAddingUrl(null);
      setPastedUrl("");
    } finally {
      setQueueLoading(null);
    }
  }

  const visible = suggestions.filter(s => !dismissed.has(s.id));

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/[0.07] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D4956A]/15 border border-[#D4956A]/25 flex items-center justify-center">
            <Sparkles size={13} className="text-[#D4956A]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Article Ideas</h3>
            <p className="text-[#5A5A5A] text-xs">Claude suggests topics tailored to Genpact's focus areas</p>
          </div>
        </div>
        <Button onClick={getSuggestions} disabled={loading} variant="ghost" size="sm">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {loading ? "Thinking..." : suggestions.length ? "Refresh" : "Get Suggestions"}
        </Button>
      </div>

      {error && <p className="text-[#F45B69] text-xs mb-3">{error}</p>}

      {suggestions.length === 0 && !loading && (
        <div className="text-center py-8 border border-dashed border-white/[0.06] rounded-xl">
          <Sparkles size={24} className="text-[#2E2E2E] mx-auto mb-2" />
          <p className="text-[#5A5A5A] text-sm">Click "Get Suggestions" and Claude will recommend articles to publish this week.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="space-y-2">
          {visible.map(s => {
            const color = categoryColor(s.category);
            const isQueued = queued.has(s.id);
            const isAddingThis = addingUrl === s.id;

            return (
              <div
                key={s.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all"
              >
                <div className="flex gap-3">
                  {/* Color stripe */}
                  <div className="w-0.5 rounded-full shrink-0 self-stretch" style={{ backgroundColor: color, minHeight: "36px" }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-block mb-1.5"
                          style={{ color, backgroundColor: `${color}18` }}
                        >
                          {s.category}
                        </span>
                        <p className="text-[#E0E0E0] font-semibold text-sm leading-snug">{s.title}</p>
                        <p className="text-[#5A5A5A] text-xs mt-0.5">{s.source}</p>
                      </div>
                      {!isQueued && (
                        <button
                          onClick={() => setDismissed(prev => new Set([...prev, s.id]))}
                          className="text-[#3A3A3A] hover:text-[#6A6A6A] transition-colors shrink-0 mt-0.5"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <p className="text-[#6A6A6A] text-xs leading-relaxed mb-2">{s.summary}</p>

                    {isQueued ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> Added to queue
                      </span>
                    ) : isAddingThis ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={pastedUrl}
                          onChange={e => setPastedUrl(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addToQueue(s, pastedUrl)}
                          placeholder="Paste the article URL..."
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[#D0D0D0] text-xs placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#D4956A]/40"
                        />
                        <Button
                          onClick={() => addToQueue(s, pastedUrl)}
                          disabled={!pastedUrl.trim() || queueLoading === s.id}
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                        >
                          {queueLoading === s.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        </Button>
                        <button onClick={() => { setAddingUrl(null); setPastedUrl(""); }} className="text-[#4A4A4A] hover:text-white transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(s.search_hint)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#5A5A5A] hover:text-[#A0A0A0] transition-colors"
                        >
                          <Search size={11} /> Find article
                          <ChevronRight size={10} />
                        </a>
                        <span className="text-[#2E2E2E]">·</span>
                        <button
                          onClick={() => { setAddingUrl(s.id); setPastedUrl(""); }}
                          className="flex items-center gap-1 text-xs text-[#D4956A] hover:text-[#E8A97C] transition-colors"
                        >
                          <Plus size={11} /> Add to queue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
