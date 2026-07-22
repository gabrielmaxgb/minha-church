"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Info,
  Loader2,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import {
  resolveTreasuryError,
  useCreateFinanceAccount,
  useDeleteFinanceAccount,
  useFinanceAccounts,
  useUpdateFinanceAccount,
} from "@/lib/api/queries";
import type { FinanceAccount, FinanceAccountKind } from "@/lib/api/treasury";
import { toastError, toastSuccess } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<FinanceAccountKind, string> = {
  income: "Receita",
  expense: "Despesa",
};

const SYSTEM_HINT: Record<string, string> = {
  online_donations:
    "Soma automaticamente as doações pagas pelos fundos (Pix, cartão, boleto).",
  event_tickets:
    "Soma automaticamente a venda de ingressos dos eventos da igreja.",
};

export function ChartOfAccountsPanel({
  embedded = false,
  compact = false,
}: {
  embedded?: boolean;
  /** Modal / surface already has a title — skip the teaching hero. */
  compact?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const accountsQuery = useFinanceAccounts({ includeInactive: true });
  const createMutation = useCreateFinanceAccount();
  const updateMutation = useUpdateFinanceAccount();
  const deleteMutation = useDeleteFinanceAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FinanceAccountKind>("expense");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [accountToDelete, setAccountToDelete] = useState<FinanceAccount | null>(
    null,
  );

  const accounts = accountsQuery.data ?? [];
  const incomeAccounts = useMemo(
    () => accounts.filter((a) => a.kind === "income"),
    [accounts],
  );
  const expenseAccounts = useMemo(
    () => accounts.filter((a) => a.kind === "expense"),
    [accounts],
  );
  const customActiveCount = useMemo(
    () => accounts.filter((a) => !a.isSystem && a.isActive).length,
    [accounts],
  );

  const resetForm = () => {
    setFormOpen(false);
    setName("");
    setKind("expense");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const startEdit = (account: FinanceAccount) => {
    setEditingId(account.id);
    setEditName(account.name);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toastError("Informe o nome da categoria.");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        kind,
      });
      resetForm();
      toastSuccess(
        `${KIND_LABEL[created.kind]} “${created.name}” pronta. Use-a ao lançar no Caixa.`,
      );
    } catch (err) {
      toastError(
        resolveTreasuryError(err, "Não foi possível criar a categoria."),
      );
    }
  };

  const handleRename = async (account: FinanceAccount) => {
    const next = editName.trim();
    if (!next) {
      toastError("Informe o nome da categoria.");
      return;
    }
    if (next === account.name) {
      cancelEdit();
      return;
    }
    try {
      const updated = await updateMutation.mutateAsync({
        accountId: account.id,
        input: { name: next },
      });
      cancelEdit();
      toastSuccess(`Categoria renomeada para “${updated.name}”.`);
    } catch (err) {
      toastError(
        resolveTreasuryError(err, "Não foi possível renomear a categoria."),
      );
    }
  };

  const toggleActive = async (account: FinanceAccount) => {
    setTogglingId(account.id);
    try {
      await updateMutation.mutateAsync({
        accountId: account.id,
        input: { isActive: !account.isActive },
      });
    } catch (err) {
      toastError(
        resolveTreasuryError(err, "Não foi possível atualizar a categoria."),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteMutation.mutateAsync(accountToDelete.id);
      toastSuccess(`Categoria “${accountToDelete.name}” excluída.`);
      setAccountToDelete(null);
      if (editingId === accountToDelete.id) {
        cancelEdit();
      }
    } catch (err) {
      toastError(
        resolveTreasuryError(err, "Não foi possível excluir a categoria."),
      );
      setAccountToDelete(null);
    }
  };

  if (accountsQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (accountsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar as categorias. Recarregue a página.
      </FormAlert>
    );
  }

  const rowBusy =
    updateMutation.isPending || deleteMutation.isPending || togglingId != null;

  return (
    <div className={cn("space-y-5", (embedded || compact) && "space-y-4")}>
      {!embedded && !compact ? (
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Categorias
          </h2>
          <div className="mt-2.5 h-px w-8 bg-domain-finances" />
        </div>
      ) : null}

      {!compact ? (
        <section className="relative overflow-hidden rounded-2xl border border-domain-finances/25 bg-card shadow-xs">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-domain-finances-subtle/80 to-transparent"
            aria-hidden
          />
          <div className="relative space-y-4 px-4 py-5 sm:px-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-finances-subtle text-domain-finances-foreground">
                <NotebookPen className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-domain-finances-foreground uppercase">
                  Livro-caixa
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
                  Tipos de entrada e saída
                </h3>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Usadas ao lançar no Caixa e no relatório mensal.
              </p>
              </div>
            </div>

            <ol className="space-y-0 overflow-hidden rounded-2xl border border-border/80 bg-background/80">
              <li className="flex gap-3 border-b border-border/70 px-3.5 py-3 sm:px-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold text-background tabular-nums">
                  1
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    No Caixa, escolha a categoria
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Dízimo em dinheiro → Dízimos; luz → Utilidades.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 border-b border-border/70 px-3.5 py-3 sm:px-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold text-background tabular-nums">
                  2
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Falta alguma? Crie abaixo
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Aluguel, transporte, evento — vira opção no lançamento.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 px-3.5 py-3 sm:px-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-domain-finances-subtle text-domain-finances-foreground">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Doações online e ingressos
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Marcadas Sistema — entram sozinhas no relatório.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Crie, edite ou desative categorias usadas no seletor de lançamentos.
          Categorias criadas por você, sem lançamentos, podem ser excluídas.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <button
          type="button"
          aria-expanded={formOpen}
          onClick={() => {
            setFormOpen((open) => !open);
          }}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/35"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-domain-finances-subtle text-domain-finances-foreground">
            <Plus className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Nova categoria
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Ex.: Aluguel, Eventos, Transporte — aparece no seletor do Caixa
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              formOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {formOpen ? (
            <motion.div
              key="create-account"
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Depois de criar, a categoria aparece no seletor do Caixa.
                  Desative as que a igreja não usa para manter a lista limpa.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Nome" htmlFor="account-name" required>
                    <Input
                      id="account-name"
                      value={name}
                      placeholder={
                        kind === "income" ? "Ex.: Aluguel de salão" : "Ex.: Aluguel"
                      }
                      onChange={(event) => setName(event.target.value)}
                      disabled={createMutation.isPending}
                      autoFocus
                    />
                  </FormField>
                  <FormField label="Tipo" htmlFor="account-kind" required>
                    <SelectField
                      id="account-kind"
                      value={kind}
                      onChange={(event) =>
                        setKind(event.target.value as FinanceAccountKind)
                      }
                      disabled={createMutation.isPending}
                    >
                      <option value="expense">Despesa (saída)</option>
                      <option value="income">Receita (entrada)</option>
                    </SelectField>
                  </FormField>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={createMutation.isPending}
                    onClick={() => void handleCreate()}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Adicionar categoria
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                    onClick={resetForm}
                  >
                    <X className="size-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="px-0.5 text-xs text-muted-foreground">
        {customActiveCount}{" "}
        {customActiveCount === 1
          ? "categoria ativa no seletor do Caixa"
          : "categorias ativas no seletor do Caixa"}
        <span className="text-border"> · </span>
        As de Sistema não entram nesse total
      </p>

      <AccountGroup
        title="Receitas"
        description="Entradas manuais e agregados automáticos (Sistema)."
        accounts={incomeAccounts}
        editingId={editingId}
        editName={editName}
        onEditNameChange={setEditName}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={(account) => void handleRename(account)}
        onToggle={toggleActive}
        onRequestDelete={setAccountToDelete}
        togglingId={togglingId}
        renaming={updateMutation.isPending && editingId != null}
        busy={rowBusy}
      />
      <AccountGroup
        title="Despesas"
        description="Saídas do dia a dia. Desative o que a igreja não usa."
        accounts={expenseAccounts}
        editingId={editingId}
        editName={editName}
        onEditNameChange={setEditName}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={(account) => void handleRename(account)}
        onToggle={toggleActive}
        onRequestDelete={setAccountToDelete}
        togglingId={togglingId}
        renaming={updateMutation.isPending && editingId != null}
        busy={rowBusy}
      />

      {accountToDelete ? (
        <FinanceConfirmDialog
          title="Excluir categoria?"
          description={
            <>
              A categoria{" "}
              <span className="font-medium text-foreground">
                {accountToDelete.name}
              </span>{" "}
              será removida permanentemente. Só é possível porque ela ainda não
              tem lançamentos.
            </>
          }
          confirmLabel="Excluir categoria"
          confirmingLabel="Excluindo..."
          tone="destructive"
          isPending={deleteMutation.isPending}
          onCancel={() => {
            if (!deleteMutation.isPending) {
              setAccountToDelete(null);
            }
          }}
          onConfirm={() => void handleConfirmDelete()}
        />
      ) : null}
    </div>
  );
}

function AccountGroup({
  title,
  description,
  accounts,
  editingId,
  editName,
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
  onRequestDelete,
  togglingId,
  renaming,
  busy,
}: {
  title: string;
  description: string;
  accounts: FinanceAccount[];
  editingId: string | null;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartEdit: (account: FinanceAccount) => void;
  onCancelEdit: () => void;
  onSaveEdit: (account: FinanceAccount) => void;
  onToggle: (account: FinanceAccount) => void;
  onRequestDelete: (account: FinanceAccount) => void;
  togglingId: string | null;
  renaming: boolean;
  busy: boolean;
}) {
  const activeCount = accounts.filter((a) => a.isActive).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {activeCount}/{accounts.length} ativas
        </span>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {accounts.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma categoria neste grupo. Use “Nova categoria” acima.
          </li>
        ) : (
          accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              isEditing={editingId === account.id}
              editName={editName}
              onEditNameChange={onEditNameChange}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onToggle={onToggle}
              onRequestDelete={onRequestDelete}
              pendingToggle={togglingId === account.id}
              renaming={renaming && editingId === account.id}
              busy={busy}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function AccountRow({
  account,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
  onRequestDelete,
  pendingToggle,
  renaming,
  busy,
}: {
  account: FinanceAccount;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartEdit: (account: FinanceAccount) => void;
  onCancelEdit: () => void;
  onSaveEdit: (account: FinanceAccount) => void;
  onToggle: (account: FinanceAccount) => void;
  onRequestDelete: (account: FinanceAccount) => void;
  pendingToggle: boolean;
  renaming: boolean;
  busy: boolean;
}) {
  const systemHint =
    account.systemKey != null ? SYSTEM_HINT[account.systemKey] : null;

  return (
    <li
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 px-4 py-3.5",
        !account.isActive && "bg-muted/20",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {isEditing ? (
          <div className="flex max-w-md flex-wrap items-center gap-2">
            <Input
              value={editName}
              onChange={(event) => onEditNameChange(event.target.value)}
              disabled={renaming}
              autoFocus
              aria-label={`Novo nome de ${account.name}`}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSaveEdit(account);
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  onCancelEdit();
                }
              }}
              className="h-9"
            />
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={renaming || !editName.trim()}
              onClick={() => onSaveEdit(account)}
            >
              {renaming ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={renaming}
              onClick={onCancelEdit}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-medium text-foreground",
                !account.isActive && "text-muted-foreground line-through",
              )}
            >
              {account.name}
            </p>
            <Badge variant="outline">{KIND_LABEL[account.kind]}</Badge>
            {account.isSystem ? (
              <Tooltip content="Preenchida pelo sistema a partir de doações e eventos. Não dá para desativar nem usar em lançamento manual.">
                <Badge variant="secondary" className="gap-1">
                  Sistema
                  <Info className="size-3 opacity-70" aria-hidden />
                </Badge>
              </Tooltip>
            ) : null}
            {!account.isActive ? (
              <Badge variant="outline">Inativa</Badge>
            ) : null}
          </div>
        )}
        {systemHint ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {systemHint}
          </p>
        ) : !account.isActive && !isEditing ? (
          <p className="text-xs text-muted-foreground">
            Não aparece no seletor do Caixa até reativar.
            {account.canDelete
              ? " Sem lançamentos — você também pode excluir."
              : null}
          </p>
        ) : !account.isSystem &&
          !account.canDelete &&
          account.entryCount > 0 &&
          !isEditing ? (
          <p className="text-xs text-muted-foreground">
            Já tem lançamentos — dá para renomear ou desativar, não excluir.
          </p>
        ) : null}
      </div>

      {!account.isSystem ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={busy}
              onClick={() => onStartEdit(account)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          ) : null}
          {account.canDelete && !isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive"
              disabled={busy}
              onClick={() => onRequestDelete(account)}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          ) : null}
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={busy}
              onClick={() => onToggle(account)}
            >
              {pendingToggle ? (
                <Loader2 className="size-4 animate-spin" />
              ) : account.isActive ? (
                "Desativar"
              ) : (
                "Reativar"
              )}
            </Button>
          ) : null}
        </div>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-domain-finances-subtle/70 px-2.5 py-1.5 text-xs text-domain-finances-foreground">
          <Sparkles className="size-3.5 opacity-80" aria-hidden />
          Automática
        </span>
      )}
    </li>
  );
}
