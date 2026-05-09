import { createClient } from "@/lib/supabase/server";
import { getArticles, getArticleCategoryCounts, getUserSaveIds } from "@/lib/db";
import ArticleCard from "@/components/articles/ArticleCard";
import CategoryFilter from "@/components/articles/CategoryFilter";
import { Search, BookOpen } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { q, category } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [articles, counts, savedIds] = await Promise.all([
    getArticles({ q, category, limit: 50 }),
    getArticleCategoryCounts(),
    getUserSaveIds(user!.id),
  ]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#F45B69]/15 border border-[#F45B69]/30 flex items-center justify-center">
          <BookOpen size={16} className="text-[#F45B69]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Article Library</h1>
          <p className="text-[#6A6A6A] text-xs">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
            {q ? ` for "${q}"` : ""}
            {category ? ` in ${category}` : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <CategoryFilter counts={counts} activeCategory={category} />
        </aside>

        <div className="flex-1 min-w-0">
          <form action="/articles" className="mb-5">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <input name="q" defaultValue={q} placeholder="Search by title, tag, or topic..."
                className="w-full bg-[#242424] border border-[#3A3A3A] rounded-xl pl-9 pr-4 py-2.5 text-[#F0F0F0] text-sm placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#F45B69]/50"
              />
            </div>
          </form>

          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} userId={user!.id} isSaved={savedIds.has(article.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#3A3A3A] p-12 text-center">
              <Search size={32} className="text-[#3A3A3A] mx-auto mb-3" />
              <p className="text-[#6A6A6A] text-sm mb-1">
                {q ? `No articles found for "${q}"` : "No articles in this category yet."}
              </p>
              <a href="/articles" className="text-[#F45B69] text-xs hover:underline">Clear filters</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
