export interface ComparisonRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  church: boolean | string;
}

export const planComparison: ComparisonRow[] = [
  { feature: "Membros", free: "Até 50", pro: "Até 500", church: "Ilimitado" },
  { feature: "Cultos e eventos", free: "Básico", pro: "Ilimitado", church: "Ilimitado" },
  { feature: "Gestão financeira", free: false, pro: true, church: true },
  { feature: "Relatórios e dashboards", free: false, pro: true, church: true },
  { feature: "Escalas de voluntários", free: false, pro: true, church: true },
  { feature: "Multi-congregações", free: false, pro: false, church: true },
  { feature: "API e integrações", free: false, pro: false, church: true },
  { feature: "Suporte", free: "E-mail", pro: "Prioritário", church: "Gerente dedicado" },
];
