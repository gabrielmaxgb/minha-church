"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { GivingDonationsPanel } from "@/components/dashboard/finances/giving-donations-panel";
import { MemberExpandedPanel } from "@/components/dashboard/members/member-expanded-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMember } from "@/lib/api/queries";
import { canManageMembers } from "@/lib/permissions";
import { memberStatusBadgeClass } from "@/lib/members/status-badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { MEMBER_STATUS_LABELS } from "@/types/members";

interface MemberDetailContentProps {
  memberId: string;
}

export function MemberDetailContent({ memberId }: MemberDetailContentProps) {
  const router = useRouter();
  const { permissions, user } = useAuth();
  const canManage = permissions ? canManageMembers(permissions) : false;
  const canSeeContributions = Boolean(
    user?.isOwner ||
      permissions?.finances.access ||
      permissions?.finances.manage,
  );
  const { data: member, isLoading, isError, error } = useMember(memberId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="space-y-4">
        <Link
          href={AUTH_ROUTES.members}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para membros
        </Link>

        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar o cadastro."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={AUTH_ROUTES.members}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para membros
      </Link>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                {member.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Ficha pastoral e vínculos na igreja
              </CardDescription>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium",
                memberStatusBadgeClass(member.status),
              )}
            >
              {MEMBER_STATUS_LABELS[member.status]}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <MemberExpandedPanel
            member={member}
            canManage={canManage}
            onDeleted={() => router.push(AUTH_ROUTES.members)}
          />
        </CardContent>
      </Card>

      {canSeeContributions ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Contribuições
            </CardTitle>
            <CardDescription>
              Histórico de doações online deste membro nesta igreja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GivingDonationsPanel embedded memberId={memberId} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
