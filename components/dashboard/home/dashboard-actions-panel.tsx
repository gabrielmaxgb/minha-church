"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Calendar,
  HeartHandshake,
  KeyRound,
  Layers,
  Megaphone,
  UserPlus,
  Users,
  Wallet,
  ClipboardList,
} from "lucide-react";

import {
  AUTH_ROUTES,
  MEMBER_CREATE_ROUTE,
  settingsSectionPath,
} from "@/constants/routes";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import {
  canAccessMembers,
  canAccessSchedules,
  canCreateAnyActivity,
  canListMinistries,
  canManageCommunication,
  canManageMembers,
} from "@/lib/permissions";
import type { DashboardHomeProfile } from "@/lib/dashboard/home-profile";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardQuickActionsProps {
  profile: DashboardHomeProfile;
  onCreateActivity: () => void;
  carePendingCount?: number;
  schedulePendingCount?: number;
}

interface QuickAction {
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  tone: "members" | "activities" | "communication" | "ministries" | "finances" | "care" | "schedules" | "neutral";
  badge?: number;
  disabled?: boolean;
}

const toneStyles: Record<
  QuickAction["tone"],
  { shell: string; icon: string }
> = {
  members: {
    shell:
      "border-domain-members/20 bg-gradient-to-br from-domain-members-subtle/80 via-card to-card hover:border-domain-members/35",
    icon: "bg-domain-members/15 text-domain-members-foreground",
  },
  activities: {
    shell:
      "border-domain-activities/20 bg-gradient-to-br from-domain-activities-subtle/80 via-card to-card hover:border-domain-activities/35",
    icon: "bg-domain-activities/15 text-domain-activities-foreground",
  },
  communication: {
    shell:
      "border-domain-communication/20 bg-gradient-to-br from-domain-communication-subtle/80 via-card to-card hover:border-domain-communication/35",
    icon: "bg-domain-communication/15 text-domain-communication-foreground",
  },
  ministries: {
    shell:
      "border-domain-ministries/20 bg-gradient-to-br from-domain-ministries-subtle/80 via-card to-card hover:border-domain-ministries/35",
    icon: "bg-domain-ministries/15 text-domain-ministries-foreground",
  },
  finances: {
    shell:
      "border-domain-finances/20 bg-gradient-to-br from-domain-finances-subtle/80 via-card to-card hover:border-domain-finances/35",
    icon: "bg-domain-finances/15 text-domain-finances-foreground",
  },
  care: {
    shell:
      "border-border/80 bg-card hover:border-border hover:bg-muted/40",
    icon: "bg-muted text-foreground",
  },
  schedules: {
    shell:
      "border-attention-border bg-gradient-to-br from-attention-subtle/80 via-card to-card hover:border-attention/40",
    icon: "bg-attention-mark text-attention-foreground",
  },
  neutral: {
    shell: "border-border/80 bg-card hover:bg-muted/40",
    icon: "bg-muted text-foreground",
  },
};

export function DashboardQuickActions({
  profile,
  onCreateActivity,
  carePendingCount = 0,
  schedulePendingCount = 0,
}: DashboardQuickActionsProps) {
  const { permissions, user } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();
  const canSeeMembers = canAccessMembers(permissions);
  const canReceiveCare =
    Boolean(user?.isOwner) || Boolean(permissions?.counseling?.receive);

  const actions: QuickAction[] = [];

  if (profile !== "member" && permissions && canManageMembers(permissions)) {
    actions.push({
      label: "Cadastrar membro",
      description: "Novo cadastro pastoral",
      href: MEMBER_CREATE_ROUTE,
      icon: UserPlus,
      tone: "members",
    });
  }

  if (canSeeMembers && profile !== "member") {
    actions.push({
      label: "Ver membros",
      description: "Cadastro da igreja",
      href: AUTH_ROUTES.members,
      icon: Users,
      tone: "members",
    });
  }

  if (
    profile !== "member" &&
    permissions &&
    canCreateAnyActivity(permissions)
  ) {
    actions.push({
      label: "Nova atividade",
      description: "Evento ou encontro",
      onClick: onCreateActivity,
      icon: Calendar,
      tone: "activities",
      disabled: writesBlocked,
    });
  }

  if (
    profile !== "member" &&
    canManageCommunication(permissions, Boolean(user?.isOwner))
  ) {
    actions.push({
      label: "Novo comunicado",
      description: "Aviso para a igreja",
      href: AUTH_ROUTES.communication,
      icon: Megaphone,
      tone: "communication",
      disabled: writesBlocked,
    });
  } else if (permissions?.communication.access) {
    actions.push({
      label: "Quadro de avisos",
      description: "Comunicados da igreja",
      href: AUTH_ROUTES.communication,
      icon: Megaphone,
      tone: "communication",
    });
  }

  if (profile !== "member" && canListMinistries(permissions)) {
    actions.push({
      label: "Ministérios",
      description: "Equipes e cargos",
      href: AUTH_ROUTES.ministries,
      icon: Layers,
      tone: "ministries",
    });
  }

  if (profile !== "member" && permissions?.finances.access) {
    actions.push({
      label: "Finanças",
      description: "Recebimentos e doações",
      href: AUTH_ROUTES.finances,
      icon: Wallet,
      tone: "finances",
    });
  }

  if (canReceiveCare && profile !== "member") {
    actions.push({
      label: "Aconselhamentos",
      description:
        carePendingCount > 0
          ? `${carePendingCount} pendente${carePendingCount === 1 ? "" : "s"}`
          : "Pedidos e visitas",
      href: AUTH_ROUTES.careRequests,
      icon: HeartHandshake,
      tone: "care",
      badge: carePendingCount > 0 ? carePendingCount : undefined,
    });
  }

  if (canAccessSchedules(permissions)) {
    actions.push({
      label: "Escalas",
      description:
        schedulePendingCount > 0
          ? `${schedulePendingCount} aguardando você`
          : "Sua disponibilidade",
      href: AUTH_ROUTES.mySchedules,
      icon: ClipboardList,
      tone: "schedules",
      badge: schedulePendingCount > 0 ? schedulePendingCount : undefined,
    });
  }

  const maxActions = profile === "member" ? 4 : profile === "leader" ? 6 : 8;
  const visibleActions = actions.slice(0, maxActions);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">Ações rápidas</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {profile === "member"
            ? "Atalhos do seu dia na igreja"
            : "Atalhos do dia a dia da igreja"}
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {visibleActions.map((action) => {
          const styles = toneStyles[action.tone];
          const content = (
            <>
              <span
                className={cn(
                  "relative flex size-9 shrink-0 items-center justify-center rounded-lg",
                  styles.icon,
                )}
              >
                <action.icon className="size-4" aria-hidden />
                {action.badge != null ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-attention px-1 text-[10px] font-semibold text-white">
                    {action.badge > 9 ? "9+" : action.badge}
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-foreground">
                  {action.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </>
          );

          const className = cn(
            "flex w-full items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
            styles.shell,
            action.disabled && "pointer-events-none opacity-50",
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
              className="flex items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-card/60"
            >
              <item.icon className="size-4 shrink-0 text-attention-foreground" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="block text-xs text-muted-foreground">
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
