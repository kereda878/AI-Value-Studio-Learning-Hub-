"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "./ArticleCard";
import { Sparkles, Bookmark, TrendingUp, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/lib/types";

interface RecommendedSidebarProps {
  userId: string;
  readIds: string[];
}

export default function RecommendedSidebar({ userId, readIds }: RecommendedSidebarProps) {
  const supabase = createClient();
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recommended" | "saved">("recommended");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [recRes, saves] = await Promise.all([
          fetch("/api/ai/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ readIds }),
          }),
          supabase.from("user_saves").select("article_id").eq("user_id", userId),
        ]);

        if (recRes.ok) {
          const data = await recRes.json();
          setRecommendations(data.articles ?? []);
        }

        if (saves.data?.length) {
          const { data: articles } = await supabase
            .from("articles").select("*")
            .in("id", saves.data.map(s => s.article_id))
            .order("published_at", { ascending: false }).limit(5);
          setSavedArticles(articles ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const tabs = [
    { id: "recommended" as const, label: "For You", icon: Sparkles },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
  ];

  const activeList = tab === "recommended" ? recommendations : savedArticles;
  const emptyMsg = tab === "recommended"
    ? "Read a few articles and AI will personalize your feed."
    : "Bookmark articles to save them here.";

  return (
    <div className="sticky top-20">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-[#242424] rounded-xl p-1 border border-[#3A3A3A]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? "bg-[#F45B69]/10 text-[#F45B69]" : "text-[#6A6A6A] hover:text-[#A0A0A0]"}`}
          >
            <t.icon size={11} />{t.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="text-[#4A4A4A] animate-spin" />
          </div>
        ) : activeList.length > 0 ? (
          activeList.map(a => (
            <ArticleCard key={a.id} article={a} userId={userId} isSaved={tab === "saved"} variant="compact" />
          ))
        ) : (
          <p className="text-center text-[#6A6A6A] text-xs py-6">{emptyMsg}</p>
        )}
      </div>

      {/* Topic browser */}
      <div className="mt-6 pt-5 border-t border-[#3A3A3A]">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={12} className="text-[#6A6A6A]" />
          <span className="text-[#6A6A6A] text-xs font-medium uppercase tracking-wider">Browse Topics</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.slice(0, 6).map(topic => (
            <Link key={topic} href={`/articles?category=${encodeURIComponent(topic)}`}
              className="text-xs text-[#A0A0A0] bg-[#2E2E2E] hover:bg-[#383838] border border-[#3A3A3A] px-2.5 py-1 rounded-lg transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
