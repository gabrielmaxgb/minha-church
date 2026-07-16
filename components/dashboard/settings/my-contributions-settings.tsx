"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, HeartHandshake } from "lucide-react";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import type { GivingSubscription } from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useCancelMyGivingSubscription,
  useMyGivingDonations,
  useMyGivingSubscriptions,
  useMyMember,
} from "@/lib/api/queries";
import { formatCurrency } from "@/lib/utils";

import { SettingsPanel, SettingsSectionHeader } from "./settings-shared";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Em processamento",
  succeeded: "Confirmada",
  failed: "Não concluída",
  canceled: "Cancelada",
  refunded: "Estornada",
};

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  incomplete: "Aguardando pagamento",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
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

export function MyContributionsSettings() {
  const myMember = useMyMember();
  const donationsQuery = useMyGivingDonations();
  const subscriptionsQuery = useMyGivingSubscriptions();
  const cancelSubscription = useCancelMyGivingSubscription();
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<GivingSubscription | null>(null);

  const hasMemberRecord = Boolean(myMember.data?.id);
  const donations = donationsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const confirmedTotalCents = donations
    .filter((donation) => donation.status === "succeeded")
    .reduce((sum, donation) => sum + donation.amountCents, 0);

  return (
    <div>
      <SettingsSectionHeader
        title="Minhas contribuições"
        description="Dízimos, ofertas e doações que você fez a esta igreja."
        action={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={AUTH_ROUTES.tithesOfferings}>
              <HeartHandshake className="size-3.5" aria-hidden />
              Contribuir
            </Link>
          </Button>
        }
      />

      {myMember.isPending || donationsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : null}

      {myMember.isError ? (
        <FormAlert>
          Não foi possível carregar sua ficha pastoral. Recarregue a página.
        </FormAlert>
      ) : null}

      {!myMember.isPending && !myMember.isError && !hasMemberRecord ? (
        <SettingsPanel>
          <div className="px-4 py-8 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para ver contribuições vinculadas à sua ficha, é preciso ter um
              cadastro pastoral nesta igreja.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href={AUTH_ROUTES.tithesOfferings}>Ir a Dízimos e ofertas</Link>
            </Button>
          </div>
        </SettingsPanel>
      ) : null}

      {hasMemberRecord && donationsQuery.isError ? (
        <FormAlert>
          Não foi possível carregar suas contribuições. Recarregue a página.
        </FormAlert>
      ) : null}

      {hasMemberRecord && !donationsQuery.isPending && !donationsQuery.isError ? (
        <div className="space-y-4">
          {donations.length > 0 ? (
            <div className="rounded-xl border border-domain-finances/20 bg-domain-finances-subtle/60 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-domain-finances-foreground uppercase">
                Confirmado nesta igreja
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(confirmedTotalCents / 100)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Soma só das contribuições com pagamento confirmado.
              </p>
            </div>
          ) : null}

          {subscriptions.length > 0 ? (
            <SettingsPanel>
              <div className="border-b border-border/70 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Contribuições mensais
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Você pode encerrar a cobrança recorrente a qualquer momento.
                </p>
              </div>
              <ul className="divide-y divide-border/70">
                {subscriptions.map((subscription) => (
                  <li
                    key={subscription.id}
                    className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(subscription.amountCents / 100)}/mês
                        </p>
                        <Badge variant="secondary">
                          {SUBSCRIPTION_STATUS_LABEL[subscription.status] ??
                            "Desconhecido"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {subscription.fundName}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={cancelSubscription.isPending}
                      onClick={() => setSubscriptionToCancel(subscription)}
                    >
                      Encerrar
                    </Button>
                  </li>
                ))}
              </ul>
            </SettingsPanel>
          ) : null}

          {cancelSubscription.isError ? (
            <FormAlert>
              {resolvePaymentsError(
                cancelSubscription.error,
                "Não foi possível cancelar a contribuição mensal.",
              )}
            </FormAlert>
          ) : null}

          <SettingsPanel>
            <ul className="divide-y divide-border/70">
              {donations.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Você ainda não tem contribuições registradas por aqui.
                    Quando doar em Dízimos e ofertas, elas aparecem nesta lista.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link href={AUTH_ROUTES.tithesOfferings}>
                      Ir a Dízimos e ofertas
                    </Link>
                  </Button>
                </li>
              ) : (
                donations.map((donation) => (
                  <li
                    key={donation.id}
                    className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(donation.amountCents / 100)}
                        </p>
                        <Badge variant={statusVariant(donation.status)}>
                          {STATUS_LABEL[donation.status] ?? "Desconhecido"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {donation.fundName}
                        {donation.donorMemberId
                          ? " · pelo app"
                          : " · link público"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(donation.createdAt))}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </SettingsPanel>
        </div>
      ) : null}

      {subscriptionToCancel ? (
        <FinanceConfirmDialog
          title="Encerrar contribuição mensal?"
          tone="warning"
          icon={Ban}
          description={
            <div className="space-y-3">
              <p>
                As cobranças futuras param. As contribuições já confirmadas
                continuam no histórico.
              </p>
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(subscriptionToCancel.amountCents / 100)}/mês
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscriptionToCancel.fundName}
                </p>
              </div>
            </div>
          }
          confirmLabel="Encerrar mensal"
          confirmingLabel="Encerrando..."
          isPending={cancelSubscription.isPending}
          onCancel={() => {
            if (!cancelSubscription.isPending) {
              setSubscriptionToCancel(null);
            }
          }}
          onConfirm={() => {
            void cancelSubscription
              .mutateAsync(subscriptionToCancel.id)
              .then(() => setSubscriptionToCancel(null));
          }}
        />
      ) : null}
    </div>
  );
}
