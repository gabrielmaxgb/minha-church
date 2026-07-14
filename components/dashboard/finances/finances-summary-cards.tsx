"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentsSummary } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils";

export function FinancesSummaryCards({
  summary,
  isPending,
}: {
  summary: PaymentsSummary | undefined;
  isPending: boolean;
}) {
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

  const cards = [
    {
      label: "Fundos ativos",
      value: String(summary?.activeFundsCount ?? 0),
      hint: `${summary?.memberFundsCount ?? 0} membros · ${summary?.publicFundsCount ?? 0} públicos`,
    },
    {
      label: "Contribuições confirmadas",
      value: String(summary?.succeededDonationsCount ?? 0),
      hint: "Total histórico",
    },
    {
      label: "Últimos 30 dias",
      value: formatCurrency(
        (summary?.succeededAmountCentsLast30Days ?? 0) / 100,
      ),
      hint: "Valor recebido",
    },
    {
      label: "Situação",
      value: summary?.canReceivePayments ? "Recebendo" : "Inativo",
      hint: summary?.canReceivePayments
        ? "Conta pronta para cobranças"
        : "Ativação pendente",
    },
  ];

  return (
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
  );
}
