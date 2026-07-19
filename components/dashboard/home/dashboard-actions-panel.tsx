"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ChevronRight,
  KeyRound,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";

import {
  AUTH_ROUTES,
  MEMBER_CREATE_ROUTE,
  settingsSectionPath,
} from "@/constants/routes";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import type { DashboardHomeProfile } from "@/lib/dashboard/home-profile";
import {
  canAccessSchedules,
  canCreateAnyActivity,
  canManageCommunication,
  canManageMembers,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import type { ProductDomain } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardQuickActionsProps {
  profile: DashboardHomeProfile;
  onCreateActivity: () => void;
}

interface QuickAction {
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  domain: ProductDomain;
  disabled?: boolean;
}

const domainIconShell: Record<ProductDomain, string> = {
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

/**
 * No máximo 4 atalhos — tarefas diárias da secretaria.
 * Pendências (escala, aconselhamento) ficam em Prioridades, não aqui.
 */
export function DashboardQuickActions({
  profile,
  onCreateActivity,
}: DashboardQuickActionsProps) {
  const { permissions, user } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();

  const actions: QuickAction[] = [];

  if (profile === "member") {
    if (canAccessSchedules(permissions)) {
      actions.push({
        label: "Ver agenda",
        description: "Sua escala e disponibilidade",
        href: AUTH_ROUTES.mySchedules,
        icon: CalendarDays,
        domain: "schedules",
      });
    }
    if (permissions?.communication.access) {
      actions.push({
        label: "Comunicados",
        description: "Mensagens oficiais da igreja",
        href: AUTH_ROUTES.communication,
        icon: Megaphone,
        domain: "communication",
      });
    }
  } else {
    if (permissions && canManageMembers(permissions)) {
      actions.push({
        label: "Cadastrar membro",
        description: "Novo cadastro pastoral",
        href: MEMBER_CREATE_ROUTE,
        icon: UserPlus,
        domain: "members",
      });
    }

    if (permissions && canCreateAnyActivity(permissions)) {
      actions.push({
        label: "Criar evento",
        description: "Culto, ensaio ou encontro",
        onClick: onCreateActivity,
        icon: Calendar,
        domain: "activities",
        disabled: writesBlocked,
      });
    }

    if (canManageCommunication(permissions, Boolean(user?.isOwner))) {
      actions.push({
        label: "Publicar comunicado",
        description: "Comunicado para a igreja",
        href: AUTH_ROUTES.communication,
        icon: Megaphone,
        domain: "communication",
        disabled: writesBlocked,
      });
    }

    if (canAccessSchedules(permissions)) {
      actions.push({
        label: "Ver agenda",
        description: "Escalas e próximos encontros",
        href: AUTH_ROUTES.mySchedules,
        icon: CalendarDays,
        domain: "schedules",
      });
    } else if (permissions?.activities.access) {
      actions.push({
        label: "Ver agenda",
        description: "Eventos da igreja",
        href: AUTH_ROUTES.activities,
        icon: CalendarDays,
        domain: "activities",
      });
    }
  }

  const visibleActions = actions.slice(0, 4);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h2 className="text-base font-medium text-foreground">Faça agora</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {profile === "member"
            ? "Atalhos do seu dia na igreja"
            : "As tarefas mais comuns da secretaria"}
        </p>
      </div>
      <ul
        className={cn(
          "grid gap-2.5",
          visibleActions.length === 1
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {visibleActions.map((action) => {
          const content = (
            <>
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  domainIconShell[action.domain],
                )}
              >
                <action.icon className="size-5" aria-hidden strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-base font-semibold tracking-tight text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ChevronRight
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </>
          );

          const className = cn(
            "group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left",
            "transition-[transform,background-color,border-color] duration-200 ease-out",
            "hover:border-foreground/20 hover:bg-muted/40",
            "active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            action.disabled &&
              "pointer-events-none cursor-not-allowed opacity-50",
          );

          if (action.href) {
            return (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className={className}
                  aria-disabled={action.disabled || undefined}
                  tabIndex={action.disabled ? -1 : undefined}
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={action.label}>
              <button
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={className}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface DashboardAttentionPanelProps {
  pendingAccessCount: number;
  passwordResetCount: number;
}

export function DashboardAttentionPanel({
  pendingAccessCount,
  passwordResetCount,
}: DashboardAttentionPanelProps) {
  const { permissions } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();
  const canManageMemberships = canManageChurchMemberships(permissions);

  const attentionItems = [
    !writesBlocked && pendingAccessCount > 0 && canManageMemberships
      ? {
          label: `${pendingAccessCount} acesso${pendingAccessCount > 1 ? "s" : ""} pendente${pendingAccessCount > 1 ? "s" : ""}`,
          description: "Usuários aguardando aprovação",
          href: settingsSectionPath("pending-users"),
          icon: Users,
        }
      : null,
    !writesBlocked && passwordResetCount > 0 && canManageMemberships
      ? {
          label: `${passwordResetCount} pedido${passwordResetCount > 1 ? "s" : ""} de senha`,
          description: "Redefinição solicitada",
          href: settingsSectionPath("password-reset-requests"),
          icon: KeyRound,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (attentionItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-attention-border bg-attention-subtle">
      <div className="flex items-center gap-2 border-b border-attention-border/60 px-4 py-3">
        <AlertCircle className="size-4 text-attention-foreground" aria-hidden />
        <h2 className="text-sm font-medium text-foreground">
          Precisa da sua atenção
        </h2>
      </div>
      <ul className="p-1.5">
        {attentionItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-11 items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-card/60"
            >
              <item.icon className="size-4 shrink-0 text-attention-foreground" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** @deprecated Use DashboardQuickActions */
export const DashboardActionsPanel = DashboardQuickActions;
