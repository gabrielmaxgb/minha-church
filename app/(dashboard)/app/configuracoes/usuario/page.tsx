"use client";

import { Suspense } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";

function UserSettingsPageContent() {
  return (
    <DashboardPage
      title="Configurações do usuário"
      subtitle="Perfil, ministérios e grupos de serviço"
    >
      <SettingsContent area="user" />
    </DashboardPage>
  );
}

export default function ConfiguracoesUsuarioPage() {
  return (
    <Suspense
      fallback={
        <DashboardPage
          title="Configurações do usuário"
          subtitle="Perfil, ministérios e grupos de serviço"
        >
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </DashboardPage>
      }
    >
      <UserSettingsPageContent />
    </Suspense>
  );
}
