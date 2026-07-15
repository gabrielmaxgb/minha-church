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
  MessagesSquare,
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

export type DashboardNavGroupId =
  | "pessoas"
  | "servico"
  | "comunidade"
  | "financeiro";

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
    label: "Membros",
    href: AUTH_ROUTES.members,
    icon: Users,
    description: "Cadastro e histórico pastoral",
    domain: "members",
    permission: "members",
  },
  {
    label: "Ministérios e Grupos de serviço",
    shortLabel: "Ministérios",
    href: AUTH_ROUTES.ministries,
    icon: Layers,
    description: "Áreas de serviço, cargos e equipes",
    domain: "ministries",
    permission: "ministries",
  },
  {
    label: "Eventos e Atividades",
    shortLabel: "Eventos",
    href: AUTH_ROUTES.activities,
    icon: Calendar,
    description: "Cultos e encontros da semana",
    domain: "activities",
    permission: "activities",
  },
  {
    label: "Minhas escalas",
    href: AUTH_ROUTES.mySchedules,
    icon: CalendarDays,
    description: "Convocações e disponibilidade",
    domain: "schedules",
    permission: "schedules",
  },
  {
    label: "Aconselhamentos e visitas",
    shortLabel: "Aconselhamentos",
    href: AUTH_ROUTES.careRequests,
    icon: HeartHandshake,
    description: "Pedir apoio pastoral e acompanhar solicitações",
    domain: "members",
    access: "activeAdultMember",
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
    label: "Finanças",
    href: AUTH_ROUTES.finances,
    icon: Wallet,
    description: "Recebimentos, saídas e exportação",
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
    label: "Quadro de avisos",
    href: AUTH_ROUTES.communication,
    icon: Mail,
    description: "Avisos para a igreja e ministérios",
    domain: "communication",
    permission: "communication",
  },
  {
    label: "Relatórios",
    href: AUTH_ROUTES.reports,
    icon: BarChart3,
    description: "Resumos para a liderança",
    domain: "reports",
    permission: "reports",
  },
];

/**
 * Agrupamentos da sidebar (ordem de render).
 * Itens sem grupo (`Início`, `Relatórios`) ficam soltos.
 */
export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    id: "pessoas",
    label: "Pessoas",
    icon: Users,
    domain: "members",
    itemHrefs: [AUTH_ROUTES.members, AUTH_ROUTES.careRequests],
  },
  {
    id: "servico",
    label: "Serviço",
    icon: Layers,
    domain: "ministries",
    itemHrefs: [
      AUTH_ROUTES.ministries,
      AUTH_ROUTES.activities,
      AUTH_ROUTES.mySchedules,
    ],
  },
  {
    id: "comunidade",
    label: "Comunidade",
    icon: MessagesSquare,
    domain: "communication",
    itemHrefs: [AUTH_ROUTES.communication, AUTH_ROUTES.prayerRequests],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    domain: "finances",
    itemHrefs: [AUTH_ROUTES.finances, AUTH_ROUTES.tithesOfferings],
  },
];

/** Hrefs que ficam no primeiro nível (fora de grupos). */
export const dashboardNavSoloHrefs = [
  AUTH_ROUTES.dashboard,
  AUTH_ROUTES.reports,
] as const;

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
