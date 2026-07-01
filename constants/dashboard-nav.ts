import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  Layers,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { AUTH_ROUTES } from "@/constants/routes";
import type { NavPermissionKey } from "@/lib/permissions";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  /** Omitido = visível para todos os membros da igreja */
  permission?: NavPermissionKey;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: AUTH_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "Visão geral da igreja",
  },
  {
    label: "Membros",
    href: AUTH_ROUTES.members,
    icon: Users,
    description: "Cadastro e histórico pastoral",
  },
  {
    label: "Ministérios",
    href: AUTH_ROUTES.ministries,
    icon: Layers,
    description: "Áreas de serviço, cargos e equipes",
  },
  {
    label: "Atividades",
    href: AUTH_ROUTES.activities,
    icon: Calendar,
    description: "Eventos e encontros por ministério",
  },
  {
    label: "Finanças",
    href: AUTH_ROUTES.finances,
    icon: Wallet,
    description: "Entradas, saídas e prestação de contas",
    permission: "finances",
  },
  {
    label: "Comunicação",
    href: AUTH_ROUTES.communication,
    icon: Mail,
    description: "E-mails e avisos",
    permission: "communication",
  },
  {
    label: "Relatórios",
    href: AUTH_ROUTES.reports,
    icon: BarChart3,
    description: "Indicadores e exportações",
    permission: "reports",
  },
];

export const dashboardSecondaryNavItems: DashboardNavItem[] = [
  {
    label: "Configurações",
    href: AUTH_ROUTES.settings,
    icon: Settings,
    description: "Perfil e preferências da igreja",
  },
];
