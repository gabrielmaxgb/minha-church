"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { CommunicationContent } from "@/components/dashboard/communication/communication-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function ComunicacaoPage() {
  return (
    <RequirePermission permission="communication">
      <DashboardPage
        title="Avisos"
        subtitle="Comunicados da igreja"
      >
        <CommunicationContent />
      </DashboardPage>
    </RequirePermission>
  );
}
