"use client";

import { ActivitiesContent } from "@/components/dashboard/activities-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function AtividadesPage() {
  return (
    <DashboardPage
      title="Atividades"
      subtitle="Calendário da igreja e agenda dos ministérios"
    >
      <ActivitiesContent />
    </DashboardPage>
  );
}
