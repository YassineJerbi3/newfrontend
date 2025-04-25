// middleware.ts (at project root)
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

export function middleware(req: NextRequest) {
  const token = req.cookies.get("Authentication");
  if (!token && protectedPaths.some((p) => req.nextUrl.pathname.match(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: protectedPaths };
