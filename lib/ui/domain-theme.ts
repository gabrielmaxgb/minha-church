/**
 * Domínios do produto — metadado de rota / seção.
 * Tinta = orientação (onde estou), não decoração.
 * CTA/primary permanece na pedra da marca.
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

/** Classes Tailwind para estado ativo na nav (fundo + texto + borda da área). */
export const domainNavActive: Record<ProductDomain, string> = {
  home: "border border-domain-home/30 bg-domain-home-subtle text-domain-home-foreground",
  members:
    "border border-domain-members/30 bg-domain-members-subtle text-domain-members-foreground",
  ministries:
    "border border-domain-ministries/30 bg-domain-ministries-subtle text-domain-ministries-foreground",
  activities:
    "border border-domain-activities/30 bg-domain-activities-subtle text-domain-activities-foreground",
  schedules:
    "border border-domain-schedules/30 bg-domain-schedules-subtle text-domain-schedules-foreground",
  communication:
    "border border-domain-communication/30 bg-domain-communication-subtle text-domain-communication-foreground",
  finances:
    "border border-domain-finances/30 bg-domain-finances-subtle text-domain-finances-foreground",
  reports:
    "border border-domain-reports/30 bg-domain-reports-subtle text-domain-reports-foreground",
  settings: "border border-border bg-muted text-foreground",
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
  home: "bg-domain-home-subtle border-domain-home/25",
  members: "bg-domain-members-subtle border-domain-members/25",
  ministries: "bg-domain-ministries-subtle border-domain-ministries/25",
  activities: "bg-domain-activities-subtle border-domain-activities/25",
  schedules: "bg-domain-schedules-subtle border-domain-schedules/25",
  communication:
    "bg-domain-communication-subtle border-domain-communication/25",
  finances: "bg-domain-finances-subtle border-domain-finances/25",
  reports: "bg-domain-reports-subtle border-domain-reports/25",
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
