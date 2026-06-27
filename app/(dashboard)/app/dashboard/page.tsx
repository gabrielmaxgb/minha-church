"use client";

import {
  DashboardPlaceholder,
  StatCard,
} from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
import { useTenant } from "@/providers/auth-provider";
import { formatCurrency } from "@/lib/utils";

export default function DashboardHomePage() {
  const { church } = useTenant();
  const { data, isLoading } = useDashboardSummary();

  return (
    <DashboardPage title="Dashboard" subtitle="Visão geral da sua igreja">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/20 px-5 py-4">
          <p className="text-sm text-muted-foreground">Igreja ativa</p>
          <p className="mt-1 font-medium">{church?.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Os dados abaixo são carregados por tenant (
            <code className="rounded bg-muted px-1 py-0.5">{church?.id}</code>
            ).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Membros cadastrados"
                value={String(data?.memberCount ?? 0)}
              />
              <StatCard
                label="Membros ativos"
                value={String(data?.activeMembers ?? 0)}
                hint="Últimos 90 dias"
              />
              <StatCard
                label="Próximos eventos"
                value={String(data?.upcomingEvents ?? 0)}
              />
              <StatCard
                label="Saldo do mês"
                value={formatCurrency(data?.monthlyBalance ?? 0)}
              />
            </>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}
