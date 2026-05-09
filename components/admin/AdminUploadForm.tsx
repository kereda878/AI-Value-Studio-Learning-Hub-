"use client";

import { useState } from "react";
import { Upload, Link2, FileText, Sparkles, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { CATEGORIES } from "@/lib/constants";

type Tab = "url" | "manual";

interface FormState {
  title: string; url: string; content: string; summary: string;
  ai_summary: string; category: string; tags: string; source: string;
  author: string; image_url: string; is_featured: boolean;
}

const EMPTY: FormState = {
  title: "", url: "", content: "", summary: "", ai_summary: "",
  category: "", tags: "", source: "", author: "", image_url: "", is_featured: false,
};

export default function AdminUploadForm() {
  const [tab, setTab] = useState<Tab>("url");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  async function generateAI() {
    if (!form.title && !form.content && !form.url) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content, url: form.url }),
      });
      const data = await res.json();
      if (data.summary) set("ai_summary", data.summary);
      if (data.tags?.length) set("tags", data.tags.join(", "));
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setSuccess(true);
      setForm(EMPTY);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#242424] rounded-xl border border-[#3A3A3A] p-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-[#1A1A1A] rounded-lg p-1">
        {(["url", "manual"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-[#F45B69]/10 text-[#F45B69]" : "text-[#6A6A6A] hover:text-[#A0A0A0]"}`}
          >
            {t === "url" ? <><Link2 size={11} />From URL</> : <><FileText size={11} />Manual Entry</>}
          </button>
        ))}
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2.5">
          <CheckCircle2 size={15} /> Article published successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#F45B69] bg-[#F45B69]/10 border border-[#F45B69]/20 rounded-lg px-3 py-2.5">
          <X size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Title *" required value={form.title} onChange={e => set("title", e.target.value)} placeholder="Article title" />

        {tab === "url"
          ? <Input label="Article URL" value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." type="url" />
          : <Textarea label="Content" value={form.content} onChange={e => set("content", e.target.value)} placeholder="Paste article content..." rows={5} />
        }

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Source" value={form.source} onChange={e => set("source", e.target.value)} placeholder="e.g. HBR" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Author" value={form.author} onChange={e => set("author", e.target.value)} placeholder="Author name" />
          <Input label="Image URL" value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[#A0A0A0] text-xs font-medium uppercase tracking-wider">AI Summary</label>
            <button type="button" onClick={generateAI} disabled={aiLoading || (!form.title && !form.content && !form.url)}
              className="flex items-center gap-1 text-xs text-[#D4956A] hover:opacity-80 disabled:opacity-40 transition-opacity"
            >
              <Sparkles size={11} className={aiLoading ? "animate-pulse" : ""} />
              {aiLoading ? "Generating..." : "Generate with AI"}
            </button>
          </div>
          <Textarea value={form.ai_summary} onChange={e => set("ai_summary", e.target.value)} placeholder="AI summary will appear here..." rows={3} />
        </div>

        <Input label="Tags (comma-separated)" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="AI, automation, leadership..." />

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} className="rounded accent-[#F45B69]" />
          <span className="text-[#A0A0A0] text-xs">Mark as featured article</span>
        </label>

        <Button type="submit" loading={loading} className="w-full mt-2">
          <Upload size={14} /> {loading ? "Publishing..." : "Publish Article"}
        </Button>
      </form>
    </div>
  );
}
