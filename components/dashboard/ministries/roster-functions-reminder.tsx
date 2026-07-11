"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ClipboardList, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { settingsSectionPath } from "@/constants/routes";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

interface RosterFunctionsReminderProps {
  ministryId: string;
  ministryName: string;
  className?: string;
  compact?: boolean;
}

function ReminderActionButton({
  href,
  size,
  variant,
  className,
  children,
}: {
  href: string;
  size?: "sm" | "lg";
  variant?: "default" | "outline";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button size={size} variant={variant} className={className} asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function RosterFunctionsReminder({
  ministryId: _ministryId,
  ministryName,
  className,
  compact = false,
}: RosterFunctionsReminderProps) {
  const href = settingsSectionPath("ministries");

  if (compact) {
    return (
      <div className={cn(pendingNotificationStyles.banner.compact, className)}>
        <p className="text-sm font-medium text-foreground">
          Cadastre suas funções na escala
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Em <span className="font-medium text-foreground">{ministryName}</span>,
          configure suas funções em Configurações → Ministérios para responder
          disponibilidade.
        </p>
        <ReminderActionButton
          href={href}
          size="sm"
          variant="outline"
          className="mt-3"
        >
          Configurar funções
          <ChevronRight className="size-4" />
        </ReminderActionButton>
      </div>
    );
  }

  return (
    <div className={cn(pendingNotificationStyles.banner.full, className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className={pendingNotificationStyles.icon.md}>
            <ClipboardList className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={pendingNotificationStyles.label}>
              Perfil da escala incompleto
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Adicione pelo menos uma função
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Você participa de{" "}
              <span className="font-medium text-foreground">{ministryName}</span>,
              mas ainda não informou como costuma servir. Sem isso, o líder não
              consegue atribuir sua função na escala.
            </p>
          </div>
        </div>
        <ReminderActionButton href={href} size="lg" className="shrink-0">
          Cadastrar funções
          <ChevronRight className="size-4" />
        </ReminderActionButton>
      </div>
    </div>
  );
}
