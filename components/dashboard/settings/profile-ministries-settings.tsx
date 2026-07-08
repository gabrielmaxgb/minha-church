"use client";

import { useEffect, useRef } from "react";
import { UserCheck } from "lucide-react";

import { MemberMinistriesFunctionsSection } from "@/components/dashboard/members/member-ministries-functions-section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAckMinistryCatalogNotifications,
  useMyMember,
  useMyMinistryNotifications,
} from "@/lib/api/queries";
import { ministryNotificationDescription } from "@/lib/ministries/ministry-notifications";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

import { SettingsSectionHeader } from "./settings-shared";

export function ProfileMinistriesSettings() {
  const { data: member, isLoading, isError } = useMyMember();
  const { data: notifications } = useMyMinistryNotifications();
  const ackCatalog = useAckMinistryCatalogNotifications();
  const ackedCatalogRef = useRef<string>("");

  useEffect(() => {
    const ministryIds = notifications?.catalogUpdates.map((item) => item.ministryId) ?? [];

    if (ministryIds.length === 0 || ackCatalog.isPending) {
      return;
    }

    const signature = ministryIds.join("|");

    if (signature === ackedCatalogRef.current) {
      return;
    }

    ackedCatalogRef.current = signature;
    ackCatalog.mutate(ministryIds);
  }, [notifications?.catalogUpdates, ackCatalog.mutate]);

  const showBanner = (notifications?.summary.totalCount ?? 0) > 0;

  return (
    <div>
      <SettingsSectionHeader
        title="Ministérios"
        description="Escolha em quais funções você pode servir em cada ministério."
      />

      {showBanner && notifications ? (
        <div className={cn(pendingNotificationStyles.banner.compact, "mb-4")}>
          <p className="text-sm font-medium text-foreground">
            {notifications.summary.needsFunctionsCount > 0
              ? "Complete seu perfil nos ministérios"
              : "Funções de serviço atualizadas"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ministryNotificationDescription(notifications)}
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : isError || !member ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
          Não foi possível carregar seus vínculos com ministérios.
        </div>
      ) : member.ministries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <UserCheck className="size-4" aria-hidden />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Você ainda não participa de nenhum ministério nesta igreja.
          </p>
        </div>
      ) : (
        <MemberMinistriesFunctionsSection
          memberId={member.id}
          ministries={member.ministries}
          editable
        />
      )}
    </div>
  );
}
