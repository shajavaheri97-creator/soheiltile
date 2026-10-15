import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "soheil_session";
const LOCALES = ["fa", "en"];

/**
 * 1) /admin/*  : first line of defence (pages and actions re-check via requireAdmin()).
 * 2) everything else without a locale prefix → redirected to /fa/... (default language).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    if (pathname === "/admin/login") return res;
    const token = req.cookies.get(COOKIE)?.value;
    let ok = false;
    if (token && process.env.SESSION_SECRET) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), { algorithms: ["HS256"] });
        ok = payload.role === "admin";
      } catch {}
    }
    return ok ? res : NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const first = pathname.split("/")[1];
  if (!LOCALES.includes(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/fa${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// skip Next internals, uploads and any path with a file extension (icons, sw.js, sitemap.xml, ...)
export const config = { matcher: ["/admin/:path*", "/((?!_next|uploads|api|.*\\..*).*)"] };
