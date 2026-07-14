"use client";

import { Badge } from "@/components/ui/badge";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useGivingDonations } from "@/lib/api/queries";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  succeeded: "Confirmada",
  failed: "Falhou",
  canceled: "Cancelada",
  refunded: "Estornada",
};

function statusVariant(
  status: string,
): "success" | "outline" | "danger" | "secondary" {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
    case "canceled":
      return "danger";
    case "processing":
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
}

export function GivingDonationsPanel({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const donationsQuery = useGivingDonations();
  const donations = donationsQuery.data ?? [];

  if (donationsQuery.isPending) {
    return (
      <div className="space-y-3">
        {!embedded ? <Skeleton className="h-8 w-40" /> : null}
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (donationsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar as contribuições. Recarregue a página.
      </FormAlert>
    );
  }

  return (
    <div
      id="contribuicoes"
      className={cn("scroll-mt-24 space-y-4", embedded && "space-y-3")}
    >
      {!embedded ? (
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Contribuições</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entradas recentes por membros logados e links públicos.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Entradas recentes — membros logados e links públicos.
        </p>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {donations.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm leading-relaxed text-muted-foreground">
            Nenhuma contribuição ainda. Quando entrarem pagamentos, aparecem
            aqui.
          </li>
        ) : (
          donations.map((donation) => (
            <li
              key={donation.id}
              className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium tabular-nums text-foreground">
                    {formatCurrency(donation.amountCents / 100)}
                  </p>
                  <Badge variant={statusVariant(donation.status)}>
                    {STATUS_LABEL[donation.status] ?? donation.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {donation.fundName}
                  {donation.donorMemberName
                    ? ` · ${donation.donorMemberName}`
                    : donation.payerName
                      ? ` · ${donation.payerName}`
                      : ""}
                  {donation.donorMemberId ? " · membro" : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(donation.createdAt))}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
