export const PUBLIC_ROUTES = {
  home: "/",
  pricing: "/precos",
  resources: "/recursos",
  about: "/sobre",
  faq: "/faq",
  security: "/seguranca",
  login: "/login",
  register: "/cadastro",
  forgotPassword: "/recuperar-senha",
  resetPassword: "/redefinir-senha",
  verifyEmail: "/verificar-email",
  /** Caixa de entrada: link de confirmação já foi enviado */
  emailSent: "/email-enviado",
} as const;

export function emailSentPath(
  email: string,
  options?: { from?: "register" | "login" },
): string {
  const params = new URLSearchParams();
  const normalized = email.trim().toLowerCase();
  if (normalized) {
    params.set("email", normalized);
  }
  if (options?.from) {
    params.set("from", options.from);
  }
  const query = params.toString();
  return query
    ? `${PUBLIC_ROUTES.emailSent}?${query}`
    : PUBLIC_ROUTES.emailSent;
}

export const AUTH_ROUTES = {
  root: "/app",
  dashboard: "/app/dashboard",
  members: "/app/membros",
  ministries: "/app/ministerios",
  activities: "/app/atividades",
  mySchedules: "/app/minhas-escalas",
  /** @deprecated Use mySchedules */
  mySchedule: "/app/minhas-escalas",
  finances: "/app/financas",
  communication: "/app/comunicacao",
  careRequests: "/app/aconselhamentos",
  reports: "/app/relatorios",
  settings: "/app/configuracoes",
  changePassword: "/app/alterar-senha",
} as const;

export function myScheduleMinistryPath(ministryId: string): string {
  return `${AUTH_ROUTES.mySchedules}/${ministryId}`;
}

export function ministryDetailPath(ministryId: string): string {
  return `${AUTH_ROUTES.ministries}/${ministryId}`;
}

export const ROSTER_PROFILE_SECTION_ID = "roster-profile";

export function ministryAvailabilityPath(ministryId: string): string {
  return `${ministryDetailPath(ministryId)}?section=availability#${ROSTER_PROFILE_SECTION_ID}`;
}

export function memberDetailPath(memberId: string): string {
  return `${AUTH_ROUTES.members}/${memberId}`;
}

export function familyGraphPath(familyId: string): string {
  return `${AUTH_ROUTES.members}/familias/${familyId}`;
}

export function activityDetailPath(eventId: string): string {
  return `${AUTH_ROUTES.activities}/${eventId}`;
}

/** Abre o calendário de atividades com um dia (`YYYY-MM-DD`) em foco. */
export function activitiesCalendarPath(dateKey: string): string {
  return `${AUTH_ROUTES.activities}?view=calendar&date=${dateKey}`;
}

export function settingsSectionPath(
  section:
    | "password-reset-requests"
    | "pending-users"
    | "ministries"
    | "profile",
): string {
  return `${AUTH_ROUTES.settings}?section=${section}`;
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
