"use client";

import { ExternalLink, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBillingInvoices } from "@/lib/api/queries/use-billing";
import { formatCurrency } from "@/lib/utils";

import { SettingsPanel } from "./settings-shared";

function formatInvoiceDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatInvoiceAmount(amountPaid: number, currency: string): string {
  if (currency.toLowerCase() !== "brl") {
    return `${amountPaid / 100} ${currency.toUpperCase()}`;
  }

  return formatCurrency(amountPaid / 100);
}

function invoiceStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Paga";
    case "open":
      return "Em aberto";
    case "void":
      return "Anulada";
    case "uncollectible":
      return "Não recebida";
    case "draft":
      return "Rascunho";
    default:
      return status;
  }
}

export function SubscriptionInvoicesSection({
  enabled,
}: {
  enabled: boolean;
}) {
  const { data: invoices, isPending, isError } = useBillingInvoices();

  if (!enabled) {
    return null;
  }

  return (
    <SettingsPanel>
      <div className="border-b border-border/70 px-5 py-4">
        <h3 className="text-sm font-medium">Histórico de faturas</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Cobranças recentes da assinatura. Abra o PDF ou a página de pagamento
          sem sair do painel.
        </p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 px-5 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando faturas...
        </div>
      )}

      {isError && (
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Não foi possível carregar as faturas.
        </p>
      )}

      {!isPending && !isError && (invoices?.length ?? 0) === 0 && (
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Nenhuma fatura encontrada ainda. Após a primeira cobrança, ela
          aparecerá aqui.
        </p>
      )}

      {!isPending && !isError && (invoices?.length ?? 0) > 0 && (
        <div className="divide-y divide-border/50">
          {invoices?.map((invoice) => {
            const viewUrl = invoice.hostedInvoiceUrl ?? invoice.invoicePdf;

            return (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {invoice.number
                      ? `Fatura ${invoice.number}`
                      : `Fatura ${formatInvoiceDate(invoice.createdAt)}`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatInvoiceDate(invoice.createdAt)} ·{" "}
                    {invoiceStatusLabel(invoice.status)} ·{" "}
                    {formatInvoiceAmount(invoice.amountPaid, invoice.currency)}
                  </p>
                </div>

                {viewUrl ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="w-full gap-2 sm:w-auto"
                    asChild
                  >
                    <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="size-4" />
                      Ver fatura
                      <ExternalLink className="size-3.5 opacity-80" />
                    </a>
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SettingsPanel>
  );
}
