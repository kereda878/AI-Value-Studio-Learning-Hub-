import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";

type Handler = (userId: string) => Promise<Response>;

export async function withAuth(handler: Handler): Promise<Response> {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return handler(user.id);
  } catch (err) {
    console.error("[withAuth]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function withAdmin(handler: Handler): Promise<Response> {
  return withAuth(async (userId) => {
    const profile = await getProfile(userId);
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(userId);
  });
}
