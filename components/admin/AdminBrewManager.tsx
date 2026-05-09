"use client";

import { useState } from "react";
import { Coffee, Sparkles, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { format } from "date-fns";
import type { Article } from "@/lib/types";

interface ExistingBrew {
  id: string; article_ids: string[]; ai_intro: string | null; theme: string | null;
}

interface AdminBrewManagerProps {
  articles: Article[];
  existingBrew: ExistingBrew | null;
}

export default function AdminBrewManager({ articles, existingBrew }: AdminBrewManagerProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedIds, setSelectedIds] = useState<string[]>(existingBrew?.article_ids ?? []);
  const [aiIntro, setAiIntro] = useState(existingBrew?.ai_intro ?? "");
  const [theme, setTheme] = useState(existingBrew?.theme ?? "");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }

  async function generateIntro() {
    const selected = articles.filter(a => selectedIds.includes(a.id));
    if (!selected.length) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/morning-brew-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: selected.map(a => ({ title: a.title, category: a.category, ai_summary: a.ai_summary })) }),
      });
      const data = await res.json();
      if (data.intro) setAiIntro(data.intro);
      if (data.theme) setTheme(data.theme);
    } finally {
      setAiLoading(false);
    }
  }

  async function publish() {
    if (!selectedIds.length) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/morning-brew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brew_date: today, article_ids: selectedIds, ai_intro: aiIntro, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#242424] rounded-xl border border-[#3A3A3A] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[#A0A0A0] text-xs">{format(new Date(), "EEEE, MMMM d")} · Select 2-3 articles</p>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${existingBrew ? "text-green-400 border-green-400/25 bg-green-400/10" : "text-[#D4956A] border-[#D4956A]/25 bg-[#D4956A]/10"}`}>
          {existingBrew ? "Published" : "Pending"}
        </span>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2.5">
          <CheckCircle2 size={14} /> Morning Brew published!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-[#F45B69] bg-[#F45B69]/10 border border-[#F45B69]/20 rounded-lg px-3 py-2.5">
          <X size={14} /> {error}
        </div>
      )}

      {/* Article picker */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {articles.length === 0 && <p className="text-center text-[#6A6A6A] text-xs py-4">Upload articles first</p>}
        {articles.map(article => {
          const isSelected = selectedIds.includes(article.id);
          return (
            <button key={article.id} onClick={() => toggle(article.id)}
              className={`w-full text-left flex items-start gap-2.5 p-3 rounded-lg border transition-all text-sm ${isSelected ? "bg-[#D4956A]/10 border-[#D4956A]/30" : "bg-[#1A1A1A] border-[#3A3A3A] hover:border-[#4A4A4A]"}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? "bg-[#D4956A] border-[#D4956A]" : "border-[#4A4A4A]"}`}>
                {isSelected && <CheckCircle2 size={10} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-[#F0F0F0] text-xs font-medium line-clamp-1">{article.title}</p>
                <p className="text-[#6A6A6A] text-xs mt-0.5">{article.category}</p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#6A6A6A]">{selectedIds.length}/3 selected</p>

      {/* AI Intro */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[#A0A0A0] text-xs font-medium uppercase tracking-wider">AI Intro</label>
          <button onClick={generateIntro} disabled={aiLoading || !selectedIds.length}
            className="flex items-center gap-1 text-xs text-[#D4956A] hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            <Sparkles size={11} className={aiLoading ? "animate-pulse" : ""} />
            {aiLoading ? "Generating..." : "Generate"}
          </button>
        </div>
        <Textarea value={aiIntro} onChange={e => setAiIntro(e.target.value)} placeholder="AI intro will appear here..." rows={3} />
      </div>

      <Input label="Today's Theme" value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. The Future of Work" />

      <Button variant="secondary" loading={loading} disabled={!selectedIds.length} onClick={publish} className="w-full">
        <Coffee size={14} /> {existingBrew ? "Update Today's Brew" : "Publish Morning Brew"}
      </Button>
    </div>
  );
}
