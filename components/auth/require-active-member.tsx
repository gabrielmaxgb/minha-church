"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveMemberGateReason,
  type ActiveMemberGateReason,
} from "@/lib/members/active-member-eligibility";
import { useMyMember } from "@/lib/api/queries";
import { useAuth } from "@/providers/auth-provider";

interface RequireActiveMemberProps {
  children: React.ReactNode;
  fallback?: (
    reason: Exclude<ActiveMemberGateReason, "allowed" | "loading">,
  ) => React.ReactNode;
}

const DEFAULT_MESSAGES: Record<
  Exclude<ActiveMemberGateReason, "allowed" | "loading">,
  { title: string; body: string }
> = {
  no_member: {
    title: "Cadastro pastoral necessário",
    body: "É preciso ter uma ficha pastoral vinculada à sua conta para usar esta área.",
  },
  inactive: {
    title: "Disponível para membros ativos",
    body: "Somente membros com status ativo podem acessar esta área.",
  },
};

export function RequireActiveMember({
  children,
  fallback,
}: RequireActiveMemberProps) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.isOwner);
  const { data: member, isLoading, isError } = useMyMember({
    enabled: !isOwner,
  });

  if (isOwner) {
    return children;
  }

  const reason = getActiveMemberGateReason(member, {
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
