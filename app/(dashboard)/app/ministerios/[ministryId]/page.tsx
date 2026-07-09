"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MinistryDetailContent } from "@/components/dashboard/ministries/ministry-detail-content";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMinistry } from "@/lib/api/queries";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";

export default function MinistryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ministryId = params.ministryId as string;
  const { locked } = useFeatureLock();
  const { data: ministry } = useMinistry(ministryId);

  useEffect(() => {
    if (locked) {
      router.replace(AUTH_ROUTES.ministries);
    }
  }, [locked, router]);

  if (locked) {
    return (
      <RequirePermission permission="ministries">
        <DashboardPage title="Ministérios" subtitle="Redirecionando...">
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </DashboardPage>
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="ministries">
      <DashboardPage
        title={ministry?.name ?? "Ministério"}
        subtitle="Configurações do ministério"
        className="max-w-5xl"
      >
        <MinistryDetailContent ministryId={ministryId} />
      </DashboardPage>
    </RequirePermission>
  );
}
