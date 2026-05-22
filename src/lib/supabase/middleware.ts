import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const ALLOWED_EMAILS = ["mat@matsiems.com"];

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isBo = path === "/bo" || path.startsWith("/bo/");
  const isLogin = path === "/login";

  const devBypass =
    process.env.NODE_ENV === "development" &&
    request.cookies.get("wsl-dev-bypass")?.value === "1";

  // Dev bypass short-circuits Supabase entirely.
  if (devBypass) {
    if (isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/bo";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // If Supabase isn't configured, treat user as anonymous. /bo paths still redirect
  // to /login so the user sees the "set up auth" hint there.
  if (!supabaseConfigured()) {
    if (isBo) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user: { id: string; email?: string | null } | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  } catch {
    user = null;
  }

  if (user && !ALLOWED_EMAILS.includes(user.email ?? "")) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=unauthorized";
    return NextResponse.redirect(url);
  }

  if (!user && isBo) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/bo";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
