"use client";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { ChartOfAccountsModal } from "@/components/dashboard/finances/chart-of-accounts-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  resolvePaymentsError,
  useCreateFinanceEntry,
  useDeleteFinanceEntry,
  useExportFinanceEntries,
  useFinanceAccounts,
  useFinanceEntries,
  useFinanceEntriesSummary,
  useFinancialPeriodStatus,
  useGivingFunds,
  useUpdateFinanceEntry,
} from "@/lib/api/queries";
import type {
  FinanceEntry,
  FinanceEntryMethod,
  FinanceEntryType,
} from "@/lib/api/payments";
import { toDateKey } from "@/lib/events/calendar";
import {
  applyBrlCentsMask,
  cn,
  formatBrlCentsMask,
  formatCurrency,
  parseBrlMaskToCents,
} from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const TYPE_LABEL: Record<FinanceEntryType, string> = {
  income: "Entrada",
  expense: "Saída",
};

const METHOD_LABEL: Record<FinanceEntryMethod, string> = {
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
};

const PAGE_SIZE = 20;

function typeVariant(type: FinanceEntryType): "success" | "danger" {
  return type === "income" ? "success" : "danger";
}

function todayIsoDate(): string {
  return toDateKey(new Date());
}

function parseAmountToCents(value: string): number | null {
  if (!value.trim().replace(/\D/g, "")) {
    return null;
  }
  const cents = parseBrlMaskToCents(value);
  return cents > 0 ? cents : null;
}

function centsToInputValue(cents: number): string {
  return formatBrlCentsMask(cents);
}

type EntryFormState = {
  type: FinanceEntryType;
  amount: string;
  occurredOn: string;
  accountId: string;
  fundId: string;
  method: FinanceEntryMethod;
  note: string;
};

const EMPTY_FORM: EntryFormState = {
  type: "income",
  amount: "",
  occurredOn: todayIsoDate(),
  accountId: "",
  fundId: "",
  method: "other",
  note: "",
};

function entryToForm(entry: FinanceEntry): EntryFormState {
  return {
    type: entry.type,
    amount: centsToInputValue(entry.amountCents),
    occurredOn: entry.occurredOn,
    accountId: entry.accountId ?? "",
    fundId: entry.fundId ?? "",
    method: entry.method,
    note: entry.note ?? "",
  };
}

