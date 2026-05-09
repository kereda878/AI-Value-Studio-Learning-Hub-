"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, Loader2, Clock, Sparkles, ExternalLink, InboxIcon } from "lucide-react";
import { categoryColor } from "@/lib/utils";
import type { Article } from "@/lib/types";

export default function AdminQueue() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/articles/queue");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadQueue(); }, []);

  async function approve(id: string) {
    setActing(id);
    try {
      await fetch(`/api/articles/queue/${id}`, { method: "POST" });
      setArticles(prev => prev.filter(a => a.id !== id));
    } finally {
      setActing(null);
    }
  }

  async function dismiss(id: string) {
    setActing(id);
    try {
      await fetch(`/api/articles/queue/${id}`, { method: "DELETE" });
      setArticles(prev => prev.filter(a => a.id !== id));
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="text-[#3A3A3A] animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-white/[0.06] rounded-2xl">
        <InboxIcon size={28} className="text-[#2E2E2E] mx-auto mb-2" />
        <p className="text-[#5A5A5A] text-sm">Queue is empty</p>
        <p className="text-[#3A3A3A] text-xs mt-1">Articles added via URL or AI suggestions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {articles.map(article => {
        const color = categoryColor(article.category);
        const isActing = acting === article.id;

        return (
          <div
            key={article.id}
            className="flex gap-3 p-4 rounded-2xl border border-white/[0.06] bg-[#141414] items-start"
          >
            {/* Color stripe */}
            <div
              className="w-0.5 rounded-full shrink-0 self-stretch opacity-70"
              style={{ backgroundColor: color, minHeight: "48px" }}
            />

            {/* Thumbnail */}
            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 opacity-80"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {article.category && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{ color, backgroundColor: `${color}18` }}
                  >
                    {article.category}
                  </span>
                )}
                {article.suggested_by_ai && (
                  <span className="text-[10px] text-[#D4956A] flex items-center gap-0.5 bg-[#D4956A]/10 px-1.5 py-0.5 rounded-md border border-[#D4956A]/20">
                    <Sparkles size={8} /> AI
                  </span>
                )}
              </div>

              <p className="text-[#E0E0E0] font-semibold text-sm leading-snug line-clamp-2 mb-1">
                {article.title}
              </p>

              <div className="flex items-center gap-2 text-[#4A4A4A] text-xs">
                {article.source && <span className="text-[#6A6A6A]">{article.source}</span>}
                {article.source && <span>·</span>}
                <Clock size={9} />
                <span>Pending review</span>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#A0A0A0] transition-colors ml-1"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => dismiss(article.id)}
                disabled={isActing}
                title="Dismiss"
                className="p-2 rounded-xl text-[#4A4A4A] hover:text-[#F45B69] hover:bg-[#F45B69]/10 transition-colors disabled:opacity-40"
              >
                {isActing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
              <button
                onClick={() => approve(article.id)}
                disabled={isActing}
                title="Approve & Publish"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-40"
              >
                {isActing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Approve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
