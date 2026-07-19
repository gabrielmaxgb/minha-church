"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  resolveTreasuryError,
  useCreateFinanceAccount,
  useFinanceAccounts,
  useUpdateFinanceAccount,
} from "@/lib/api/queries";
import type { FinanceAccountKind } from "@/lib/api/treasury";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<FinanceAccountKind, string> = {
  income: "Receita",
  expense: "Despesa",
};

export function ChartOfAccountsPanel({ embedded = false }: { embedded?: boolean }) {
  const accountsQuery = useFinanceAccounts({ includeInactive: true });
  const createMutation = useCreateFinanceAccount();
  const updateMutation = useUpdateFinanceAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FinanceAccountKind>("expense");
  const [error, setError] = useState<string | null>(null);

  const accounts = accountsQuery.data ?? [];
  const incomeAccounts = useMemo(
    () => accounts.filter((a) => a.kind === "income"),
    [accounts],
  );
  const expenseAccounts = useMemo(
    () => accounts.filter((a) => a.kind === "expense"),
    [accounts],
  );

  const resetForm = () => {
    setFormOpen(false);
    setName("");
    setKind("expense");
    setError(null);
  };

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Informe o nome da conta.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        kind,
      });
      resetForm();
    } catch (err) {
      setError(resolveTreasuryError(err, "Não foi possível criar a conta."));
    }
  };

  const toggleActive = async (accountId: string, isActive: boolean) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({
        accountId,
        input: { isActive: !isActive },
      });
    } catch (err) {
      setError(resolveTreasuryError(err, "Não foi possível atualizar a conta."));
    }
  };

  if (accountsQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (accountsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar o plano de contas. Recarregue a página.
      </FormAlert>
    );
  }

  return (
    <div className={cn("space-y-4", embedded && "space-y-3")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {!embedded ? (
            <h2 className="text-lg font-semibold tracking-tight">
              Plano de contas
            </h2>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Categorias fixas para o livro-caixa. Contas de sistema agregam
            doações online e ingressos nos relatórios.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setFormOpen(true);
            setError(null);
          }}
        >
          <Plus className="size-4" />
          Nova conta
        </Button>
      </div>

      {formOpen ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Nova conta</p>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              Nome
              <Input
                value={name}
                placeholder="Ex.: Aluguel"
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Tipo
              <SelectField
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as FinanceAccountKind)
                }
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </SelectField>
            </label>
          </div>
          {error ? <FormAlert>{error}</FormAlert> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => void handleCreate()}
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Adicionar
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : error ? (
        <FormAlert>{error}</FormAlert>
      ) : null}

      <AccountGroup
        title="Receitas"
        accounts={incomeAccounts}
        onToggle={toggleActive}
        pending={updateMutation.isPending}
      />
      <AccountGroup
        title="Despesas"
        accounts={expenseAccounts}
        onToggle={toggleActive}
        pending={updateMutation.isPending}
      />
    </div>
  );
}

function AccountGroup({
  title,
  accounts,
  onToggle,
  pending,
}: {
  title: string;
  accounts: Array<{
    id: string;
    name: string;
    kind: FinanceAccountKind;
    isActive: boolean;
    isSystem: boolean;
  }>;
  onToggle: (id: string, isActive: boolean) => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {accounts.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma conta neste grupo.
          </li>
        ) : (
          accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div className="min-w-0">
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
                    <Badge variant="secondary">Sistema</Badge>
                  ) : null}
                  {!account.isActive ? (
                    <Badge variant="outline">Inativa</Badge>
                  ) : null}
                </div>
              </div>
              {!account.isSystem ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => onToggle(account.id, account.isActive)}
                >
                  {account.isActive ? "Desativar" : "Reativar"}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Preenchida automaticamente
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
