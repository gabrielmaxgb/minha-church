"use client";

import { Suspense } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";

function SettingsPageContent() {
  return (
    <DashboardPage
      title="Configurações"
      subtitle="Perfil e preferências"
    >
      <SettingsContent />
    </DashboardPage>
  );
}

export default function ConfiguracoesPage() {
  return (
    <Suspense
      fallback={
        <DashboardPage title="Configurações" subtitle="Perfil e preferências">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </DashboardPage>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
