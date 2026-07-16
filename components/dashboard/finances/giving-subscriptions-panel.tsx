"use client";

import { useMemo, useState } from "react";
import { Ban } from "lucide-react";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import type { GivingSubscription } from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useCancelGivingSubscriptionAsTreasurer,
  useGivingFunds,
  useGivingSubscriptions,
} from "@/lib/api/queries";
import { formatCurrency } from "@/lib/utils";

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  incomplete: "Aguardando pagamento",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
};

function statusVariant(
  status: string,
): "success" | "outline" | "danger" | "secondary" | "attention" {
  switch (status) {
    case "active":
      return "success";
    case "canceled":
      return "danger";
    case "past_due":
      return "attention";
    case "incomplete":
      return "secondary";
    default:
      return "outline";
  }
}

function donorLabel(subscription: GivingSubscription): string {
  if (subscription.donorMemberName) {
    return subscription.donorMemberName;
  }
  if (subscription.payerName) {
    return subscription.payerName;
  }
  if (subscription.payerEmail) {
    return subscription.payerEmail;
  }
  return "Doador não identificado";
}

export function GivingSubscriptionsPanel() {
  const [fundId, setFundId] = useState("");
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<GivingSubscription | null>(null);

  const params = useMemo(
    () => ({
      fundId: fundId || undefined,
    }),
    [fundId],
  );

  const subscriptionsQuery = useGivingSubscriptions(params);
  const fundsQuery = useGivingFunds();
  const cancelMutation = useCancelGivingSubscriptionAsTreasurer();

  const subscriptions = subscriptionsQuery.data ?? [];

  if (subscriptionsQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (subscriptionsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar as contribuições mensais. Recarregue a página.
      </FormAlert>
    );
  }

  return (
    <div id="mensais" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Cobranças recorrentes ativas (cartão). Tesouraria pode encerrar em
          nome do doador — inclusive doações feitas pelo link público.
        </p>
      </div>

      <div className="max-w-xs">
        <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
          Fundo
          <SelectField
            value={fundId}
            onChange={(event) => setFundId(event.target.value)}
          >
            <option value="">Todos</option>
            {(fundsQuery.data ?? []).map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name}
              </option>
            ))}
          </SelectField>
        </label>
      </div>

      {cancelMutation.isError ? (
        <FormAlert>
          {resolvePaymentsError(
            cancelMutation.error,
            "Não foi possível encerrar a contribuição mensal.",
          )}
        </FormAlert>
      ) : null}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {subscriptions.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
            Nenhuma contribuição mensal ativa neste filtro.
          </li>
        ) : (
          subscriptions.map((subscription) => (
            <li
              key={subscription.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCurrency(subscription.amountCents / 100)}/mês
                  </p>
                  <Badge variant={statusVariant(subscription.status)}>
                    {SUBSCRIPTION_STATUS_LABEL[subscription.status] ??
                      subscription.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="text-foreground/80">
                    {subscription.fundName}
                  </span>
                  {" · "}
                  {donorLabel(subscription)}
                  {subscription.donorMemberId ? (
                    <span className="text-muted-foreground/80"> · membro</span>
                  ) : (
                    <span className="text-muted-foreground/80"> · público</span>
                  )}
                </p>
                {subscription.payerEmail ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {subscription.payerEmail}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Desde{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                  }).format(new Date(subscription.createdAt))}
                </p>
              </div>
              {subscription.status !== "canceled" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-800"
                  disabled={cancelMutation.isPending}
                  onClick={() => setSubscriptionToCancel(subscription)}
                >
                  <Ban className="size-3.5" />
                  Encerrar
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {subscriptionToCancel ? (
        <FinanceConfirmDialog
          title="Encerrar contribuição mensal?"
          tone="warning"
          icon={Ban}
          description={
            <div className="space-y-3">
              <p>
                As cobranças futuras deste cartão param imediatamente. As
                contribuições já confirmadas continuam no histórico.
              </p>
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(subscriptionToCancel.amountCents / 100)}/mês
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscriptionToCancel.fundName} ·{" "}
                  {donorLabel(subscriptionToCancel)}
                </p>
              </div>
            </div>
          }
          confirmLabel="Encerrar mensal"
          confirmingLabel="Encerrando..."
          isPending={cancelMutation.isPending}
          onCancel={() => {
            if (!cancelMutation.isPending) {
              setSubscriptionToCancel(null);
            }
          }}
          onConfirm={() => {
            void cancelMutation
              .mutateAsync(subscriptionToCancel.id)
              .then(() => setSubscriptionToCancel(null));
          }}
        />
      ) : null}
    </div>
  );
}
