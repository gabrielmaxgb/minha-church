"use client";

import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function CultosPage() {
  return (
    <DashboardPage title="Cultos" subtitle="Cultos, eventos e escalas">
      <DashboardPlaceholder
        title="Agenda e escalas em breve"
        description="Organize cultos, eventos e escalas de voluntários sem depender de grupos de WhatsApp."
      />
    </DashboardPage>
  );
}
