import { getServerUser } from "@/lib/auth";
import { getArticles, getTodaysBrew, getUserReadIds, getUserSaveIds } from "@/lib/db";
import MorningBrewBanner from "@/components/brew/MorningBrewBanner";
import ArticleCard from "@/components/articles/ArticleCard";
import RecommendedSidebar from "@/components/articles/RecommendedSidebar";
import { Coffee, TrendingUp, Sparkles } from "lucide-react";
import { format } from "date-fns";

export const revalidate = 300;

export default async function HomePage() {
  const user = await getServerUser();

  const [brew, readIds, savedIds] = await Promise.all([
    getTodaysBrew(),
    getUserReadIds(user!.id),
    getUserSaveIds(user!.id),
  ]);

  const brewIds = brew?.articles?.map(a => a.id) ?? [];
  const recentArticles = await getArticles({ excludeIds: brewIds, limit: 12 });

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#D4956A]/15 border border-[#D4956A]/30 flex items-center justify-center">
              <Coffee size={16} className="text-[#D4956A]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Morning Brew</h1>
              <p className="text-[#6A6A6A] text-xs">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </div>
            {brew?.theme && (
              <span className="ml-auto text-xs text-[#D4956A] bg-[#D4956A]/10 border border-[#D4956A]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles size={10} /> {brew.theme}
              </span>
            )}
          </div>

          {brew && (brew.articles?.length ?? 0) > 0 ? (
            <MorningBrewBanner brew={brew} articles={brew.articles!} userId={user!.id} savedIds={savedIds} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#3A3A3A] p-8 text-center">
              <Coffee size={28} className="text-[#4A4A4A] mx-auto mb-3" />
              <p className="text-[#6A6A6A] text-sm">Today&apos;s Morning Brew hasn&apos;t been published yet.</p>
              <p className="text-[#4A4A4A] text-xs mt-1">Check back soon or browse all articles below.</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#A0A0A0]" />
            <h2 className="text-white font-semibold">Recent Articles</h2>
            <span className="text-[#6A6A6A] text-xs ml-auto">{recentArticles.length} articles</span>
          </div>
          {recentArticles.length > 0 ? (
            <div className="space-y-3">
              {recentArticles.map(article => (
                <ArticleCard key={article.id} article={article} userId={user!.id} isSaved={savedIds.has(article.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#3A3A3A] p-8 text-center">
              <p className="text-[#6A6A6A] text-sm">No articles yet.</p>
            </div>
          )}
        </section>
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <RecommendedSidebar userId={user!.id} readIds={readIds} />
      </aside>
    </div>
  );
}
