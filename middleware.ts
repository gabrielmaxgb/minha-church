import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_ROUTES,
  isProtectedAreaPath,
  PUBLIC_ROUTES,
} from "@/constants/routes";
import { AUTH_COOKIE, REFRESH_COOKIE } from "@/lib/auth/constants";
import { decodeJwtPayload } from "@/lib/auth/jwt";

function isTokenValid(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return token.length > 0;
  }

  return payload.exp * 1000 > Date.now();
}

function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get(AUTH_COOKIE)?.value;
  if (isTokenValid(accessToken)) {
    return true;
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  return isTokenValid(refreshToken);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = isAuthenticated(request);
  const requiresAuth = isProtectedAreaPath(pathname);
  const isLoginRoute = pathname === PUBLIC_ROUTES.login;

  if (requiresAuth && !isLoggedIn) {
    const loginUrl = new URL(PUBLIC_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/login"],
};
