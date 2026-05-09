import { createClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_PROFILE } from "@/lib/demo";
import type { Profile } from "@/lib/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isDemoMode()) return DEMO_PROFILE;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single<Profile>();
  return data ?? null;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === "admin";
}

export async function getUserCount(): Promise<number> {
  if (isDemoMode()) return 12;
  const supabase = await createClient();
  const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  return count ?? 0;
}
