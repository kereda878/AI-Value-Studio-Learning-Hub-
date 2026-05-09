import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile, getUserCount } from "@/lib/db/profiles";
import { getArticles } from "@/lib/db/articles";
import { getTodaysBrew } from "@/lib/db/brew";
import AdminUploadForm from "@/components/admin/AdminUploadForm";
import AdminBrewManager from "@/components/admin/AdminBrewManager";
import { StatCard } from "@/components/ui/Card";
import { Shield, FileText, Coffee, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { Article } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await getProfile(user!.id);
  if (profile?.role !== "admin") redirect("/");

  const [articles, brew, userCount, { count: articleCount }] = await Promise.all([
    getArticles({ limit: 20 }),
    getTodaysBrew(),
    getUserCount(),
    supabase.from("articles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-[#D4956A]/15 border border-[#D4956A]/30 flex items-center justify-center">
          <Shield size={16} className="text-[#D4956A]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Admin Panel</h1>
          <p className="text-[#6A6A6A] text-xs">Manage articles, Morning Brew, and users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Articles" value={articleCount ?? 0} icon={<FileText size={16} />} color="#F45B69" />
        <StatCard label="Total Users" value={userCount} icon={<Users size={16} />} color="#D4956A" />
        <StatCard label="Today's Brew" value={brew ? "Published" : "Pending"} icon={<Coffee size={16} />} color="#C87E9A" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={15} className="text-[#F45B69]" /> Upload New Article
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

      {/* Articles table */}
      <section>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#A0A0A0]" /> Recent Articles
        </h2>
        <div className="bg-[#242424] rounded-xl border border-[#3A3A3A] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A3A]">
                {["Title", "Category", "Date", "Reads"].map((h, i) => (
                  <th key={h} className={`text-left text-[#6A6A6A] text-xs font-medium px-4 py-3 uppercase tracking-wider ${i > 0 && i < 3 ? "hidden md:table-cell" : ""} ${i === 3 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id} className="border-b border-[#3A3A3A] last:border-0 hover:bg-[#2E2E2E] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/articles/${article.id}`} className="text-[#F0F0F0] hover:text-[#F45B69] transition-colors line-clamp-1">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-[#A0A0A0] text-xs">{article.category ?? "—"}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-[#6A6A6A] text-xs">{format(new Date(article.published_at), "MMM d, yyyy")}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-[#6A6A6A] text-xs">{article.read_count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && <p className="text-center text-[#6A6A6A] text-sm py-8">No articles yet.</p>}
        </div>
      </section>
    </div>
  );
}
