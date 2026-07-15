/**
 * Domínios do produto — metadado de rota / seção.
 * Accents visuais são unificados na pedra da marca (billing/muted);
 * os mapas abaixo existem para manter a API estável sem tint por área.
 */
export type ProductDomain =
  | "home"
  | "members"
  | "ministries"
  | "activities"
  | "schedules"
  | "communication"
  | "finances"
  | "reports"
  | "settings";

export const domainFromHref: Record<string, ProductDomain> = {
  "/app/dashboard": "home",
  "/app/membros": "members",
  "/app/ministerios": "ministries",
  "/app/atividades": "activities",
  "/app/minhas-escalas": "schedules",
  "/app/comunicacao": "communication",
  "/app/aconselhamentos": "members",
  "/app/pedidos-de-oracao": "communication",
  "/app/financas": "finances",
  "/app/dizimos-e-ofertas": "finances",
  "/app/relatorios": "reports",
  "/app/configuracoes": "settings",
  "/app/configuracoes/igreja": "settings",
  "/app/configuracoes/usuario": "settings",
};

const NAV_ACTIVE = "bg-muted text-foreground";
const MARK = "bg-billing";
const TEXT = "text-billing-foreground";
const SURFACE = "bg-billing-subtle border-border";

/** Classes Tailwind para estado ativo na nav (fundo + texto + ícone). */
export const domainNavActive: Record<ProductDomain, string> = {
  home: NAV_ACTIVE,
  members: NAV_ACTIVE,
  ministries: NAV_ACTIVE,
  activities: NAV_ACTIVE,
  schedules: NAV_ACTIVE,
  communication: NAV_ACTIVE,
  finances: NAV_ACTIVE,
  reports: NAV_ACTIVE,
  settings: NAV_ACTIVE,
};

/** Ponto / marca lateral (ex.: bullet de seção). */
export const domainMark: Record<ProductDomain, string> = {
  home: MARK,
  members: MARK,
  ministries: MARK,
  activities: MARK,
  schedules: MARK,
  communication: MARK,
  finances: MARK,
  reports: MARK,
  settings: "bg-muted-foreground",
};

/** Texto do accent do domínio. */
export const domainText: Record<ProductDomain, string> = {
  home: TEXT,
  members: TEXT,
  ministries: TEXT,
  activities: TEXT,
  schedules: TEXT,
  communication: TEXT,
  finances: TEXT,
  reports: TEXT,
  settings: "text-muted-foreground",
};

/** Fundo sutil + borda leve para cards de domínio. */
export const domainSurface: Record<ProductDomain, string> = {
  home: SURFACE,
  members: SURFACE,
  ministries: SURFACE,
  activities: SURFACE,
  schedules: SURFACE,
  communication: SURFACE,
  finances: SURFACE,
  reports: SURFACE,
  settings: "bg-muted/50 border-border",
};

export function resolveDomainFromPath(pathname: string): ProductDomain | null {
  const entries = Object.entries(domainFromHref).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [href, domain] of entries) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return domain;
    }
  }
  return null;
}
