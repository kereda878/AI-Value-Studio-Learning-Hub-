import { getServerUser } from "@/lib/auth";
import { getNotificationPrefs } from "@/lib/db/notifications";
import { Settings, Bell } from "lucide-react";
import NotificationPrefsForm from "@/components/settings/NotificationPrefsForm";

interface PageProps {
  searchParams: Promise<{ unsubscribe?: string }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const user = await getServerUser();
  const [prefs, params] = await Promise.all([
    getNotificationPrefs(user!.id),
    searchParams,
  ]);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Settings size={16} className="text-[#A0A0A0]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Settings</h1>
          <p className="text-[#5A5A5A] text-xs">Manage your account preferences</p>
        </div>
      </div>

      {/* Notifications section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={14} className="text-[#D4956A]" />
          <h2 className="text-white font-semibold text-sm">Email Notifications</h2>
        </div>
        <NotificationPrefsForm
          initial={prefs}
          unsubscribeSuccess={params.unsubscribe === "success"}
        />
      </section>
    </div>
  );
}
