import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth/constants";
import { decodeJwtPayload } from "@/lib/auth/jwt";

const APP_PREFIX = "/app";
const LOGIN_ROUTE = "/login";

function isTokenPresent(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return token.length > 0;
  }

  return payload.exp * 1000 > Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = isTokenPresent(token);
  const isAppRoute = pathname === APP_PREFIX || pathname.startsWith(`${APP_PREFIX}/`);
  const isLoginRoute = pathname === LOGIN_ROUTE;

  if (isAppRoute && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`${APP_PREFIX}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/login"],
};
