"use client";

import { useState } from "react";
import { CalendarRange, CheckCircle2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/select-field";
import {
  useCloseAvailabilityWindow,
  useMinistry,
  useOpenAvailabilityWindow,
} from "@/lib/api/queries";
import {
  WORSHIP_AVAILABILITY_PERIODS,
  type WorshipAvailabilityPeriod,
} from "@/lib/ministries/worship";
import type { WorshipAvailabilityWindow } from "@/types/ministries";

interface WorshipAvailabilityWindowPanelProps {
  ministryId: string;
  canManage: boolean;
  window?: WorshipAvailabilityWindow | null;
}

export function WorshipAvailabilityWindowPanel({
  ministryId,
  canManage,
  window: windowProp,
}: WorshipAvailabilityWindowPanelProps) {
  const { data: ministry } = useMinistry(ministryId);
  const openWindow = useOpenAvailabilityWindow(ministryId);
  const closeWindow = useCloseAvailabilityWindow(ministryId);

  const window = windowProp ?? ministry?.availabilityWindow;
  const [periodType, setPeriodType] =
    useState<WorshipAvailabilityPeriod>("monthly");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!canManage) {
    if (!window?.active) {
      return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-6 text-center">
          <CalendarRange className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">
            Coleta de disponibilidade fechada
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            O líder ainda não abriu um período para a equipe responder. Quando
            abrir, você verá aqui só os eventos daquele intervalo.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Período aberto para respostas
        </p>
        <p className="mt-1 font-display text-lg font-bold text-foreground">
          {window.label}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Marque sua disponibilidade apenas nos eventos deste período.
        </p>
      </div>
    );
  }

  async function handleOpen() {
    setError(null);

    try {
      await openWindow.mutateAsync({
        periodType,
        ...(startDate ? { startDate } : {}),
      });
      setStartDate("");
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "Não foi possível abrir o período.",
      );
    }
  }

  async function handleClose() {
    setError(null);

    try {
      await closeWindow.mutateAsync();
    } catch (closeError) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : "Não foi possível encerrar o período.",
      );
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
      <header className="border-b border-border/60 bg-muted/25 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <CalendarRange className="size-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              Período de disponibilidade
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Abra um intervalo (semana, mês, trimestre…) para a equipe responder
              só os eventos daquele período — sem lista infinita.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-5">
        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {window?.active ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                  <CheckCircle2 className="size-3" />
                  Coleta aberta
                </Badge>
                <span className="font-display text-lg font-bold text-foreground">
                  {window.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="size-3.5" />
                  {window.eventsInPeriod} evento
                  {window.eventsInPeriod === 1 ? "" : "s"} no período
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {window.teamPendingCount} resposta
                  {window.teamPendingCount === 1 ? "" : "s"} pendentes na equipe
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={closeWindow.isPending}
              onClick={() => void handleClose()}
            >
              {closeWindow.isPending ? "Encerrando..." : "Encerrar coleta"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Tipo de período
                </p>
                <SelectField
                  value={periodType}
                  onChange={(event) =>
                    setPeriodType(event.target.value as WorshipAvailabilityPeriod)
                  }
                  disabled={openWindow.isPending}
                >
                  {WORSHIP_AVAILABILITY_PERIODS.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.label} — {period.description}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Início (opcional)
                </p>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  disabled={openWindow.isPending}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() => void handleOpen()}
              disabled={openWindow.isPending}
            >
              {openWindow.isPending
                ? "Abrindo..."
                : "Abrir coleta para a equipe"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
