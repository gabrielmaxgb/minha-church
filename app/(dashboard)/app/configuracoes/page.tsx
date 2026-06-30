"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";

export default function ConfiguracoesPage() {
  return (
    <RequirePermission permission="settings">
      <DashboardPage
        title="Configurações"
        subtitle="Cargos, acessos e preferências da igreja"
      >
        <SettingsContent />
      </DashboardPage>
    </RequirePermission>
  );
}
