"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function FinancasPage() {
  return (
    <RequirePermission permission="finances">
      <DashboardPage title="Finanças" subtitle="Entradas, saídas e prestação de contas">
        <DashboardPlaceholder
          title="Módulo financeiro em breve"
          description="Controle entradas, saídas e relatórios financeiros com transparência para a liderança."
        />
      </DashboardPage>
    </RequirePermission>
  );
}
