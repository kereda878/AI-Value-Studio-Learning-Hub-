import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getProfile, getUserCount } from "@/lib/db/profiles";
import { getArticles, getArticleCategoryCounts } from "@/lib/db/articles";
import { getTodaysBrew } from "@/lib/db/brew";
import AdminUploadForm from "@/components/admin/AdminUploadForm";
import AdminBrewManager from "@/components/admin/AdminBrewManager";
import AdminURLSubmit from "@/components/admin/AdminURLSubmit";
import AdminSuggestPanel from "@/components/admin/AdminSuggestPanel";
import AdminQueue from "@/components/admin/AdminQueue";
import { StatCard } from "@/components/ui/Card";
import { Shield, FileText, Coffee, Users, Link2, Sparkles, InboxIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo";

export default async function AdminPage() {
  const user = await getServerUser();
  const profile = await getProfile(user!.id);
  if (profile?.role !== "admin") redirect("/");

  const [articles, brew, userCount, categoryCounts] = await Promise.all([
    getArticles({ limit: 20 }),
    getTodaysBrew(),
    getUserCount(),
    getArticleCategoryCounts(),
  ]);

  const existingCategories = Object.keys(categoryCounts);

  const articleCount = isDemoMode() ? articles.length : await (async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { count } = await supabase.from("articles").select("*", { count: "exact", head: true });
    return count ?? 0;
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#D4956A]/15 border border-[#D4956A]/30 flex items-center justify-center">
          <Shield size={17} className="text-[#D4956A]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Admin Panel</h1>
          <p className="text-[#5A5A5A] text-xs">Manage content, review queue, and publish the Morning Brew</p>
        </div>
        {isDemoMode() && (
          <span className="ml-auto text-xs text-[#D4956A] bg-[#D4956A]/10 border border-[#D4956A]/20 px-3 py-1 rounded-full">
            Demo Mode — changes won&apos;t persist between restarts
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Published Articles" value={articleCount} icon={<FileText size={16} />} color="#F45B69" />
        <StatCard label="Total Users" value={userCount} icon={<Users size={16} />} color="#D4956A" />
        <StatCard label="Today's Brew" value={brew ? "Published" : "Pending"} icon={<Coffee size={16} />} color="#C87E9A" />
      </div>

      {/* ── Row 1: Quick Publish + AI Suggestions ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={14} className="text-[#F45B69]" />
            <h2 className="text-white font-semibold text-sm">Quick Publish from URL</h2>
          </div>
          <AdminURLSubmit />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#D4956A]" />
            <h2 className="text-white font-semibold text-sm">AI Article Ideas</h2>
          </div>
          <AdminSuggestPanel existingCategories={existingCategories} />
        </section>
      </div>

      {/* ── Row 2: Review Queue ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <InboxIcon size={15} className="text-[#A0A0A0]" />
          <h2 className="text-white font-semibold">Review Queue</h2>
          <span className="text-[#4A4A4A] text-xs ml-1">— approve articles before they go live</span>
        </div>
        <AdminQueue />
      </section>

      {/* ── Row 3: Upload + Brew Manager ── */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={15} className="text-[#F45B69]" /> Manual Upload
          </h2>
          <AdminUploadForm />
        </section>
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Coffee size={15} className="text-[#D4956A]" /> Morning Brew
          </h2>
          <AdminBrewManager articles={articles} existingBrew={brew ?? null} />
        </section>
      </div>

      {/* ── Row 4: Recent Articles Table ── */}
      <section>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#A0A0A0]" /> Published Articles
        </h2>
        <div className="bg-[#141414] rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Title", "Category", "Date", "Reads"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left text-[#5A5A5A] text-xs font-medium px-4 py-3 uppercase tracking-wider ${i > 0 && i < 3 ? "hidden md:table-cell" : ""} ${i === 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/articles/${article.id}`} className="text-[#D0D0D0] hover:text-[#F45B69] transition-colors line-clamp-1 text-sm">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[#6A6A6A] text-xs">{article.category ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[#4A4A4A] text-xs">{format(new Date(article.published_at), "MMM d, yyyy")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[#4A4A4A] text-xs">{article.read_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <p className="text-center text-[#4A4A4A] text-sm py-10">No articles published yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
