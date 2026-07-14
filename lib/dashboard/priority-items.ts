import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ClipboardList,
  HeartHandshake,
  KeyRound,
  Megaphone,
  Users,
} from "lucide-react";

import {
  AUTH_ROUTES,
  activityDetailPath,
  settingsSectionPath,
} from "@/constants/routes";
import { formatRelativeEventDay } from "@/lib/dashboard/date-utils";
import type { DashboardHomeProfile } from "@/lib/dashboard/home-profile";
import type { ChurchEvent } from "@/types/events";

export interface DashboardPriorityItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "attention" | "schedules" | "care" | "communication" | "activities";
}

interface BuildPrioritiesInput {
  profile: DashboardHomeProfile;
  pendingAccessCount: number;
  passwordResetCount: number;
  schedulePendingCount: number;
  carePendingCount: number;
  announcementsUnreadCount: number;
  nextEvent: ChurchEvent | null;
  canManageMemberships: boolean;
  canAccessSchedules: boolean;
  canReceiveCare: boolean;
  hasCommunicationAccess: boolean;
  canAccessActivities: boolean;
}

const MAX_PRIORITIES = 3;

export function buildDashboardPriorities(
  input: BuildPrioritiesInput,
): DashboardPriorityItem[] {
  const items: DashboardPriorityItem[] = [];

  if (
    input.canManageMemberships &&
    input.pendingAccessCount > 0 &&
    (input.profile === "owner" || input.profile === "leader")
  ) {
    items.push({
      id: "pending-access",
      title: `${input.pendingAccessCount} acesso${input.pendingAccessCount === 1 ? "" : "s"} pendente${input.pendingAccessCount === 1 ? "" : "s"}`,
      description: "Alguém espera aprovação para entrar no painel",
      href: settingsSectionPath("pending-users"),
      icon: Users,
      tone: "attention",
    });
  }

  if (
    input.canManageMemberships &&
    input.passwordResetCount > 0 &&
    (input.profile === "owner" || input.profile === "leader")
  ) {
    items.push({
      id: "password-reset",
      title: `${input.passwordResetCount} pedido${input.passwordResetCount === 1 ? "" : "s"} de senha`,
      description: "Pessoas pedindo para voltar a acessar a conta",
      href: settingsSectionPath("password-reset-requests"),
      icon: KeyRound,
      tone: "attention",
    });
  }

  if (input.canAccessSchedules && input.schedulePendingCount > 0) {
    items.push({
      id: "schedule-pending",
      title:
        input.schedulePendingCount === 1
          ? "1 escala aguarda sua resposta"
          : `${input.schedulePendingCount} escalas aguardam sua resposta`,
      description: "Sem isso, o líder não fecha a equipe",
      href: AUTH_ROUTES.mySchedules,
      icon: ClipboardList,
      tone: "schedules",
    });
  }

  if (input.canReceiveCare && input.carePendingCount > 0) {
    items.push({
      id: "care-pending",
      title:
        input.carePendingCount === 1
          ? "1 pedido de cuidado aguarda você"
          : `${input.carePendingCount} pedidos de cuidado aguardam você`,
      description: "Aconselhamento ou visita pastoral",
      href: AUTH_ROUTES.careRequests,
      icon: HeartHandshake,
      tone: "care",
    });
  }

  if (input.hasCommunicationAccess && input.announcementsUnreadCount > 0) {
    items.push({
      id: "announcements-unread",
      title:
        input.announcementsUnreadCount === 1
          ? "1 aviso novo no quadro"
          : `${input.announcementsUnreadCount} avisos novos no quadro`,
      description: "Comunicados que você ainda não abriu",
      href: AUTH_ROUTES.communication,
      icon: Megaphone,
      tone: "communication",
    });
  }

  if (
    input.canAccessActivities &&
    input.nextEvent &&
    items.length < MAX_PRIORITIES
  ) {
    const relative = formatRelativeEventDay(input.nextEvent.startsAt);
    const isSoon = relative === "Hoje" || relative === "Amanhã";

    if (isSoon || input.profile === "member" || items.length === 0) {
      items.push({
        id: "next-event",
        title: input.nextEvent.name,
        description: `${relative ?? "Em breve"} · próximo na agenda`,
        href: activityDetailPath(input.nextEvent.id),
        icon: Calendar,
        tone: "activities",
      });
    }
  }

  return items.slice(0, MAX_PRIORITIES);
}
