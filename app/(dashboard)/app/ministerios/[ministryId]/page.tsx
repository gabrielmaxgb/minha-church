"use client";

import { useParams } from "next/navigation";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MinistryDetailContent } from "@/components/dashboard/ministries/ministry-detail-content";
import { useMinistry } from "@/lib/api/queries";

export default function MinistryDetailPage() {
  const params = useParams();
  const ministryId = params.ministryId as string;
  const { data: ministry } = useMinistry(ministryId);

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
