import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_ROUTES,
  isProtectedAreaPath,
  PUBLIC_ROUTES,
} from "@/constants/routes";
import { AUTH_COOKIE } from "@/lib/auth/constants";
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

function hasValidAccessToken(request: NextRequest): boolean {
  return isTokenValid(request.cookies.get(AUTH_COOKIE)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccess = hasValidAccessToken(request);
  const requiresAuth = isProtectedAreaPath(pathname);
  const isLoginRoute = pathname === PUBLIC_ROUTES.login;

  // Só o access token conta para entrar no painel. Refresh é tratado no cliente
  // na página de login (evita loop middleware ↔ sessão inválida).
  if (requiresAuth && !hasAccess) {
    const loginUrl = new URL(PUBLIC_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && hasAccess) {
    const forceLogin = request.nextUrl.searchParams.get("force") === "1";
    if (!forceLogin) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/login", "/recuperar-senha", "/redefinir-senha"],
};
