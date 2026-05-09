"use client";

import Link from "next/link";
import { ExternalLink, Bookmark, BookmarkCheck, Clock, Sparkles } from "lucide-react";
import { Badge, Tag } from "@/components/ui/Badge";
import { useBookmark } from "@/lib/hooks/useBookmark";
import { timeAgo, categoryColor } from "@/lib/utils";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  userId?: string;
  isSaved?: boolean;
  variant?: "default" | "featured" | "compact";
}

export default function ArticleCard({ article, userId, isSaved = false, variant = "default" }: ArticleCardProps) {
  const { saved, saving, toggle } = useBookmark(userId, article.id, isSaved);
  const color = categoryColor(article.category);

  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.id}`} className="group flex gap-3 p-3 rounded-xl hover:bg-[#2E2E2E] transition-colors">
        <div className="w-1 rounded-full shrink-0 mt-1" style={{ backgroundColor: color, minHeight: "40px" }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium mb-1" style={{ color }}>{article.category}</div>
          <h4 className="text-[#F0F0F0] text-sm font-medium line-clamp-2 group-hover:text-[#F45B69] transition-colors">
            {article.title}
          </h4>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/articles/${article.id}`} className="group block rounded-2xl overflow-hidden border border-[#3A3A3A] hover:border-[#F45B69]/40 transition-all bg-[#242424]">
        {article.image_url && (
          <div className="relative h-52 overflow-hidden">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#242424] to-transparent" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge label={article.category ?? "General"} color={color} />
            {article.is_featured && <Badge label="Featured" color="#D4956A" icon={<Sparkles size={9} />} />}
          </div>
          <h3 className="text-[#F0F0F0] font-semibold text-lg leading-snug mb-2 group-hover:text-[#F45B69] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-[#A0A0A0] text-sm line-clamp-3 mb-4">{article.ai_summary ?? article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#6A6A6A] text-xs">
              <Clock size={11} />{timeAgo(article.published_at)}
              {article.source && <><span className="text-[#4A4A4A]">·</span>{article.source}</>}
            </div>
            {userId && (
              <button onClick={toggle} disabled={saving} className="text-[#6A6A6A] hover:text-[#D4956A] transition-colors">
                {saved ? <BookmarkCheck size={16} className="text-[#D4956A]" /> : <Bookmark size={16} />}
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.id}`} className="group flex gap-4 p-4 rounded-xl border border-[#3A3A3A] hover:border-[#F45B69]/30 bg-[#242424] hover:bg-[#262626] transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium" style={{ color }}>{article.category}</span>
          {article.is_featured && <Sparkles size={10} className="text-[#D4956A]" />}
        </div>
        <h3 className="text-[#F0F0F0] font-semibold leading-snug mb-1.5 group-hover:text-[#F45B69] transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[#A0A0A0] text-sm line-clamp-2 mb-3">{article.ai_summary ?? article.summary}</p>
        <div className="flex items-center gap-3 text-[#6A6A6A] text-xs flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>
          {article.source && <span>{article.source}</span>}
          {article.author && <span>{article.author}</span>}
          {article.tags?.slice(0, 2).map(tag => <Tag key={tag} label={tag} />)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {userId && (
          <button onClick={toggle} disabled={saving} className="text-[#6A6A6A] hover:text-[#D4956A] transition-colors">
            {saved ? <BookmarkCheck size={15} className="text-[#D4956A]" /> : <Bookmark size={15} />}
          </button>
        )}
        {article.url && <ExternalLink size={13} className="text-[#4A4A4A] group-hover:text-[#6A6A6A] transition-colors" />}
      </div>
    </Link>
  );
}
