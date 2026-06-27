"use client";

import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function FinancasPage() {
  return (
    <DashboardPage title="Finanças" subtitle="Entradas, saídas e prestação de contas">
      <DashboardPlaceholder
        title="Módulo financeiro em breve"
        description="Controle entradas, saídas e relatórios financeiros com transparência para a liderança."
      />
    </DashboardPage>
  );
}
