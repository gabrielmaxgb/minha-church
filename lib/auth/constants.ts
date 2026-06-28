import { PUBLIC_ROUTES } from "@/constants/routes";

export {
  AUTH_ROUTES,
  isProtectedAreaPath,
  PUBLIC_ROUTES,
  resolvePostLoginRedirect,
} from "@/constants/routes";

export const AUTH_COOKIE = "mc_access_token";
export const REFRESH_COOKIE = "mc_refresh_token";
export const CHURCH_COOKIE = "mc_church_id";

/** @deprecated Prefer `PUBLIC_ROUTES.login` */
export const LOGIN_ROUTE = PUBLIC_ROUTES.login;
