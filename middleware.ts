import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/acceuil/:path*",
  "/classes/:path*",
  "/equipements/:path*",
  "/intervention/:path*",
  "/inventaire/:path*",
  "/planification/:path*",
  "/rapport/:path*",
  "/rooms/:path*",
  "/utilisateurs/:path*",
  "/notification/:path*",
];

// treat "/" (login) as a “public” path that should redirect if already authed
const publicPaths = ["/", "/login"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("Authentication")?.value;
  const path = req.nextUrl.pathname;

  // 1. not authed + trying to access protected → send to login
  if (!token && protectedPaths.some((p) => path.match(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2. authed + on login (public) → send to /acceuil
  if (token && publicPaths.includes(path)) {
    const url = req.nextUrl.clone();
    url.pathname = "/acceuil";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedPaths, ...publicPaths],
};
