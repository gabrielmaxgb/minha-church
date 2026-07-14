"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
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
  { shell: string; icon: string; chevron: string }
> = {
  members: {
    shell:
      "border-domain-members/25 bg-domain-members-subtle/70 hover:border-domain-members/45 hover:bg-domain-members-subtle",
    icon: "bg-domain-members/20 text-domain-members-foreground group-hover:bg-domain-members/30",
    chevron: "text-domain-members-foreground/55 group-hover:text-domain-members-foreground",
  },
  activities: {
    shell:
      "border-domain-activities/25 bg-domain-activities-subtle/70 hover:border-domain-activities/45 hover:bg-domain-activities-subtle",
    icon: "bg-domain-activities/20 text-domain-activities-foreground group-hover:bg-domain-activities/30",
    chevron:
      "text-domain-activities-foreground/55 group-hover:text-domain-activities-foreground",
  },
  communication: {
    shell:
      "border-domain-communication/25 bg-domain-communication-subtle/70 hover:border-domain-communication/45 hover:bg-domain-communication-subtle",
    icon: "bg-domain-communication/20 text-domain-communication-foreground group-hover:bg-domain-communication/30",
    chevron:
      "text-domain-communication-foreground/55 group-hover:text-domain-communication-foreground",
  },
  ministries: {
    shell:
      "border-domain-ministries/25 bg-domain-ministries-subtle/70 hover:border-domain-ministries/45 hover:bg-domain-ministries-subtle",
    icon: "bg-domain-ministries/20 text-domain-ministries-foreground group-hover:bg-domain-ministries/30",
    chevron:
      "text-domain-ministries-foreground/55 group-hover:text-domain-ministries-foreground",
  },
  finances: {
    shell:
      "border-domain-finances/25 bg-domain-finances-subtle/70 hover:border-domain-finances/45 hover:bg-domain-finances-subtle",
    icon: "bg-domain-finances/20 text-domain-finances-foreground group-hover:bg-domain-finances/30",
    chevron:
      "text-domain-finances-foreground/55 group-hover:text-domain-finances-foreground",
  },
  care: {
    shell:
      "border-border bg-card hover:border-foreground/20 hover:bg-muted/50",
    icon: "bg-muted text-foreground group-hover:bg-muted/80",
    chevron: "text-muted-foreground/60 group-hover:text-foreground",
  },
  schedules: {
    shell:
      "border-attention-border bg-attention-subtle/80 hover:border-attention/50 hover:bg-attention-subtle",
    icon: "bg-attention-mark text-attention-foreground group-hover:bg-attention/25",
    chevron: "text-attention-foreground/55 group-hover:text-attention-foreground",
  },
  neutral: {
    shell:
      "border-border bg-card hover:border-foreground/20 hover:bg-muted/50",
    icon: "bg-muted text-foreground group-hover:bg-muted/80",
    chevron: "text-muted-foreground/60 group-hover:text-foreground",
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
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {visibleActions.map((action) => {
          const styles = toneStyles[action.tone];
          const content = (
            <>
              <span
                className={cn(
                  "relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  styles.icon,
                )}
              >
                <action.icon className="size-4" aria-hidden strokeWidth={2.25} />
                {action.badge != null ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-attention px-1 text-[10px] font-semibold text-white">
                    {action.badge > 9 ? "9+" : action.badge}
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                  styles.chevron,
                )}
                aria-hidden
              />
            </>
          );

          const className = cn(
            "group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left shadow-xs",
            "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
            "hover:-translate-y-px hover:shadow-sm",
            "active:translate-y-0 active:scale-[0.98] active:shadow-xs",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            styles.shell,
            action.disabled &&
              "pointer-events-none cursor-not-allowed opacity-50 shadow-none",
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
