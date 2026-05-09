import { createClient } from "@/lib/supabase/server";
import { getArticleById, isSaved } from "@/lib/db";
import { notFound } from "next/navigation";
import { ExternalLink, Clock, Tag, ArrowLeft, Sparkles, Eye } from "lucide-react";
import { formatDate, categoryColor, categoryChipStyle } from "@/lib/utils";
import BookmarkButton from "@/components/articles/BookmarkButton";
import TrackRead from "@/components/articles/TrackRead";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [article, saved] = await Promise.all([
    getArticleById(id),
    isSaved(user!.id, id),
  ]);

  if (!article) notFound();

  const color = categoryColor(article.category);
  const allTags = [...new Set([...(article.tags ?? []), ...(article.ai_tags ?? [])])];

  return (
    <>
      <TrackRead userId={user!.id} articleId={article.id} />

      <div className="max-w-3xl mx-auto">
        <Link href="/articles" className="inline-flex items-center gap-1.5 text-[#6A6A6A] hover:text-[#F45B69] text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to articles
        </Link>

        {article.image_url && (
          <div className="rounded-2xl overflow-hidden mb-6 h-64">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={categoryChipStyle(article.category)}>
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-[#6A6A6A] text-xs">
            <Clock size={11} /> {formatDate(article.published_at)}
          </span>
          {article.source && <span className="text-[#6A6A6A] text-xs">{article.source}</span>}
          {article.author && <span className="text-[#6A6A6A] text-xs">by {article.author}</span>}
          <span className="flex items-center gap-1 text-[#6A6A6A] text-xs ml-auto">
            <Eye size={11} /> {article.read_count} reads
          </span>
        </div>

        <h1 className="text-white font-bold text-2xl sm:text-3xl leading-tight mb-4">{article.title}</h1>

        {/* AI Summary */}
        {article.ai_summary && (
          <div className="rounded-xl bg-[#242424] border border-[#D4956A]/20 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[#D4956A]" />
              <span className="text-[#D4956A] text-xs font-semibold uppercase tracking-wider">AI Summary</span>
            </div>
            <p className="text-[#C0A880] text-sm leading-relaxed">{article.ai_summary}</p>
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <Tag size={12} className="text-[#6A6A6A]" />
            {allTags.map(tag => (
              <span key={tag} className="text-xs bg-[#2E2E2E] border border-[#3A3A3A] text-[#A0A0A0] px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        {article.content && (
          <div className="mb-8 space-y-3">
            {article.content.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-[#C0C0C0] text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-[#3A3A3A]">
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#F45B69] hover:bg-[#e04a57] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <ExternalLink size={14} /> Read Full Article
            </a>
          )}
          <BookmarkButton userId={user!.id} articleId={article.id} initialSaved={saved} />
        </div>
      </div>
    </>
  );
}
