import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  HandHeart,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  Mail,
  CalendarDays,
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
    href: AUTH_ROUTES.ministries,
    icon: Layers,
    description: "Áreas de serviço, cargos e equipes",
    domain: "ministries",
    permission: "ministries",
  },
  {
    label: "Atividades",
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
    description: "Entradas, saídas e prestação de contas",
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
    label: "Comunicação",
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
