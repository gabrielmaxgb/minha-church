"use client";

import { MinistriesListContent } from "@/components/dashboard/ministries/ministries-list-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function MinisteriosPage() {
  return (
    <DashboardPage
      title="Ministérios"
      subtitle="Áreas de serviço, cargos e equipes"
    >
      <MinistriesListContent />
    </DashboardPage>
  );
}
