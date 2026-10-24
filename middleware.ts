import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  // Avoid initializing Supabase and verifying a user for anonymous requests.
  // This is only a fast-path redirect; requests with an auth cookie still go
  // through getUser() and the database role check below.
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some(({ name }) =>
      /^sb-.+-auth-token(?:\.\d+)?$/.test(name) ||
      name === "sb-access-token" ||
      name === "sb-refresh-token"
    );

  if (!hasSupabaseAuthCookie) {
    if (isAdminRoute && !isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isLoginRoute) {
      return NextResponse.next();
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh and verify the session — required for Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Logged in via Supabase Auth is not enough — must have an admin
    // profile row (created manually per README "Creating the first admin").
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !["owner", "admin"].includes(profile.role)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "not-authorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && ["owner", "admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
