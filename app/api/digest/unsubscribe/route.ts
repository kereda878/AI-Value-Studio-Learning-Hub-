import { NextResponse } from "next/server";
import { upsertNotificationPrefs } from "@/lib/db/notifications";

/**
 * One-click unsubscribe link included in every digest email.
 * No auth required — the user_id in the URL is enough.
 * Redirects to the app with a confirmation param.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("u");
  const APP_URL = process.env.APP_URL ?? "";

  if (!userId) {
    return NextResponse.redirect(`${APP_URL}/settings?unsubscribe=invalid`);
  }

  try {
    await upsertNotificationPrefs(userId, { daily_email: false });
  } catch {
    // Best-effort — still redirect to avoid user confusion
  }

  return NextResponse.redirect(`${APP_URL}/settings?unsubscribe=success`);
}