export function FinanceEntriesPanel({
  embedded = false,
  categoriesOpen = false,
  onOpenCategories,
  onCloseCategories,
}: {
  embedded?: boolean;
  categoriesOpen?: boolean;
  onOpenCategories?: () => void;
  onCloseCategories?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<"" | FinanceEntryType>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [form, setForm] = useState<EntryFormState>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinanceEntry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fundLinkOpen, setFundLinkOpen] = useState(false);
  const [localCategoriesOpen, setLocalCategoriesOpen] = useState(false);

  const categoriesModalOpen = onOpenCategories
    ? categoriesOpen
    : localCategoriesOpen;
  const openCategoriesModal = () => {
    if (onOpenCategories) {
      onOpenCategories();
      return;
    }
    setLocalCategoriesOpen(true);
  };
  const closeCategoriesModal = () => {
    if (onCloseCategories) {
      onCloseCategories();
      return;
    }
    setLocalCategoriesOpen(false);
  };

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      type: typeFilter || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, typeFilter, from, to],
  );

  const summaryParams = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
    }),
    [from, to],
  );

  const entriesQuery = useFinanceEntries(params);
  const summaryQuery = useFinanceEntriesSummary(summaryParams);
  const fundsQuery = useGivingFunds();
  const accountsQuery = useFinanceAccounts({ includeInactive: false });
  const formYear = Number((form.occurredOn || todayIsoDate()).slice(0, 4));
  const formMonth = Number((form.occurredOn || todayIsoDate()).slice(5, 7));
  const periodStatusQuery = useFinancialPeriodStatus(formYear, formMonth, {
    enabled: Boolean(form.occurredOn || formOpen),
  });
  const formMonthClosed = Boolean(periodStatusQuery.data?.isClosed);
  const createMutation = useCreateFinanceEntry();
  const updateMutation = useUpdateFinanceEntry();
  const deleteMutation = useDeleteFinanceEntry();
  const exportMutation = useExportFinanceEntries();

  const list = entriesQuery.data;
  const entries = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = summaryQuery.data;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const accountOptions = useMemo(() => {
    const all = accountsQuery.data ?? [];
    const matching = all.filter(
      (account) =>
        !account.isSystem &&
        account.isActive &&
        account.kind === form.type,
    );
    if (
      form.accountId &&
      !matching.some((account) => account.id === form.accountId)
    ) {
      const selected = all.find((account) => account.id === form.accountId);
      if (selected) {
        return [selected, ...matching];
      }
    }
    return matching;
  }, [accountsQuery.data, form.accountId, form.type]);

  const funds = fundsQuery.data ?? [];
  const showFundField = form.type === "income" && funds.length > 0;

  useEffect(() => {
    if (form.type === "expense" && form.fundId) {
      setForm((current) => ({ ...current, fundId: "" }));
      setFundLinkOpen(false);
    }
  }, [form.type, form.fundId]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingEntry(null);
    setFormOpen(false);
    setFormError(null);
    setFundLinkOpen(false);
  };

  const openCreate = () => {
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM, occurredOn: todayIsoDate() });
    setFormOpen(true);
    setFormError(null);
    setFundLinkOpen(false);
  };

  const openEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setForm(entryToForm(entry));
    setFormOpen(true);
    setFormError(null);
    setFundLinkOpen(Boolean(entry.fundId));
  };

  const buildPayload = () => {
    const amountCents = parseAmountToCents(form.amount);
    if (amountCents === null) {
      throw new Error("Informe um valor válido maior que zero.");
    }
    if (!form.accountId) {
      throw new Error("Selecione o tipo no relatório.");
    }
    if (!form.occurredOn) {
      throw new Error("Informe a data.");
    }
    if (formMonthClosed) {
      throw new Error(
        "Este mês está fechado. Reabra o período em Finanças para lançar ou editar.",
      );
    }

    return {
      type: form.type,
      amountCents,
      occurredOn: form.occurredOn,
      accountId: form.accountId,
      fundId: form.fundId || undefined,
      method: form.method,
      note: form.note.trim() || undefined,
    };
  };

  const handleSubmit = async () => {
    setFormError(null);

    try {
      const payload = buildPayload();

      if (editingEntry) {
        await updateMutation.mutateAsync({
          entryId: editingEntry.id,
          input: {
            ...payload,
            fundId: form.fundId || null,
            note: form.note.trim() || null,
          },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : resolvePaymentsError(error, "Não foi possível salvar o lançamento."),
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) {
      return;
    }

    setDeletingId(entryToDelete.id);
    try {
      await deleteMutation.mutateAsync(entryToDelete.id);
      if (editingEntry?.id === entryToDelete.id) {
        resetForm();
      }
      setEntryToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (entriesQuery.isPending) {
    return (
      <div className="space-y-3">
        {!embedded ? <Skeleton className="h-8 w-40" /> : null}
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (entriesQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar os lançamentos manuais. Recarregue a página.
      </FormAlert>
    );
  }

  return (
    <div
      id="lancamentos-manuais"
      className={cn("scroll-mt-24 space-y-4", embedded && "space-y-3")}
    >
      {!embedded ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Livro-caixa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entradas e saídas manuais — dinheiro, transferência, etc.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCategoriesModal}
            >
              <BookOpen className="size-4" />
              Categorias
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Novo lançamento
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
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
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="max-w-xl text-sm text-muted-foreground">
            Oferta em dinheiro, contas pagas, transferências — o dia a dia da
            tesouraria.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCategoriesModal}
            >
              <BookOpen className="size-4" />
              Categorias
            </Button>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Novo lançamento
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(params)}
            >
              {exportMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              CSV
            </Button>
          </div>
        </div>
      )}

      {summary ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Entradas manuais</p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatCurrency(summary.incomeCents / 100)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Contribuições online</p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatCurrency(summary.onlineDonationCents / 100)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Inscrições pagas</p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatCurrency((summary.eventTicketCents ?? 0) / 100)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatCurrency(summary.expenseCents / 100)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Saldo do período</p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatCurrency(summary.balanceCents / 100)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          Tipo
          <SelectField
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as "" | FinanceEntryType);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </SelectField>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          De
          <DatePicker
            value={from}
            onChange={(dateKey) => {
              setFrom(dateKey);
              setPage(1);
            }}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
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

      {formOpen ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {editingEntry ? "Editar lançamento" : "Novo lançamento"}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Tipo" htmlFor="entry-type" required>
              <SelectField
                id="entry-type"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as FinanceEntryType,
                    accountId: "",
                    fundId: "",
                  }))
                }
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </SelectField>
            </FormField>
            <FormField label="Valor" htmlFor="entry-amount" required>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  id="entry-amount"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    setForm((current) => ({
                      ...current,
                      amount: digits
                        ? applyBrlCentsMask(event.target.value)
                        : "",
                    }));
                  }}
                  className="pl-10 tabular-nums"
                />
              </div>
            </FormField>
            <FormField label="Data" htmlFor="entry-date" required>
              <DatePicker
                id="entry-date"
                value={form.occurredOn}
                onChange={(dateKey) =>
                  setForm((current) => ({
                    ...current,
                    occurredOn: dateKey,
                  }))
                }
                required
              />
            </FormField>
            <FormField
              label="Tipo no relatório"
              htmlFor="entry-account"
              required
              hint="Ex.: Dízimos, Ofertas, Utilidades"
              className="sm:col-span-2 lg:col-span-2"
            >
              <SelectField
                id="entry-account"
                value={form.accountId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    accountId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione…</option>
                {accountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </SelectField>
            </FormField>
            <FormField label="Forma" htmlFor="entry-method" required>
              <SelectField
                id="entry-method"
                value={form.method}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    method: event.target.value as FinanceEntryMethod,
                  }))
                }
              >
                {Object.entries(METHOD_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </FormField>
          </div>

          {showFundField ? (
            <div className="overflow-hidden rounded-xl border border-border/80">
              <button
                type="button"
                aria-expanded={fundLinkOpen}
                onClick={() => {
                  setFundLinkOpen((open) => {
                    if (open) {
                      setForm((current) => ({ ...current, fundId: "" }));
                    }
                    return !open;
                  });
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/35"
              >
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    fundLinkOpen && "rotate-180",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    Destino da oferta
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Opcional — ex.: Missões, Construção
                  </span>
                </span>
                {form.fundId ? (
                  <span className="max-w-32 truncate text-xs text-muted-foreground">
                    {funds.find((f) => f.id === form.fundId)?.name}
                  </span>
                ) : null}
              </button>
              {fundLinkOpen ? (
                <div className="border-t border-border/70 px-3.5 py-3">
                  <SelectField
                    id="entry-fund"
                    value={form.fundId}
                    aria-label="Destino da oferta"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fundId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Nenhum</option>
                    {funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
              ) : null}
            </div>
          ) : null}

          <FormField label="Observação" htmlFor="entry-note">
            <Input
              id="entry-note"
              value={form.note}
              placeholder="Opcional"
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
            />
          </FormField>

          {formMonthClosed ? (
            <FormAlert>
              O mês desta data está fechado. Reabra o período para salvar
              alterações, ou escolha outra data.
            </FormAlert>
          ) : null}

          {formError ? <FormAlert>{formError}</FormAlert> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isSaving || formMonthClosed}
              onClick={() => void handleSubmit()}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editingEntry ? "Salvar" : "Adicionar"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {(deleteMutation.isError || exportMutation.isError) && (
        <FormAlert>
          {resolvePaymentsError(
            deleteMutation.error ?? exportMutation.error,
            "Não foi possível concluir a ação.",
          )}
        </FormAlert>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {entries.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm leading-relaxed text-muted-foreground">
            Nenhuma movimentação neste filtro.
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium tabular-nums text-foreground">
                    {formatCurrency(entry.amountCents / 100)}
                  </p>
                  <Badge variant={typeVariant(entry.type)}>
                    {TYPE_LABEL[entry.type]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {entry.accountName ?? entry.category}
                  {entry.fundName ? ` · destino ${entry.fundName}` : ""}
                  {` · ${METHOD_LABEL[entry.method]}`}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                  }).format(new Date(`${entry.occurredOn}T12:00:00`))}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(entry)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deletingId === entry.id}
                  onClick={() => setEntryToDelete(entry)}
                  aria-label="Excluir lançamento"
                >
                  {deletingId === entry.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      {total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {total} lançamento{total === 1 ? "" : "s"}
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

      {entryToDelete ? (
        <FinanceConfirmDialog
          title="Excluir este lançamento?"
          tone="destructive"
          icon={Trash2}
          description={
            <div className="space-y-3">
              <p>
                O lançamento sai do livro-caixa desta igreja. Contribuições online
                não são afetadas.
              </p>
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCurrency(entryToDelete.amountCents / 100)}
                  </p>
                  <Badge variant={typeVariant(entryToDelete.type)}>
                    {TYPE_LABEL[entryToDelete.type]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entryToDelete.accountName ?? entryToDelete.category}
                  {entryToDelete.fundName
                    ? ` · destino ${entryToDelete.fundName}`
                    : ""}
                </p>
              </div>
            </div>
          }
          confirmLabel="Excluir lançamento"
          confirmingLabel="Excluindo..."
          isPending={deletingId === entryToDelete.id}
          onCancel={() => {
            if (deletingId !== entryToDelete.id) {
              setEntryToDelete(null);
            }
          }}
          onConfirm={() => void handleConfirmDelete()}
        />
      ) : null}

      <ChartOfAccountsModal
        open={categoriesModalOpen}
        onClose={closeCategoriesModal}
      />
    </div>
  );
}
