"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateKey } from "@/lib/events/calendar";
import {
  useFinanceEntriesSummary,
  usePaymentsSummary,
} from "@/lib/api/queries";
import { cn, formatCurrency } from "@/lib/utils";

function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: toDateKey(start),
    to: toDateKey(end),
  };
}

export function FinancesSummaryCards() {
  const monthRange = useMemo(() => currentMonthRange(), []);
  const summaryQuery = usePaymentsSummary();
  const ledgerSummary = useFinanceEntriesSummary(monthRange);

  const isPending = summaryQuery.isPending || ledgerSummary.isPending;
  const isRefreshing =
    !isPending && (summaryQuery.isFetching || ledgerSummary.isFetching);

  const handleRefresh = () => {
    void summaryQuery.refetch();
    void ledgerSummary.refetch();
  };

  if (isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  const summary = summaryQuery.data;
  const cards = [
    {
      label: "Entradas (mês)",
      value: formatCurrency(
        (ledgerSummary.data?.incomeCents ?? 0) / 100 +
          (ledgerSummary.data?.onlineDonationCents ?? 0) / 100 +
          (ledgerSummary.data?.eventTicketCents ?? 0) / 100,
      ),
      hint: "Manuais + contribuições + inscrições",
    },
    {
      label: "Saídas (mês)",
      value: formatCurrency((ledgerSummary.data?.expenseCents ?? 0) / 100),
      hint: "Só lançamentos manuais (gastos)",
    },
    {
      label: "Saldo (mês)",
      value: formatCurrency((ledgerSummary.data?.balanceCents ?? 0) / 100),
      hint: "Entradas menos saídas",
    },
    {
      label: "Fundos ativos",
      value: String(summary?.activeFundsCount ?? 0),
      hint: `${summary?.memberFundsCount ?? 0} membros · ${summary?.publicFundsCount ?? 0} públicos`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-muted-foreground"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Atualizar resumo"
          aria-label="Atualizar resumo"
        >
          <RefreshCw
            className={cn("size-3.5", isRefreshing && "animate-spin")}
            aria-hidden
          />
          <span className="text-xs">Atualizar</span>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card px-4 py-4"
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
