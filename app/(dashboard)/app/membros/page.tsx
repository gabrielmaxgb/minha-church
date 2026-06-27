"use client";

import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function MembrosPage() {
  return (
    <DashboardPage title="Membros" subtitle="Cadastro e histórico pastoral">
      <DashboardPlaceholder
        title="Gestão de membros em breve"
        description="Cadastro, histórico pastoral e acompanhamento de afastados — carregados por igreja via JWT e header X-Church-Id."
      />
    </DashboardPage>
  );
}
