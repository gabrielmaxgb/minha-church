"use client";

import { useMemo, useState } from "react";
import { Lock, LockOpen, Loader2 } from "lucide-react";
import Link from "next/link";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  resolveTreasuryError,
  useCloseFinancialPeriod,
  useFinancialPeriodStatus,
  useReopenFinancialPeriod,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function PeriodCloseBar({ className }: { className?: string }) {
  const { user, permissions } = useAuth();
  const canManage = Boolean(user?.isOwner || permissions?.finances.manage);
  const initial = useMemo(() => currentYearMonth(), []);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusQuery = useFinancialPeriodStatus(year, month);
  const closeMutation = useCloseFinancialPeriod();
  const reopenMutation = useReopenFinancialPeriod();

  const isClosed = Boolean(statusQuery.data?.isClosed);
  const monthLabel = `${MONTH_LABELS[month - 1]} de ${year}`;
  const yearOptions = [initial.year - 1, initial.year, initial.year + 1];
  const reportFrom = `${year}-${String(month).padStart(2, "0")}-01`;

  const handleClose = async () => {
    setError(null);
    try {
      await closeMutation.mutateAsync({ year, month });
      setConfirmClose(false);
    } catch (err) {
      setError(resolveTreasuryError(err, "Não foi possível fechar o mês."));
      setConfirmClose(false);
    }
  };

  const handleReopen = async () => {
    setError(null);
    try {
      await reopenMutation.mutateAsync({ year, month });
      setConfirmReopen(false);
    } catch (err) {
      setError(resolveTreasuryError(err, "Não foi possível reabrir o mês."));
      setConfirmReopen(false);
    }
  };

  if (statusQuery.isPending) {
    return <Skeleton className={cn("h-16 w-full rounded-xl", className)} />;
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              Mês da tesouraria
            </p>
            {isClosed ? (
              <Badge variant="attention">Fechado</Badge>
            ) : (
              <Badge variant="success">Aberto</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <SelectField
              value={String(month)}
              onChange={(event) => setMonth(Number(event.target.value))}
              aria-label="Mês"
              className="w-auto min-w-36"
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </SelectField>
            <SelectField
              value={String(year)}
              onChange={(event) => setYear(Number(event.target.value))}
              aria-label="Ano"
              className="w-auto min-w-24"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </SelectField>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {isClosed
              ? `Fechado em ${
                  statusQuery.data?.period?.closedAt
                    ? new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(statusQuery.data.period.closedAt))
                    : "—"
                }${
                  statusQuery.data?.period?.closedByUserName
                    ? ` por ${statusQuery.data.period.closedByUserName}`
                    : ""
                }. Lançamentos manuais deste mês ficam travados.`
              : "Enquanto o mês estiver aberto, você pode lançar e editar o caixa."}
          </p>
          {error ? <FormAlert>{error}</FormAlert> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild type="button" variant="outline" size="sm">
            <Link href={`${AUTH_ROUTES.reports}?from=${reportFrom}`}>
              Ver relatório
            </Link>
          </Button>
          {canManage ? (
            isClosed ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={reopenMutation.isPending}
                onClick={() => {
                  setError(null);
                  setConfirmReopen(true);
                }}
              >
                {reopenMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LockOpen className="size-4" />
                )}
                Reabrir
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={closeMutation.isPending}
                onClick={() => {
                  setError(null);
                  setConfirmClose(true);
                }}
              >
                {closeMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Lock className="size-4" />
                )}
                Fechar mês
              </Button>
            )
          ) : null}
        </div>
      </div>

      {confirmClose ? (
        <FinanceConfirmDialog
          title={`Fechar ${monthLabel}?`}
          description="Depois de fechar, ninguém consegue criar ou editar lançamentos manuais deste mês até reabrir. Doações online e ingressos continuam sendo registrados normalmente."
          confirmLabel="Fechar mês"
          confirmingLabel="Fechando…"
          tone="warning"
          icon={Lock}
          isPending={closeMutation.isPending}
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => void handleClose()}
        />
      ) : null}

      {confirmReopen ? (
        <FinanceConfirmDialog
          title={`Reabrir ${monthLabel}?`}
          description="O mês volta a aceitar alterações no livro-caixa. Use só se precisar corrigir um lançamento."
          confirmLabel="Reabrir"
          confirmingLabel="Reabrindo…"
          tone="warning"
          icon={LockOpen}
          isPending={reopenMutation.isPending}
          onCancel={() => setConfirmReopen(false)}
          onConfirm={() => void handleReopen()}
        />
      ) : null}
    </>
  );
}
