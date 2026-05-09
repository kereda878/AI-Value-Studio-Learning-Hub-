"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, Clock, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { useBookmark } from "@/lib/hooks/useBookmark";
import { timeAgo, categoryColor } from "@/lib/utils";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  userId?: string;
  isSaved?: boolean;
  variant?: "default" | "featured" | "compact";
}

function readMins(text?: string | null) {
  if (!text) return null;
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export default function ArticleCard({ article, userId, isSaved = false, variant = "default" }: ArticleCardProps) {
  const { saved, saving, toggle } = useBookmark(userId, article.id, isSaved);
  const color = categoryColor(article.category);

  /* ─── Compact ─────────────────────────────────────────────── */
  if (variant === "compact") {
    return (
      <Link
        href={`/articles/${article.id}`}
        className="group flex gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
      >
        <div
          className="w-0.5 rounded-full shrink-0 mt-1 self-stretch"
          style={{ backgroundColor: color, minHeight: "36px" }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color }}>
            {article.category}
          </div>
          <h4 className="text-[#D0D0D0] text-sm font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug">
            {article.title}
          </h4>
          <div className="text-[#4A4A4A] text-xs mt-1.5 flex items-center gap-1">
            <Clock size={9} />{timeAgo(article.published_at)}
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Featured ────────────────────────────────────────────── */
  if (variant === "featured") {
    return (
      <Link
        href={`/articles/${article.id}`}
        className="group block rounded-2xl overflow-hidden border border-white/[0.07] hover:border-[#F45B69]/30 transition-all card-hover bg-[#141414]"
      >
        {article.image_url ? (
          <div className="relative h-60 overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{ color, backgroundColor: `${color}20`, borderColor: `${color}40` }}
              >
                {article.category}
              </span>
              {article.is_featured && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4956A]/20 border border-[#D4956A]/40 text-[#D4956A] flex items-center gap-1">
                  <Sparkles size={8} /> Featured
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className="h-32 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${color}12, ${color}05)` }}
          >
            <BookOpen size={32} style={{ color: `${color}40` }} />
            <div className="absolute top-3 left-3">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{ color, backgroundColor: `${color}20`, borderColor: `${color}40` }}
              >
                {article.category}
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          <h3 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-[#F45B69] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {(article.ai_summary ?? article.summary) && (
            <p className="text-[#7A7A7A] text-sm line-clamp-3 mb-4 leading-relaxed">
              {article.ai_summary ?? article.summary}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5A5A5A] text-xs">
              <Clock size={10} />
              <span>{timeAgo(article.published_at)}</span>
              {readMins(article.content ?? article.summary) && (
                <>
                  <span className="text-[#3A3A3A]">·</span>
                  <span>{readMins(article.content ?? article.summary)}</span>
                </>
              )}
              {article.source && (
                <>
                  <span className="text-[#3A3A3A]">·</span>
                  <span className="truncate max-w-[100px]">{article.source}</span>
                </>
              )}
            </div>
            {userId && (
              <button
                onClick={e => { e.preventDefault(); toggle(); }}
                disabled={saving}
                className="text-[#5A5A5A] hover:text-[#D4956A] transition-colors p-1"
              >
                {saved
                  ? <BookmarkCheck size={15} className="text-[#D4956A]" />
                  : <Bookmark size={15} />
                }
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Default ─────────────────────────────────────────────── */
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-[#F45B69]/20 bg-[#141414] hover:bg-[#161616] transition-all card-hover"
    >
      {/* Left color stripe */}
      <div
        className="w-0.5 rounded-full shrink-0 self-stretch opacity-60"
        style={{ backgroundColor: color, minHeight: "48px" }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {article.category}
          </span>
          {article.is_featured && <Sparkles size={10} className="text-[#D4956A]" />}
        </div>

        <h3 className="text-[#EEEEEE] font-semibold text-[15px] leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
          {article.title}
        </h3>

        {(article.ai_summary ?? article.summary) && (
          <p className="text-[#6A6A6A] text-sm line-clamp-2 mb-3 leading-relaxed">
            {article.ai_summary ?? article.summary}
          </p>
        )}

        <div className="flex items-center gap-3 text-[#5A5A5A] text-xs flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(article.published_at)}
          </span>
          {readMins(article.content ?? article.summary) && (
            <>
              <span className="text-[#2E2E2E]">·</span>
              <span>{readMins(article.content ?? article.summary)}</span>
            </>
          )}
          {article.source && (
            <>
              <span className="text-[#2E2E2E]">·</span>
              <span className="truncate max-w-[120px]">{article.source}</span>
            </>
          )}
          {article.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md text-[#5A5A5A]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right: image + actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {userId && (
          <button
            onClick={e => { e.preventDefault(); toggle(); }}
            disabled={saving}
            className="text-[#4A4A4A] hover:text-[#D4956A] transition-colors p-0.5"
          >
            {saved
              ? <BookmarkCheck size={15} className="text-[#D4956A]" />
              : <Bookmark size={15} />
            }
          </button>
        )}

        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-20 h-20 rounded-xl object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center border"
            style={{ backgroundColor: `${color}08`, borderColor: `${color}18` }}
          >
            <BookOpen size={22} style={{ color: `${color}50` }} />
          </div>
        )}

        {article.url && (
          <ExternalLink size={11} className="text-[#3A3A3A] group-hover:text-[#5A5A5A] transition-colors" />
        )}
      </div>
    </Link>
  );
}
