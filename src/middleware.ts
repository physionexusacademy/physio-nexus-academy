import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse, type NextRequest } from "next/server";

async function constantTimeSecretMatch(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [providedDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const providedBytes = new Uint8Array(providedDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= providedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

function previewAuthRequired() {
  return new NextResponse("PNA Clinical Registry Preview authentication is required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="PNA Clinical Registry Preview", charset="UTF-8"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function middleware(request: NextRequest) {
  const isClinicalRegistryRoute =
    request.nextUrl.pathname === "/clinical-registry" ||
    request.nextUrl.pathname.startsWith("/clinical-registry/");

  // The Preview build is protected at the edge with a Cloudflare Worker secret.
  // This gate is an outer Preview perimeter only; Supabase Auth, MFA, RLS and ownership
  // checks remain mandatory inside the Registry and must never rely on this shared secret.
  // Production builds bypass this shared Preview-only gate and retain normal Registry auth.
  if (isClinicalRegistryRoute && process.env.PNA_PREVIEW_BUILD === "true") {
    let expectedPassword: string | undefined;
    try {
      const { env } = getCloudflareContext();
      expectedPassword = (env as unknown as {
        PNA_PREVIEW_ACCESS_PASSWORD?: string;
      }).PNA_PREVIEW_ACCESS_PASSWORD;
    } catch {
      return new NextResponse("Preview access protection is unavailable.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    if (!expectedPassword || expectedPassword.length < 32) {
      return new NextResponse("Preview access protection is not configured.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    let username = "";
    let providedPassword = "";
    const authorization = request.headers.get("authorization") ?? "";
    if (authorization.startsWith("Basic ")) {
      try {
        const binary = atob(authorization.slice("Basic ".length));
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        const credentials = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        const separator = credentials.indexOf(":");
        if (separator >= 0) {
          username = credentials.slice(0, separator);
          providedPassword = credentials.slice(separator + 1);
        }
      } catch {
        // Malformed Basic credentials are treated exactly like missing credentials.
      }
    }

    const authorized =
      username === "pna-preview" &&
      await constantTimeSecretMatch(providedPassword, expectedPassword);
    if (!authorized) return previewAuthRequired();

    const protectedResponse = NextResponse.next({ request });
    protectedResponse.headers.set("Cache-Control", "private, no-store");
    protectedResponse.headers.set("Vary", "Authorization");
    protectedResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return protectedResponse;
  }

  // Do not make a main-site Supabase Auth request for Registry routes.
  if (isClinicalRegistryRoute) return NextResponse.next({ request });

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
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
  matcher: ["/admin/:path*", "/clinical-registry", "/clinical-registry/:path*"],
};
