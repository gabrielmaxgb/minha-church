"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { MinistriesListContent } from "@/components/dashboard/ministries/ministries-list-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function MinisteriosPage() {
  return (
    <RequirePermission permission="ministries">
      <DashboardPage
        title="Ministérios e Grupos de serviço"
        subtitle="Áreas de serviço, cargos e equipes"
      >
        <MinistriesListContent />
      </DashboardPage>
    </RequirePermission>
  );
}
