import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE } from "@/lib/demo";

const PUBLIC_PATHS = ["/auth/login", "/auth/callback", "/api/auth/demo-login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  // ── Demo mode: cookie-only auth ───────────────────────────────────────────
  if (process.env.DEMO_MODE === "true") {
    const session = request.cookies.get(DEMO_SESSION_COOKIE);
    const authenticated = session?.value === DEMO_SESSION_VALUE;

    if (!authenticated && !isPublic) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Supabase auth ─────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
