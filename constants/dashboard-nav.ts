import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  HandHeart,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  Mail,
  PiggyBank,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { AUTH_ROUTES } from "@/constants/routes";
import type { NavPermissionKey } from "@/lib/permissions";
import type { ProductDomain } from "@/lib/ui/domain-theme";

export interface DashboardNavItem {
  label: string;
  /** Rótulo curto no dropdown da sidebar (opcional). */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  domain: ProductDomain;
  /**
   * Seção exige permissão de acesso configurada no cargo.
   * Omitir quando `access` for `activeAdultMember`.
   */
  permission?: NavPermissionKey;
  /**
   * Gate alternativo à permissão de seção:
   * - `activeAdultMember`: membro ativo com 18+ (ficha pastoral)
   * - `activeMember`: membro ativo (sem restrição de idade)
   */
  access?: "activeAdultMember" | "activeMember";
}

export type DashboardNavGroupId = "financeiro";

export interface DashboardNavGroup {
  id: DashboardNavGroupId;
  label: string;
  icon: LucideIcon;
  domain: ProductDomain;
  /** Hrefs dos itens filhos, na ordem de exibição. */
  itemHrefs: string[];
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Início",
    href: AUTH_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "A semana da sua igreja",
    domain: "home",
    permission: "dashboard",
  },
  {
    label: "Eventos",
    href: AUTH_ROUTES.activities,
    icon: Calendar,
    description: "Cultos e encontros da semana",
    domain: "activities",
    permission: "activities",
  },
  {
    label: "Comunicados",
    href: AUTH_ROUTES.communication,
    icon: Mail,
    description: "Mensagens oficiais da igreja",
    domain: "communication",
    permission: "communication",
  },
  {
    label: "Minha escala",
    href: AUTH_ROUTES.mySchedules,
    icon: CalendarDays,
    description: "Convocações e disponibilidade",
    domain: "schedules",
    permission: "schedules",
  },
  {
    label: "Membros",
    href: AUTH_ROUTES.members,
    icon: Users,
    description: "Cadastro e histórico pastoral",
    domain: "members",
    permission: "members",
  },
  {
    label: "Ministérios",
    href: AUTH_ROUTES.ministries,
    icon: Layers,
    description: "Áreas de serviço, cargos e equipes",
    domain: "ministries",
    permission: "ministries",
  },
  {
    label: "Pedidos de oração",
    href: AUTH_ROUTES.prayerRequests,
    icon: HandHeart,
    description: "Quadro aberto para a igreja orar junta",
    domain: "communication",
    access: "activeMember",
  },
  {
    label: "Aconselhamentos",
    href: AUTH_ROUTES.careRequests,
    icon: HeartHandshake,
    description: "Pedir apoio pastoral e acompanhar solicitações",
    domain: "members",
    access: "activeAdultMember",
  },
  {
    label: "Finanças",
    href: AUTH_ROUTES.finances,
    icon: Wallet,
    description: "Contribuições, saídas e exportação",
    domain: "finances",
    permission: "finances",
  },
  {
    label: "Dízimos e ofertas",
    href: AUTH_ROUTES.tithesOfferings,
    icon: PiggyBank,
    description: "Contribuir com os fundos da igreja",
    domain: "finances",
    access: "activeMember",
  },
  {
    label: "Relatórios",
    href: AUTH_ROUTES.reports,
    icon: BarChart3,
    description: "Prestação de contas e exportações",
    domain: "reports",
    permission: "reports",
  },
];

/**
 * Agrupamentos com 2+ destinos. Grupos que restarem com 1 item
 * visível (ex.: por permissão) são promovidos a link no sidebar.
 */
export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    id: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    domain: "finances",
    itemHrefs: [AUTH_ROUTES.finances, AUTH_ROUTES.tithesOfferings],
  },
];

/**
 * Ordem canônica do menu — frequência de uso + afins mentais:
 * semana → pessoas/serviço → cuidado → gestão.
 * `sectionStart` adiciona respiro visual no início de um bloco novo.
 */
export type DashboardNavEntry =
  | { type: "item"; href: string; sectionStart?: boolean }
  | { type: "group"; id: DashboardNavGroupId; sectionStart?: boolean };

export const dashboardNavOrder: DashboardNavEntry[] = [
  { type: "item", href: AUTH_ROUTES.dashboard },
  // Semana (alto uso diário)
  { type: "item", href: AUTH_ROUTES.activities, sectionStart: true },
  { type: "item", href: AUTH_ROUTES.communication },
  { type: "item", href: AUTH_ROUTES.mySchedules },
  // Pessoas e quem serve
  { type: "item", href: AUTH_ROUTES.members, sectionStart: true },
  { type: "item", href: AUTH_ROUTES.ministries },
  // Cuidado da comunidade
  { type: "item", href: AUTH_ROUTES.prayerRequests, sectionStart: true },
  { type: "item", href: AUTH_ROUTES.careRequests },
  // Gestão e olhar da liderança
  { type: "group", id: "financeiro", sectionStart: true },
  { type: "item", href: AUTH_ROUTES.reports },
];

export const dashboardSecondaryNavItems: DashboardNavItem[] = [
  {
    label: "Configurações",
    href: AUTH_ROUTES.settings,
    icon: Settings,
    description: "Perfil e preferências da igreja",
    domain: "settings",
    permission: "settings",
  },
];
