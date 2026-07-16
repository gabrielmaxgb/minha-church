"use client";

import Link from "next/link";
import { Clock3, Download, Ticket, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memberDetailPath } from "@/constants/routes";
import { useEventTicketRegistrations } from "@/lib/api/queries";
import { downloadEventTicketRegistrationsCsv } from "@/lib/events/export-ticket-registrations";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  succeeded: "Confirmada",
  pending: "Aguardando",
};

export function EventTicketRegistrationsPanel({
  eventId,
  eventName,
  startsAt,
  location = null,
  isPaid = true,
  embedded = false,
}: {
  eventId: string;
  eventName: string;
  startsAt: string;
  location?: string | null;
  /** Quando false, omite totais em R$ (inscrição gratuita). */
  isPaid?: boolean;
  embedded?: boolean;
}) {
  const { data, isPending, isError, error } = useEventTicketRegistrations(
    eventId,
  );

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "Não foi possível carregar os inscritos."}
      </div>
    );
  }

  const registrations = data?.registrations ?? [];
  const confirmedCount = data?.confirmedCount ?? 0;
  const pendingCount = data?.pendingCount ?? 0;
  const confirmedAmountCents = data?.confirmedAmountCents ?? 0;

  const handleExport = () => {
    downloadEventTicketRegistrationsCsv(registrations, {
      eventName,
      startsAt,
      location,
      isPaid,
    });
  };

  const summary = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums text-muted-foreground">
        <span className="rounded-lg border border-border bg-muted/30 px-2.5 py-1">
          {confirmedCount} confirmada{confirmedCount === 1 ? "" : "s"}
        </span>
        {pendingCount > 0 ? (
          <span className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-2.5 py-1 text-amber-800">
            {pendingCount} aguardando
          </span>
        ) : null}
        {isPaid && confirmedCount > 0 ? (
          <span className="rounded-lg border border-border bg-muted/30 px-2.5 py-1 font-medium text-foreground">
            {formatCurrency(confirmedAmountCents / 100)}
          </span>
        ) : null}
      </div>
      {registrations.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="size-3.5" aria-hidden />
          Exportar CSV
        </Button>
      ) : null}
    </div>
  );

  const body =
    registrations.length === 0 ? (
      <div className="flex items-start gap-3 py-6">
        <Ticket
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            Nenhuma inscrição ainda
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPaid
              ? "Quando alguém pagar a taxa, o nome aparece aqui."
              : "Quando alguém confirmar a inscrição, o nome aparece aqui."}
          </p>
        </div>
      </div>
    ) : (
      <ul className="divide-y divide-border rounded-xl border border-border">
        {registrations.map((item) => {
          const isPendingStatus = item.status === "pending";
          const content = (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className={
                      isPendingStatus
                        ? "gap-1 border-amber-500/25 bg-amber-500/10 font-normal text-amber-800"
                        : "font-normal"
                    }
                  >
                    {isPendingStatus ? (
                      <Clock3 className="size-3" aria-hidden />
                    ) : null}
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[item.email, formatDateTime(item.createdAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {isPaid ? (
                <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(item.amountCents / 100)}
                </p>
              ) : null}
            </>
          );

          return (
            <li key={item.id}>
              {item.memberId ? (
                <Link
                  href={memberDetailPath(item.memberId)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );

  if (embedded) {
    return (
      <div className="space-y-4">
        {summary}
        {body}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-domain-finances-subtle text-domain-finances-foreground">
            <Users className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {isPaid ? "Inscritos (pagamento)" : "Inscritos"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Visível só para quem gerencia este evento.
            </p>
          </div>
        </div>
        {summary}
      </div>
      <div className="px-4 py-2 sm:px-5">{body}</div>
    </section>
  );
}
