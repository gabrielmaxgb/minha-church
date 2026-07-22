"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Info,
  RefreshCw,
} from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
import { StripeProcessingFeesNote } from "@/components/dashboard/finances/stripe-processing-fees-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES, settingsSectionPath } from "@/constants/routes";
import { STRIPE_BR_DOCS } from "@/constants/stripe-fees-br";
import type {
  ConnectBalanceAmount,
  ConnectPayout,
  ConnectPayoutStatus,
} from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useConnectPayoutsOverview,
} from "@/lib/api/queries";
import { cn, formatCurrency } from "@/lib/utils";

function StripeExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-foreground underline underline-offset-2"
    >
      {children}
    </a>
  );
}

const PAYOUT_STATUS_LABEL: Record<ConnectPayoutStatus, string> = {
  paid: "No banco",
  pending: "Agendado",
  in_transit: "A caminho",
  canceled: "Cancelado",
  failed: "Falhou",
};

function payoutStatusVariant(
  status: ConnectPayoutStatus,
): "success" | "outline" | "danger" | "secondary" {
  switch (status) {
    case "paid":
      return "success";
    case "failed":
    case "canceled":
      return "danger";
    case "in_transit":
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
}

function sumBalanceCents(amounts: ConnectBalanceAmount[]): number {
  return amounts.reduce((sum, item) => sum + item.amountCents, 0);
}

function formatArrivalDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return dateKey;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ConnectPayoutsPanel() {
  const overviewQuery = useConnectPayoutsOverview();

  if (overviewQuery.isPending) {
    return (
      <div id="repasses" className="scroll-mt-24 space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (overviewQuery.isError) {
    return (
      <div id="repasses" className="scroll-mt-24 space-y-4">
        <FormAlert>
          {resolvePaymentsError(
            overviewQuery.error,
            "Não foi possível carregar os repasses. Confirme se os recebimentos estão ativos.",
          )}
        </FormAlert>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={settingsSectionPath("recebimentos")}>
            Ver recebimentos
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const overview = overviewQuery.data;
  const availableCents = sumBalanceCents(overview.available);
  const pendingCents = sumBalanceCents(overview.pending);
  const payouts = overview.payouts;

  return (
    <div id="repasses" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-lg font-semibold tracking-tight">Repasses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dinheiro que o <StripeBrandInline /> envia da conta Connect para o
            banco da igreja.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={overviewQuery.isFetching}
          onClick={() => void overviewQuery.refetch()}
        >
          <RefreshCw
            className={cn(
              "size-3.5",
              overviewQuery.isFetching && "animate-spin",
            )}
            aria-hidden
          />
          Atualizar
        </Button>
      </div>

      <div
        role="note"
        className="flex gap-3 rounded-xl border border-border bg-muted/25 px-4 py-3.5"
      >
        <Info
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              Repasse não é despesa.
            </span>{" "}
            As contribuições e inscrições já entraram no resumo quando foram
            pagas. Aqui você só acompanha quando esse saldo sai do{" "}
            <StripeBrandInline /> e chega no banco.
          </p>
          <p>
            Gastos da igreja (luz, aluguel, fornecedores) continuam em{" "}
            <Link
              href={AUTH_ROUTES.financesManualEntries}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Lançamentos manuais
            </Link>
            .
          </p>
          <p>
            <span className="font-medium text-foreground">
              Bruto ≠ líquido.
            </span>{" "}
            Em Contribuições você vê o que a pessoa pagou. Aqui e no banco
            entram os valores depois da tarifa do <StripeBrandInline />. Minha
            Church não adiciona taxa por transação neste momento. Veja{" "}
            <StripeExternalLink href={STRIPE_BR_DOCS.pricing.href}>
              {STRIPE_BR_DOCS.pricing.label}
            </StripeExternalLink>
            ,{" "}
            <StripeExternalLink href={STRIPE_BR_DOCS.balancesSettlement.href}>
              {STRIPE_BR_DOCS.balancesSettlement.label}
            </StripeExternalLink>{" "}
            e{" "}
            <StripeExternalLink href={STRIPE_BR_DOCS.payouts.href}>
              {STRIPE_BR_DOCS.payouts.label}
            </StripeExternalLink>
            .
          </p>
        </div>
      </div>

      {!overview.payoutsEnabled ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Repasses automáticos ainda não estão liberados nesta conta. Confira o
          cadastro bancário em{" "}
          <Link
            href={settingsSectionPath("recebimentos")}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Recebimentos
          </Link>
          .
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Na conta Connect
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatCurrency(availableCents / 100)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Disponível para o próximo envio ao banco
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Em liquidação
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatCurrency(pendingCents / 100)}
          </p>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Já líquido (após tarifa) — ainda processando no{" "}
            <StripeBrandInline />
          </p>
        </div>
      </div>

      <StripeProcessingFeesNote compact />

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Histórico de envios ao banco
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cada linha é um depósito na conta bancária cadastrada — não um gasto.
          </p>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {payouts.length === 0 ? (
            <li className="px-4 py-12 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted">
                <Building2 className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                Nenhum repasse ainda
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Quando houver saldo liberado, o <StripeBrandInline /> envia
                automaticamente para o banco da igreja. Isso aparece aqui.
              </p>
            </li>
          ) : (
            payouts.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} />
            ))
          )}
        </ul>

        {overview.hasMore ? (
          <p className="text-xs text-muted-foreground">
            Mostrando os repasses mais recentes. O histórico completo fica no
            painel <StripeBrandInline /> (botão no topo da página).
          </p>
        ) : null}
      </section>
    </div>
  );
}

function PayoutRow({ payout }: { payout: ConnectPayout }) {
  return (
    <li className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
            {formatCurrency(payout.amountCents / 100)}
          </p>
          <Badge variant={payoutStatusVariant(payout.status)}>
            {PAYOUT_STATUS_LABEL[payout.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Chegada no banco:{" "}
          <span className="text-foreground/80">
            {formatArrivalDate(payout.arrivalDate)}
          </span>
          <span aria-hidden> · </span>
          criado em {formatCreatedAt(payout.createdAt)}
        </p>
        {payout.status === "failed" && payout.failureMessage ? (
          <p className="mt-1 text-xs text-destructive">{payout.failureMessage}</p>
        ) : null}
      </div>
    </li>
  );
}
