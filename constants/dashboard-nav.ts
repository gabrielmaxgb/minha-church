import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { APP_ROUTES } from "@/lib/auth/constants";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "Visão geral da igreja",
  },
  {
    label: "Membros",
    href: APP_ROUTES.members,
    icon: Users,
    description: "Cadastro e histórico pastoral",
  },
  {
    label: "Cultos",
    href: APP_ROUTES.events,
    icon: Calendar,
    description: "Cultos, eventos e escalas",
  },
  {
    label: "Finanças",
    href: APP_ROUTES.finances,
    icon: Wallet,
    description: "Entradas, saídas e prestação de contas",
  },
  {
    label: "Comunicação",
    href: APP_ROUTES.communication,
    icon: Mail,
    description: "E-mails e avisos",
  },
  {
    label: "Relatórios",
    href: APP_ROUTES.reports,
    icon: BarChart3,
    description: "Indicadores e exportações",
  },
];

export const dashboardSecondaryNavItems: DashboardNavItem[] = [
  {
    label: "Configurações",
    href: APP_ROUTES.settings,
    icon: Settings,
    description: "Igreja, usuários e preferências",
  },
];

export const roleLabels = {
  owner: "Proprietário",
  admin: "Administrador",
  pastor: "Pastor",
  secretary: "Secretário",
  treasurer: "Tesoureiro",
  leader: "Líder",
  member: "Membro",
} as const;
