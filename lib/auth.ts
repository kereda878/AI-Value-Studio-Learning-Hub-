import { cookies } from "next/headers";
import { isDemoMode, DEMO_USER_ID, DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export interface ServerUser {
  id: string;
  email: string;
}

/** Returns the authenticated user in both demo and Supabase modes */
export async function getServerUser(): Promise<ServerUser | null> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const session = cookieStore.get(DEMO_SESSION_COOKIE);
    if (session?.value === DEMO_SESSION_VALUE) {
      return { id: DEMO_USER_ID, email: "demo@genpact.com" };
    }
    return null;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? "" } : null;
}
