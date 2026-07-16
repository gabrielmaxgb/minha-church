"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Undo2 } from "lucide-react";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import type { GivingDonation } from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useExportGivingDonations,
  useGivingDonations,
  useGivingFunds,
  useRefundGivingDonation,
} from "@/lib/api/queries";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  succeeded: "Confirmada",
  failed: "Falhou",
  canceled: "Cancelada",
  refunded: "Estornada",
};

const PAGE_SIZE = 20;

function statusVariant(
  status: string,
): "success" | "outline" | "danger" | "secondary" {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
    case "canceled":
    case "refunded":
      return "danger";
    case "processing":
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
}

function donorLabel(donation: GivingDonation): string {
  if (donation.donorMemberName) {
    return donation.donorMemberName;
  }
  if (donation.payerName) {
    return donation.payerName;
  }
  return "Doador não identificado";
}

export function GivingDonationsPanel({
  embedded = false,
  memberId,
}: {
  embedded?: boolean;
  /** Quando informado, lista só contribuições daquele membro. */
  memberId?: string;
}) {
  const [page, setPage] = useState(1);
  const [fundId, setFundId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [donationToRefund, setDonationToRefund] =
    useState<GivingDonation | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      fundId: fundId || undefined,
      status: status || undefined,
      from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      memberId: memberId || undefined,
    }),
    [page, fundId, status, from, to, memberId],
  );

  const donationsQuery = useGivingDonations(params);
  const fundsQuery = useGivingFunds({ enabled: !memberId });
  const refundMutation = useRefundGivingDonation();
  const exportMutation = useExportGivingDonations();

  const list = donationsQuery.data;
  const donations = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleConfirmRefund() {
    if (!donationToRefund) {
      return;
    }

    try {
      await refundMutation.mutateAsync(donationToRefund.id);
      setDonationToRefund(null);
    } catch {
      // Erro já aparece no FormAlert via refundMutation.isError
    }
  }

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Contribuições
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entradas online por membros e links públicos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exportMutation.isPending || donations.length === 0}
            onClick={() => exportMutation.mutate(params)}
          >
            {exportMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Exportar CSV
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {memberId
              ? "Contribuições deste membro."
              : "Entradas recentes — membros logados e links públicos."}
          </p>
          {!memberId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending || donations.length === 0}
              onClick={() => exportMutation.mutate(params)}
            >
              {exportMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              CSV
            </Button>
          ) : null}
        </div>
      )}

      {!memberId ? (
        <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            Fundo
            <SelectField
              value={fundId}
              onChange={(event) => {
                setFundId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {(fundsQuery.data ?? []).map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}
                </option>
              ))}
            </SelectField>
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            Status
            <SelectField
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            De
            <DatePicker
              value={from}
              onChange={(dateKey) => {
                setFrom(dateKey);
                setPage(1);
              }}
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            Até
            <DatePicker
              value={to}
              onChange={(dateKey) => {
                setTo(dateKey);
                setPage(1);
              }}
            />
          </label>
        </div>
      ) : null}

      {(refundMutation.isError || exportMutation.isError) && (
        <FormAlert>
          {resolvePaymentsError(
            refundMutation.error ?? exportMutation.error,
            "Não foi possível concluir a ação.",
          )}
        </FormAlert>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {donations.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
            Nenhuma contribuição neste filtro.
          </li>
        ) : (
          donations.map((donation) => (
            <li
              key={donation.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCurrency(donation.amountCents / 100)}
                  </p>
                  <Badge variant={statusVariant(donation.status)}>
                    {STATUS_LABEL[donation.status] ?? donation.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="text-foreground/80">{donation.fundName}</span>
                  {" · "}
                  {donorLabel(donation)}
                  {donation.donorMemberId ? (
                    <span className="text-muted-foreground/80"> · membro</span>
                  ) : (
                    <span className="text-muted-foreground/80"> · público</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(donation.createdAt))}
                </p>
              </div>
              {donation.status === "succeeded" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-800"
                  disabled={refundMutation.isPending}
                  onClick={() => setDonationToRefund(donation)}
                >
                  <Undo2 className="size-3.5" />
                  Estornar
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {total} contribuição{total === 1 ? "" : "ões"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      {donationToRefund ? (
        <FinanceConfirmDialog
          title="Estornar esta contribuição?"
          tone="warning"
          icon={Undo2}
          description={
            <div className="space-y-3">
              <p>
                O Stripe devolve este valor ao contribuidor no{" "}
                <span className="font-medium text-foreground">
                  mesmo meio de pagamento
                </span>{" "}
                usado na contribuição (cartão, Pix ou boleto). No cartão, a
                devolução aparece no extrato em alguns dias úteis; no Pix, costuma
                ser mais rápido.
              </p>
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(donationToRefund.amountCents / 100)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {donationToRefund.fundName} · {donorLabel(donationToRefund)}
                </p>
              </div>
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                <li>
                  O valor sai do saldo da igreja na conta Stripe Connect.
                </li>
                <li>
                  A contribuição passa a aparecer como{" "}
                  <span className="font-medium text-foreground">Estornada</span>{" "}
                  no histórico.
                </li>
                <li>Esta ação não pode ser desfeita pelo painel.</li>
              </ul>
            </div>
          }
          confirmLabel="Confirmar estorno"
          confirmingLabel="Estornando..."
          isPending={refundMutation.isPending}
          onCancel={() => {
            if (!refundMutation.isPending) {
              setDonationToRefund(null);
            }
          }}
          onConfirm={() => void handleConfirmRefund()}
        />
      ) : null}
    </div>
  );
}
