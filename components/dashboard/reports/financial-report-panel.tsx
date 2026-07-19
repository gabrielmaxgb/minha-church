"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  resolveTreasuryError,
  useExportFinancialReport,
  useFinancialReport,
} from "@/lib/api/queries";
import type { FinancialReportAccountLine } from "@/lib/api/treasury";
import { cn, formatCurrency } from "@/lib/utils";

function monthBounds(date = new Date()): { from: string; to: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: toIso(start), to: toIso(end) };
}

function parseSearchFrom(): string | null {
  if (typeof window === "undefined") return null;
  const from = new URLSearchParams(window.location.search).get("from");
  if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) return null;
  return from;
}

function boundsFromDay(day: string): { from: string; to: string } {
  const [y, m] = day.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: toIso(start), to: toIso(end) };
}

export function FinancialReportPanel() {
  const initial = useMemo(() => {
    const fromParam = parseSearchFrom();
    return fromParam ? boundsFromDay(fromParam) : monthBounds();
  }, []);

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  useEffect(() => {
    const fromParam = parseSearchFrom();
    if (!fromParam) return;
    const next = boundsFromDay(fromParam);
    setFrom(next.from);
    setTo(next.to);
  }, []);

  const reportQuery = useFinancialReport({ from, to });
  const exportMutation = useExportFinancialReport();
  const report = reportQuery.data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            De
            <DatePicker value={from} onChange={setFrom} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Até
            <DatePicker value={to} onChange={setTo} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!report || exportMutation.isPending}
            onClick={() => exportMutation.mutate({ from, to })}
          >
            {exportMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            CSV
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!report}
            onClick={handlePrint}
          >
            <Printer className="size-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {exportMutation.isError ? (
        <FormAlert className="print:hidden">
          {resolveTreasuryError(
            exportMutation.error,
            "Não foi possível exportar o CSV.",
          )}
        </FormAlert>
      ) : null}

      {reportQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : reportQuery.isError ? (
        <FormAlert>
          {resolveTreasuryError(
            reportQuery.error,
            "Não foi possível carregar o relatório.",
          )}
        </FormAlert>
      ) : report ? (
        <article
          id="relatorio-financeiro-print"
          className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-xs print:border-0 print:p-0 print:shadow-none sm:p-7"
        >
          <header className="space-y-1 border-b border-border pb-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Relatório financeiro
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {report.churchName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Período{" "}
              {new Intl.DateTimeFormat("pt-BR").format(
                new Date(`${report.from}T12:00:00`),
              )}{" "}
              a{" "}
              {new Intl.DateTimeFormat("pt-BR").format(
                new Date(`${report.to}T12:00:00`),
              )}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {report.periods.map((period) => (
                <Badge
                  key={`${period.year}-${period.month}`}
                  variant={period.isClosed ? "attention" : "outline"}
                >
                  {String(period.month).padStart(2, "0")}/{period.year}
                  {period.isClosed ? " · fechado" : " · aberto"}
                </Badge>
              ))}
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryTile
              label="Receitas"
              value={report.summary.totalIncomeCents}
              hint="Manuais + online + ingressos"
            />
            <SummaryTile
              label="Despesas"
              value={report.summary.expenseCents}
            />
            <SummaryTile
              label="Saldo"
              value={report.summary.balanceCents}
              emphasize
            />
            <SummaryTile
              label="Doações online"
              value={report.summary.onlineDonationCents}
              hint="Incluídas nas receitas"
            />
          </div>

          <ReportTable title="Receitas por conta" lines={report.incomeLines} />
          <ReportTable title="Despesas por conta" lines={report.expenseLines} />

          <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
            Gerado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(report.generatedAt))}{" "}
            · Minha Church
          </footer>
        </article>
      ) : null}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: number;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border px-4 py-3",
        emphasize ? "bg-foreground/3" : "bg-background",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
        {formatCurrency(value / 100)}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ReportTable({
  title,
  lines,
}: {
  title: string;
  lines: FinancialReportAccountLine[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-md text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Conta</th>
              <th className="px-3 py-2 text-right font-medium">Manual</th>
              <th className="px-3 py-2 text-right font-medium">Online</th>
              <th className="px-3 py-2 text-right font-medium">Ingressos</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Sem valores neste período.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={`${line.kind}-${line.accountId ?? line.accountName}`}>
                  <td className="px-3 py-2.5 font-medium text-foreground">
                    {line.accountName}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(line.manualCents / 100)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(line.onlineDonationCents / 100)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(line.eventTicketCents / 100)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                    {formatCurrency(line.totalCents / 100)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
