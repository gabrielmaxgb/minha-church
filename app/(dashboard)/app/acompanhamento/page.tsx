"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { PastoralCareContent } from "@/components/dashboard/pastoral-care/pastoral-care-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function PastoralCarePage() {
  return (
    <RequirePermission permission="pastoralCare">
      <DashboardPage
        title="Acompanhamento"
        subtitle="Cuidado contínuo da comunidade"
      >
        <PastoralCareContent />
      </DashboardPage>
    </RequirePermission>
  );
}
