"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function ComunicacaoPage() {
  return (
    <RequirePermission permission="communication">
      <DashboardPage title="Comunicação" subtitle="E-mails e avisos">
        <DashboardPlaceholder
          title="Comunicação em breve"
          description="Centralize avisos e comunicações com os membros a partir da igreja selecionada."
        />
      </DashboardPage>
    </RequirePermission>
  );
}
