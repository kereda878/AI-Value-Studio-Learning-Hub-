import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
