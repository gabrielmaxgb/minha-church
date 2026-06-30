"use client";

import { ActivitiesContent } from "@/components/dashboard/activities-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function AtividadesPage() {
  return (
    <DashboardPage title="Atividades" subtitle="Eventos e encontros por ministério">
      <ActivitiesContent />
    </DashboardPage>
  );
}
