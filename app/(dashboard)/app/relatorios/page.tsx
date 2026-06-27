"use client";

import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function RelatoriosPage() {
  return (
    <DashboardPage title="Relatórios" subtitle="Indicadores e exportações">
      <DashboardPlaceholder
        title="Relatórios em breve"
        description="Dashboards, exportações e indicadores filtrados pelo tenant da igreja ativa."
      />
    </DashboardPage>
  );
}
