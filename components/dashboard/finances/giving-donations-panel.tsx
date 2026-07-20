"use client";

import { useMemo, useState } from "react";
import { Download, HandCoins, Layers, Loader2, Ticket, Undo2 } from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import {
  segmentedListClassName,
  segmentedTriggerClassName,
} from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  EventTicketPurchase,
  GivingDonation,
} from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useChurchEvents,
  useEventTicketPurchases,
  useExportEventTicketPurchases,
  useExportGivingDonations,
  useGivingDonations,
  useGivingFunds,
  useRefundEventTicketPurchase,
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

const TICKET_STATUS_OPTIONS = [
  "pending",
  "succeeded",
  "failed",
  "canceled",
  "refunded",
] as const;

type IncomeSource = "all" | "donations" | "tickets";

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

function buyerLabel(ticket: EventTicketPurchase): string {
  if (ticket.memberName) {
    return ticket.memberName;
  }
  if (ticket.buyerName) {
    return ticket.buyerName;
  }
  return "Participante não identificado";
}

function formatEntryDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function IncomeSourceTabs({
  value,
  onChange,
}: {
  value: IncomeSource;
  onChange: (next: IncomeSource) => void;
}) {
  const options: Array<{
    id: IncomeSource;
    label: string;
    icon: typeof HandCoins;
  }> = [
    { id: "all", label: "Todas", icon: Layers },
    { id: "donations", label: "Contribuições", icon: HandCoins },
    { id: "tickets", label: "Inscrições", icon: Ticket },
  ];

  return (
    <div
      role="tablist"
      aria-label="Origem das entradas"
      className={segmentedListClassName(
        "w-full flex-wrap rounded-lg p-0.5 sm:w-auto",
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={segmentedTriggerClassName(
              selected,
              "min-h-9 flex-1 rounded-md px-2.5 text-xs sm:flex-none sm:px-3",
            )}
          >
            <Icon className="size-3.5 opacity-70" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ListPagination({
  page,
  total,
  totalPages,
  noun,
  onPageChange,
}: {
  page: number;
  total: number;
  totalPages: number;
  noun: { singular: string; plural: string };
  onPageChange: (page: number) => void;
}) {
  if (total <= PAGE_SIZE) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        {total} {total === 1 ? noun.singular : noun.plural}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

export function GivingDonationsPanel({
  embedded = false,
  memberId,
}: {
  embedded?: boolean;
  /** Quando informado, lista só contribuições daquele membro. */
  memberId?: string;
}) {
  const [source, setSource] = useState<IncomeSource>("all");
  const [donationPage, setDonationPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const [fundId, setFundId] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [donationToRefund, setDonationToRefund] =
    useState<GivingDonation | null>(null);
  const [ticketToRefund, setTicketToRefund] =
    useState<EventTicketPurchase | null>(null);

  const showDonations = !memberId
    ? source === "all" || source === "donations"
    : true;
  const showTickets = !memberId && (source === "all" || source === "tickets");

  const dateParams = useMemo(
    () => ({
      from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      status: status || undefined,
      memberId: memberId || undefined,
    }),
    [from, to, status, memberId],
  );

  const donationParams = useMemo(
    () => ({
      page: donationPage,
      limit: PAGE_SIZE,
      fundId: fundId || undefined,
      ...dateParams,
    }),
    [donationPage, fundId, dateParams],
  );

  const ticketParams = useMemo(
    () => ({
      page: ticketPage,
      limit: PAGE_SIZE,
      eventId: eventId || undefined,
      ...dateParams,
    }),
    [ticketPage, eventId, dateParams],
  );

  const donationsQuery = useGivingDonations(donationParams, {
    enabled: showDonations,
  });
  const ticketsQuery = useEventTicketPurchases(ticketParams, {
    enabled: showTickets,
  });
  const fundsQuery = useGivingFunds({
    enabled: !memberId && showDonations,
  });
  const eventsQuery = useChurchEvents(
    {},
    { enabled: !memberId && showTickets },
  );

  const refundDonationMutation = useRefundGivingDonation();
  const refundTicketMutation = useRefundEventTicketPurchase();
  const exportDonationsMutation = useExportGivingDonations();
  const exportTicketsMutation = useExportEventTicketPurchases();

  const donations = donationsQuery.data?.items ?? [];
  const donationTotal = donationsQuery.data?.total ?? 0;
  const donationTotalPages = Math.max(1, Math.ceil(donationTotal / PAGE_SIZE));

  const tickets = ticketsQuery.data?.items ?? [];
  const ticketTotal = ticketsQuery.data?.total ?? 0;
  const ticketTotalPages = Math.max(1, Math.ceil(ticketTotal / PAGE_SIZE));

  const eventsForFilter = useMemo(() => {
    const items = eventsQuery.data ?? [];
    return [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [eventsQuery.data]);

  const isPending =
    (showDonations && donationsQuery.isPending) ||
    (showTickets && ticketsQuery.isPending);

  const isError =
    (showDonations && donationsQuery.isError) ||
    (showTickets && ticketsQuery.isError);

  const actionError =
    refundDonationMutation.error ??
    refundTicketMutation.error ??
    exportDonationsMutation.error ??
    exportTicketsMutation.error;

  function resetPages() {
    setDonationPage(1);
    setTicketPage(1);
  }

  async function handleConfirmDonationRefund() {
    if (!donationToRefund) {
      return;
    }

    try {
      await refundDonationMutation.mutateAsync(donationToRefund.id);
      setDonationToRefund(null);
    } catch {
      // Erro já aparece no FormAlert
    }
  }

  async function handleConfirmTicketRefund() {
    if (!ticketToRefund) {
      return;
    }

    try {
      await refundTicketMutation.mutateAsync(ticketToRefund.id);
      setTicketToRefund(null);
    } catch {
      // Erro já aparece no FormAlert
    }
  }

  function handleExport() {
    if (source === "tickets") {
      exportTicketsMutation.mutate(ticketParams);
      return;
    }
    exportDonationsMutation.mutate(donationParams);
  }

  const exportPending =
    exportDonationsMutation.isPending || exportTicketsMutation.isPending;
  const exportDisabled =
    exportPending ||
    (source === "tickets"
      ? tickets.length === 0
      : source === "donations"
        ? donations.length === 0
        : donations.length === 0 && tickets.length === 0);

  if (isPending) {
    return (
      <div className="space-y-3">
        {!embedded ? <Skeleton className="h-8 w-40" /> : null}
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <FormAlert>
        Não foi possível carregar as entradas. Recarregue a página.
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
            <h2 className="text-lg font-semibold tracking-tight">Entradas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contribuições online e inscrições pagas de eventos.
            </p>
          </div>
          {!memberId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled || source === "all"}
              onClick={handleExport}
              title={
                source === "all"
                  ? "Escolha Contribuições ou Inscrições para exportar"
                  : undefined
              }
            >
              {exportPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Exportar CSV
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {memberId
              ? "Contribuições deste membro."
              : "Contribuições e inscrições pagas — uma só visão de entradas."}
          </p>
          {!memberId && source !== "all" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={handleExport}
            >
              {exportPending ? (
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <IncomeSourceTabs
            value={source}
            onChange={(next) => {
              setSource(next);
              resetPages();
            }}
          />
        </div>
      ) : null}

      {!memberId ? (
        <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {showDonations ? (
            <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
              Fundo
              <SelectField
                value={fundId}
                onChange={(event) => {
                  setFundId(event.target.value);
                  setDonationPage(1);
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
          ) : null}
          {showTickets ? (
            <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
              Evento
              <SelectField
                value={eventId}
                onChange={(event) => {
                  setEventId(event.target.value);
                  setTicketPage(1);
                }}
              >
                <option value="">Todos</option>
                {eventsForFilter.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </SelectField>
            </label>
          ) : null}
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            Status
            <SelectField
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetPages();
              }}
            >
              <option value="">Todos</option>
              {(source === "tickets"
                ? TICKET_STATUS_OPTIONS
                : Object.keys(STATUS_LABEL)
              ).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABEL[value] ?? value}
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
                resetPages();
              }}
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
            Até
            <DatePicker
              value={to}
              onChange={(dateKey) => {
                setTo(dateKey);
                resetPages();
              }}
            />
          </label>
        </div>
      ) : null}

      {actionError ? (
        <FormAlert>
          {resolvePaymentsError(actionError, "Não foi possível concluir a ação.")}
        </FormAlert>
      ) : null}

      {showDonations ? (
        <section className="space-y-3">
          {source === "all" && !memberId ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Contribuições
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground"
                disabled={
                  exportDonationsMutation.isPending || donations.length === 0
                }
                onClick={() => exportDonationsMutation.mutate(donationParams)}
              >
                {exportDonationsMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                CSV
              </Button>
            </div>
          ) : null}

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
                        {STATUS_LABEL[donation.status] ?? "Desconhecido"}
                      </Badge>
                      {source === "all" && !memberId ? (
                        <Badge variant="outline">Contribuição</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                      <span className="text-foreground/80">
                        {donation.fundName}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex min-w-0 items-center gap-0.5">
                        <span className="truncate">{donorLabel(donation)}</span>
                        {donation.donorMemberId && !memberId ? (
                          <MemberDetailButton
                            memberId={donation.donorMemberId}
                            memberName={donation.donorMemberName}
                            className="size-7"
                          />
                        ) : null}
                      </span>
                      {donation.donorMemberId ? (
                        <span className="text-muted-foreground/80">
                          {" "}
                          · membro
                        </span>
                      ) : (
                        <span className="text-muted-foreground/80">
                          {" "}
                          · público
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatEntryDate(donation.createdAt)}
                    </p>
                  </div>
                  {donation.status === "succeeded" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-800"
                      disabled={refundDonationMutation.isPending}
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

          <ListPagination
            page={donationPage}
            total={donationTotal}
            totalPages={donationTotalPages}
            noun={{ singular: "contribuição", plural: "contribuições" }}
            onPageChange={setDonationPage}
          />
        </section>
      ) : null}

      {showTickets ? (
        <section className="space-y-3">
          {source === "all" ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Inscrições pagas
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground"
                disabled={
                  exportTicketsMutation.isPending || tickets.length === 0
                }
                onClick={() => exportTicketsMutation.mutate(ticketParams)}
              >
                {exportTicketsMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                CSV
              </Button>
            </div>
          ) : null}

          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {tickets.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
                Nenhuma inscrição paga neste filtro.
              </li>
            ) : (
              tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                        {formatCurrency(ticket.amountCents / 100)}
                      </p>
                      <Badge variant={statusVariant(ticket.status)}>
                        {STATUS_LABEL[ticket.status] ?? "Desconhecido"}
                      </Badge>
                      {source === "all" ? (
                        <Badge variant="outline">Inscrição</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                      <span className="text-foreground/80">
                        {ticket.eventName}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex min-w-0 items-center gap-0.5">
                        <span className="truncate">{buyerLabel(ticket)}</span>
                        {ticket.memberId ? (
                          <MemberDetailButton
                            memberId={ticket.memberId}
                            memberName={ticket.memberName}
                            className="size-7"
                          />
                        ) : null}
                      </span>
                      {ticket.memberId ? (
                        <span className="text-muted-foreground/80">
                          {" "}
                          · membro
                        </span>
                      ) : (
                        <span className="text-muted-foreground/80">
                          {" "}
                          · externo
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatEntryDate(ticket.createdAt)}
                    </p>
                  </div>
                  {ticket.status === "succeeded" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-800"
                      disabled={refundTicketMutation.isPending}
                      onClick={() => setTicketToRefund(ticket)}
                    >
                      <Undo2 className="size-3.5" />
                      Estornar
                    </Button>
                  ) : null}
                </li>
              ))
            )}
          </ul>

          <ListPagination
            page={ticketPage}
            total={ticketTotal}
            totalPages={ticketTotalPages}
            noun={{ singular: "inscrição", plural: "inscrições" }}
            onPageChange={setTicketPage}
          />
        </section>
      ) : null}

      {donationToRefund ? (
        <FinanceConfirmDialog
          title="Estornar esta contribuição?"
          tone="warning"
          icon={Undo2}
          description={
            <div className="space-y-3">
              <p>
                O <StripeBrandInline /> devolve este valor ao contribuidor no{" "}
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
                  O valor sai do saldo da igreja na conta{" "}
                  <StripeBrandInline /> Connect.
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
          isPending={refundDonationMutation.isPending}
          onCancel={() => {
            if (!refundDonationMutation.isPending) {
              setDonationToRefund(null);
            }
          }}
          onConfirm={() => void handleConfirmDonationRefund()}
        />
      ) : null}

      {ticketToRefund ? (
        <FinanceConfirmDialog
          title="Estornar esta inscrição?"
          tone="warning"
          icon={Undo2}
          description={
            <div className="space-y-3">
              <p>
                O <StripeBrandInline /> devolve este valor ao participante no{" "}
                <span className="font-medium text-foreground">
                  mesmo meio de pagamento
                </span>{" "}
                usado na inscrição. A vaga deixa de contar como confirmada.
              </p>
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(ticketToRefund.amountCents / 100)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticketToRefund.eventName} · {buyerLabel(ticketToRefund)}
                </p>
              </div>
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                <li>
                  O valor sai do saldo da igreja na conta{" "}
                  <StripeBrandInline /> Connect.
                </li>
                <li>
                  A inscrição passa a aparecer como{" "}
                  <span className="font-medium text-foreground">Estornada</span>{" "}
                  no histórico.
                </li>
                <li>Esta ação não pode ser desfeita pelo painel.</li>
              </ul>
            </div>
          }
          confirmLabel="Confirmar estorno"
          confirmingLabel="Estornando..."
          isPending={refundTicketMutation.isPending}
          onCancel={() => {
            if (!refundTicketMutation.isPending) {
              setTicketToRefund(null);
            }
          }}
          onConfirm={() => void handleConfirmTicketRefund()}
        />
      ) : null}
    </div>
  );
}
