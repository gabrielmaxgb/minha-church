export const PUBLIC_ROUTES = {
  home: "/",
  pricing: "/precos",
  resources: "/recursos",
  about: "/sobre",
  faq: "/faq",
  security: "/seguranca",
  login: "/login",
} as const;

export const AUTH_ROUTES = {
  root: "/app",
  dashboard: "/app/dashboard",
  members: "/app/membros",
  ministries: "/app/ministerios",
  activities: "/app/atividades",
  finances: "/app/financas",
  communication: "/app/comunicacao",
  reports: "/app/relatorios",
  settings: "/app/configuracoes",
  changePassword: "/app/alterar-senha",
} as const;

export function ministryDetailPath(ministryId: string): string {
  return `${AUTH_ROUTES.ministries}/${ministryId}`;
}

export function memberDetailPath(memberId: string): string {
  return `${AUTH_ROUTES.members}/${memberId}`;
}

export const MEMBER_CREATE_ROUTE = `${AUTH_ROUTES.members}/novo` as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];

/** Rotas do painel logado (`/app/*`) — exigem autenticação. */
export function isProtectedAreaPath(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTES.root ||
    pathname.startsWith(`${AUTH_ROUTES.root}/`)
  );
}

/** Valida `?redirect=` pós-login — só aceita destinos do painel. */
export function resolvePostLoginRedirect(redirectParam: string | null): string {
  if (redirectParam && isProtectedAreaPath(redirectParam)) {
    return redirectParam;
  }

  return AUTH_ROUTES.dashboard;
}
