import ArticleCard from "@/components/articles/ArticleCard";
import { Sparkles } from "lucide-react";
import type { Article, MorningBrew } from "@/lib/types";

interface MorningBrewBannerProps {
  brew: MorningBrew;
  articles: Article[];
  userId: string;
  savedIds: Set<string>;
}

export default function MorningBrewBanner({ brew, articles, userId, savedIds }: MorningBrewBannerProps) {
  const [featured, ...rest] = articles;

  return (
    <div className="rounded-2xl border border-[#D4956A]/20 bg-gradient-to-br from-[#242424] to-[#1E1C18] overflow-hidden">
      {brew.ai_intro && (
        <div className="px-5 py-4 border-b border-[#D4956A]/15">
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#D4956A]/15 border border-[#D4956A]/25 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={11} className="text-[#D4956A]" />
            </div>
            <p className="text-[#C0A880] text-sm leading-relaxed italic">{brew.ai_intro}</p>
          </div>
        </div>
      )}
      <div className="p-5 space-y-4">
        {featured && (
          <ArticleCard article={featured} userId={userId} isSaved={savedIds.has(featured.id)} variant="featured" />
        )}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {rest.map(a => (
              <ArticleCard key={a.id} article={a} userId={userId} isSaved={savedIds.has(a.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
