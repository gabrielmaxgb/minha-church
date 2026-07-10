"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Calendar,
  KeyRound,
  Layers,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AUTH_ROUTES,
  MEMBER_CREATE_ROUTE,
  settingsSectionPath,
} from "@/constants/routes";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import {
  canAccessMembers,
  canCreateAnyActivity,
  canManageMembers,
  canManageMinistries,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { useAuth } from "@/providers/auth-provider";

interface DashboardActionsPanelProps {
  pendingAccessCount: number;
  passwordResetCount: number;
  onCreateActivity: () => void;
}

interface QuickAction {
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
}

export function DashboardActionsPanel({
  pendingAccessCount,
  passwordResetCount,
  onCreateActivity,
}: DashboardActionsPanelProps) {
  const { permissions } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();
  const canManageMemberships = canManageChurchMemberships(permissions);
  const canSeeMembers = canAccessMembers(permissions);

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

  const quickActions: QuickAction[] = [];

  if (permissions && canManageMembers(permissions)) {
    quickActions.push({
      label: "Cadastrar membro",
      description: "Novo cadastro pastoral",
      href: MEMBER_CREATE_ROUTE,
      icon: UserPlus,
    });
  }

  if (permissions && canCreateAnyActivity(permissions) && !writesBlocked) {
    quickActions.push({
      label: "Nova atividade",
      description: "Evento ou encontro",
      onClick: onCreateActivity,
      icon: Calendar,
    });
  }

  if (permissions && canManageMinistries(permissions) && !writesBlocked) {
    quickActions.push({
      label: "Ministérios",
      description: "Equipes e cargos",
      href: AUTH_ROUTES.ministries,
      icon: Layers,
    });
  }

  if (canSeeMembers) {
    quickActions.push({
      label: "Ver membros",
      description: "Cadastro da igreja",
      href: AUTH_ROUTES.members,
      icon: Users,
    });
  }

  const showFinancesTeaser = permissions?.finances.access ?? false;

  if (
    attentionItems.length === 0 &&
    quickActions.length === 0 &&
    !showFinancesTeaser
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      {attentionItems.length > 0 && (
        <section className="rounded-lg border border-attention-border bg-attention-subtle">
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
      )}

      {quickActions.length > 0 && (
        <section className="rounded-lg border border-border/80 bg-card">
          <div className="border-b border-border/80 px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Atalhos</h2>
          </div>
          <ul className="p-1.5">
            {quickActions.map((action) => {
              const content = (
                <>
                  <action.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium text-foreground">
                      {action.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                </>
              );

              if (action.href) {
                return (
                  <li key={action.label}>
                    <Link
                      href={action.href}
                      className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-muted/60"
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
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    {content}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showFinancesTeaser && (
        <section className="rounded-lg border border-border bg-card px-4 py-3.5">
          <p className="text-sm font-medium text-foreground">Finanças</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Módulo em desenvolvimento.
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0 text-xs"
            asChild
          >
            <Link href={AUTH_ROUTES.finances}>Saiba mais</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
