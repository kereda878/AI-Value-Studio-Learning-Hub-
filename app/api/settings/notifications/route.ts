import { NextResponse } from "next/server";
import { withAuth } from "@/lib/supabase/guard";
import { getNotificationPrefs, upsertNotificationPrefs } from "@/lib/db/notifications";

export async function GET(): Promise<Response> {
  return withAuth(async (userId) => {
    const prefs = await getNotificationPrefs(userId);
    return NextResponse.json(prefs);
  });
}

export async function PUT(request: Request): Promise<Response> {
  return withAuth(async (userId) => {
    const body = await request.json();
    const { daily_email, delivery_hour, tz } = body;

    if (delivery_hour !== undefined && (delivery_hour < 0 || delivery_hour > 23)) {
      return NextResponse.json({ error: "delivery_hour must be 0-23" }, { status: 400 });
    }

    const updated = await upsertNotificationPrefs(userId, {
      ...(daily_email !== undefined && { daily_email: Boolean(daily_email) }),
      ...(delivery_hour !== undefined && { delivery_hour: Number(delivery_hour) }),
      ...(tz !== undefined && { tz: String(tz) }),
    });

    return NextResponse.json(updated);
  });
}
