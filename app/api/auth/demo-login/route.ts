import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

export async function POST(request: Request) {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Demo mode is not enabled" }, { status: 403 });
  }

  const { email, password } = await request.json();

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(DEMO_SESSION_COOKIE);
  return response;
}
