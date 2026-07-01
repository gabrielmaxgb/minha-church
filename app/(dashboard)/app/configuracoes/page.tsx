"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";

export default function ConfiguracoesPage() {
  return (
    <DashboardPage
      title="Configurações"
      subtitle="Perfil e preferências"
    >
      <SettingsContent />
    </DashboardPage>
  );
}
