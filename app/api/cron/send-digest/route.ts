import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getTodaysBrew } from "@/lib/db/brew";
import {
  getUsersForDigest,
  hasReceivedDigestToday,
  recordDigestSend,
} from "@/lib/db/notifications";
import { buildBrewEmail } from "@/lib/email/brewTemplate";
import { todayISO } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL ?? "https://genpact-bookshelf.vercel.app";

/**
 * Triggered hourly by Vercel Cron (vercel.json) or an external scheduler.
 * Secured by CRON_SECRET header — add to Vercel env vars.
 *
 * vercel.json example:
 * {
 *   "crons": [{ "path": "/api/cron/send-digest", "schedule": "0 * * * *" }]
 * }
 */
export async function GET(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const brewDate = todayISO();

  // ── Check brew exists and is published ───────────────────────────────────
  const brew = await getTodaysBrew();
  if (!brew || !brew.articles?.length) {
    return NextResponse.json({ skipped: true, reason: "No brew published today" });
  }

  // ── Find users due for delivery this hour ────────────────────────────────
  const candidates = await getUsersForDigest();
  if (!candidates.length) {
    return NextResponse.json({ sent: 0, reason: "No users scheduled for this hour" });
  }

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const { user_id, email } of candidates) {
    if (!email) { results.skipped++; continue; }

    // Skip if already sent today
    const alreadySent = await hasReceivedDigestToday(user_id, brewDate);
    if (alreadySent) { results.skipped++; continue; }

    try {
      // Record the send first to get the send ID for tracking URLs
      const sendId = await recordDigestSend(user_id, brewDate);

      const trackingPixelUrl = `${APP_URL}/api/digest/track?s=${sendId}`;
      const unsubscribeUrl   = `${APP_URL}/api/digest/unsubscribe?u=${user_id}`;

      const html = buildBrewEmail({
        brew,
        articles: brew.articles ?? [],
        appUrl: APP_URL,
        trackingPixelUrl,
        unsubscribeUrl,
      });

      await resend.emails.send({
        from: "Genpact Bookshelf <brew@genpact-bookshelf.com>",
        to: email,
        subject: `☕ Morning Brew — ${new Date(brewDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" })}`,
        html,
      });

      results.sent++;
    } catch (err) {
      console.error(`[send-digest] Failed for ${email}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ brewDate, ...results });
}
