"use client";

import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function ComunicacaoPage() {
  return (
    <DashboardPage title="Comunicação" subtitle="E-mails e avisos">
      <DashboardPlaceholder
        title="Comunicação em breve"
        description="Centralize avisos e comunicações com os membros a partir da igreja selecionada."
      />
    </DashboardPage>
  );
}
