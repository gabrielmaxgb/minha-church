/**
 * Domínios do produto — cores suaves alinhadas à vibe institucional quieta.
 * Use para nav ativa, marcas de seção e accents leves (não sidebars coloridas).
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
  "/app/relatorios": "reports",
  "/app/configuracoes": "settings",
  "/app/configuracoes/igreja": "settings",
  "/app/configuracoes/usuario": "settings",
};

/** Classes Tailwind para estado ativo na nav (fundo + texto + ícone). */
export const domainNavActive: Record<ProductDomain, string> = {
  home: "bg-domain-home-subtle text-domain-home-foreground",
  members: "bg-domain-members-subtle text-domain-members-foreground",
  ministries: "bg-domain-ministries-subtle text-domain-ministries-foreground",
  activities: "bg-domain-activities-subtle text-domain-activities-foreground",
  schedules: "bg-domain-schedules-subtle text-domain-schedules-foreground",
  communication:
    "bg-domain-communication-subtle text-domain-communication-foreground",
  finances: "bg-domain-finances-subtle text-domain-finances-foreground",
  reports: "bg-domain-reports-subtle text-domain-reports-foreground",
  settings: "bg-muted text-foreground",
};

/** Ponto / marca lateral (ex.: bullet de seção). */
export const domainMark: Record<ProductDomain, string> = {
  home: "bg-domain-home",
  members: "bg-domain-members",
  ministries: "bg-domain-ministries",
  activities: "bg-domain-activities",
  schedules: "bg-domain-schedules",
  communication: "bg-domain-communication",
  finances: "bg-domain-finances",
  reports: "bg-domain-reports",
  settings: "bg-muted-foreground",
};

/** Texto do accent do domínio. */
export const domainText: Record<ProductDomain, string> = {
  home: "text-domain-home-foreground",
  members: "text-domain-members-foreground",
  ministries: "text-domain-ministries-foreground",
  activities: "text-domain-activities-foreground",
  schedules: "text-domain-schedules-foreground",
  communication: "text-domain-communication-foreground",
  finances: "text-domain-finances-foreground",
  reports: "text-domain-reports-foreground",
  settings: "text-muted-foreground",
};

/** Fundo sutil + borda leve para cards de domínio. */
export const domainSurface: Record<ProductDomain, string> = {
  home: "bg-domain-home-subtle border-domain-home/20",
  members: "bg-domain-members-subtle border-domain-members/20",
  ministries: "bg-domain-ministries-subtle border-domain-ministries/20",
  activities: "bg-domain-activities-subtle border-domain-activities/20",
  schedules: "bg-domain-schedules-subtle border-domain-schedules/20",
  communication:
    "bg-domain-communication-subtle border-domain-communication/20",
  finances: "bg-domain-finances-subtle border-domain-finances/20",
  reports: "bg-domain-reports-subtle border-domain-reports/20",
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
