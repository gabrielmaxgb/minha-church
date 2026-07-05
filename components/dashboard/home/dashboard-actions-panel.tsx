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
  canCreateAnyActivity,
  canManageMembers,
  canManageMinistries,
} from "@/lib/permissions";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";
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
  const canManageMemberships = canManageChurchMemberships(permissions);

  const attentionItems = [
    pendingAccessCount > 0 && canManageMemberships
      ? {
          label: `${pendingAccessCount} acesso${pendingAccessCount > 1 ? "s" : ""} pendente${pendingAccessCount > 1 ? "s" : ""}`,
          description: "Usuários aguardando aprovação na igreja",
          href: settingsSectionPath("pending-users"),
          icon: Users,
        }
      : null,
    passwordResetCount > 0 && canManageMemberships
      ? {
          label: `${passwordResetCount} pedido${passwordResetCount > 1 ? "s" : ""} de senha`,
          description: "Membros solicitaram redefinição de senha",
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

  if (permissions && canCreateAnyActivity(permissions)) {
    quickActions.push({
      label: "Nova atividade",
      description: "Evento ou encontro",
      onClick: onCreateActivity,
      icon: Calendar,
    });
  }

  if (permissions && canManageMinistries(permissions)) {
    quickActions.push({
      label: "Ministérios",
      description: "Equipes e cargos",
      href: AUTH_ROUTES.ministries,
      icon: Layers,
    });
  }

  quickActions.push({
    label: "Ver membros",
    description: "Lista completa",
    href: AUTH_ROUTES.members,
    icon: Users,
  });

  return (
    <div className="space-y-4">
      {attentionItems.length > 0 && (
        <section className={pendingNotificationStyles.banner.section}>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle
              className={cn("size-4", pendingNotificationStyles.icon.section)}
              aria-hidden
            />
            <h2 className="font-display text-sm font-semibold tracking-tight">
              Requer atenção
            </h2>
          </div>
          <ul className="space-y-2">
            {attentionItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pendingNotificationStyles.banner.item}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      pendingNotificationStyles.icon.sm,
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
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

      <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
        <h2 className="font-display text-sm font-semibold tracking-tight">
          Ações rápidas
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Atalhos para o dia a dia da liderança.
        </p>

        <ul className="mt-4 space-y-1.5">
          {quickActions.map((action) => {
            const content = (
              <>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-foreground/80",
                  )}
                >
                  <action.icon className="size-4" strokeWidth={1.75} />
                </span>
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
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50"
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
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ul>

        {permissions?.finances.access && (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-muted/15 px-3 py-3">
            <p className="text-xs font-medium text-foreground">Finanças</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Módulo em desenvolvimento — em breve você acompanha saldo e
              movimentações aqui.
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto p-0 text-xs"
              asChild
            >
              <Link href={AUTH_ROUTES.finances}>Saiba mais</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
