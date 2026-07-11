"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveAdultGateReason,
  type ActiveAdultGateReason,
} from "@/lib/care-requests/eligibility";
import { useMyMember } from "@/lib/api/queries";

interface RequireActiveAdultMemberProps {
  children: React.ReactNode;
  fallback?: (reason: Exclude<ActiveAdultGateReason, "allowed" | "loading">) => React.ReactNode;
}

const DEFAULT_MESSAGES: Record<
  Exclude<ActiveAdultGateReason, "allowed" | "loading">,
  { title: string; body: string }
> = {
  no_member: {
    title: "Cadastro pastoral necessário",
    body: "É preciso ter uma ficha pastoral vinculada à sua conta para usar Aconselhamentos e visitas.",
  },
  inactive: {
    title: "Disponível para membros ativos",
    body: "Somente membros com status ativo podem pedir aconselhamento ou visita por aqui.",
  },
  missing_birth_date: {
    title: "Complete sua data de nascimento",
    body: "Atualize a data de nascimento na sua ficha pastoral para liberar esta área (é necessário ter 18 anos ou mais).",
  },
  underage: {
    title: "Disponível a partir dos 18 anos",
    body: "Pedidos de aconselhamento e visita pelo app são liberados para membros ativos com 18 anos ou mais.",
  },
};

export function RequireActiveAdultMember({
  children,
  fallback,
}: RequireActiveAdultMemberProps) {
  const { data: member, isLoading, isError } = useMyMember({
    enabled: true,
  });

  const reason = getActiveAdultGateReason(member, {
    isLoading,
    isError,
  });

  if (reason === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (reason !== "allowed") {
    if (fallback) {
      return fallback(reason);
    }

    const message = DEFAULT_MESSAGES[reason];

    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="font-medium text-foreground">{message.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{message.body}</p>
      </div>
    );
  }

  return children;
}
