"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { FinancialReportPanel } from "@/components/dashboard/reports/financial-report-panel";

export default function RelatoriosPage() {
  return (
    <RequirePermission permission="reports">
      <DashboardPage
        title="Relatórios"
        subtitle="Prestação de contas para a liderança"
      >
        <div className="space-y-7">
          <DashboardPageIntro
            eyebrow="Prestação de contas"
            title="Relatórios"
            description="Receitas e despesas por conta — pronto para assembleia, conselho ou reunião de líderes."
            domain="reports"
          />
          <FinancialReportPanel />
        </div>
      </DashboardPage>
    </RequirePermission>
  );
}
