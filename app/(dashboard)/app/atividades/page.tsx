"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { ActivitiesContent } from "@/components/dashboard/activities-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function AtividadesPage() {
  return (
    <RequirePermission permission="activities">
      <DashboardPage
        title="Eventos"
        subtitle="Calendário da igreja e agenda dos ministérios"
      >
        <ActivitiesContent />
      </DashboardPage>
    </RequirePermission>
  );
}
