import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isTokenValid,
  clearTokenCookie,
  AUTH_EXPIRATION_COOKIE_NAME,
} from "@/lib/auth";

const CLEAR_EXPIRATION_COOKIE = `${AUTH_EXPIRATION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=lax`;

const AUTH_PATHS = ["/login", "/register"];

function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = isTokenValid(request);

  // Allow static assets and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // favicon, etc.
  ) {
    return NextResponse.next();
  }

  if (isAuthPage(pathname)) {
    if (isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("Set-Cookie", clearTokenCookie());
    res.headers.append("Set-Cookie", CLEAR_EXPIRATION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
