import { createServiceClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import type { NotificationPrefs } from "@/lib/types";

// ── Demo in-memory store ──────────────────────────────────────────────────
const demoPrefsStore = new Map<string, NotificationPrefs>();

const DEFAULT_PREFS = (userId: string): NotificationPrefs => ({
  user_id: userId,
  daily_email: true,
  delivery_hour: 8,
  tz: "America/New_York",
});

// ── Notification prefs ────────────────────────────────────────────────────

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  if (isDemoMode()) {
    return demoPrefsStore.get(userId) ?? DEFAULT_PREFS(userId);
  }
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("notification_prefs")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data ?? DEFAULT_PREFS(userId);
}

export async function upsertNotificationPrefs(
  userId: string,
  prefs: Partial<Omit<NotificationPrefs, "user_id">>
): Promise<NotificationPrefs> {
  if (isDemoMode()) {
    const current = demoPrefsStore.get(userId) ?? DEFAULT_PREFS(userId);
    const updated = { ...current, ...prefs };
    demoPrefsStore.set(userId, updated);
    return updated;
  }
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("notification_prefs")
    .upsert(
      { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Digest delivery targeting ─────────────────────────────────────────────

/**
 * Returns users whose (delivery_hour, tz) matches the current wall-clock hour.
 * Called every hour by the cron worker.
 */
export async function getUsersForDigest(): Promise<Array<{ user_id: string; email: string }>> {
  if (isDemoMode()) return [];

  const supabase = await createServiceClient();
  const { data: prefs } = await supabase
    .from("notification_prefs")
    .select("user_id, delivery_hour, tz")
    .eq("daily_email", true);

  if (!prefs?.length) return [];

  const now = new Date();
  const matchingIds: string[] = [];

  for (const pref of prefs) {
    try {
      const userHour = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: pref.tz,
      }).format(now);
      if (parseInt(userHour) === pref.delivery_hour) {
        matchingIds.push(pref.user_id);
      }
    } catch {
      // skip entries with invalid tz
    }
  }

  if (!matchingIds.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", matchingIds);

  return profiles?.map((p) => ({ user_id: p.id, email: p.email })) ?? [];
}

// ── Digest send log ───────────────────────────────────────────────────────

export async function hasReceivedDigestToday(
  userId: string,
  brewDate: string
): Promise<boolean> {
  if (isDemoMode()) return false;
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("digest_sends")
    .select("id")
    .eq("user_id", userId)
    .eq("brew_date", brewDate)
    .single();
  return !!data;
}

export async function recordDigestSend(userId: string, brewDate: string): Promise<string> {
  if (isDemoMode()) return "demo-send-id";
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("digest_sends")
    .upsert({ user_id: userId, brew_date: brewDate }, { onConflict: "user_id,brew_date" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function recordDigestOpen(sendId: string): Promise<void> {
  if (isDemoMode()) return;
  const supabase = await createServiceClient();
  await supabase
    .from("digest_sends")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", sendId)
    .is("opened_at", null);
}

export async function recordDigestClick(sendId: string, articleId: string): Promise<void> {
  if (isDemoMode()) return;
  const supabase = await createServiceClient();
  const ts = new Date().toISOString();
  // Merge into the clicked jsonb column
  await supabase.rpc("jsonb_set_key", {
    row_id: sendId,
    key: articleId,
    value: ts,
  }).throwOnError();
}
