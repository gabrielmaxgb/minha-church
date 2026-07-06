"use client";

import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addRosterSlotPlanItem,
  clampRosterRequiredCount,
  formatRosterRole,
  isRosterRoleSelected,
  normalizeRosterSlotPlan,
  removeRosterSlotPlanItem,
  ROSTER_ROLE_PRESETS,
  ROSTER_SLOT_MAX_REQUIRED_COUNT,
  ROSTER_SLOT_MIN_REQUIRED_COUNT,
  updateRosterSlotPlanCount,
  type RosterSlotPlanItem,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";

interface EventRosterSlotsEditorProps {
  value: RosterSlotPlanItem[];
  onChange: (next: RosterSlotPlanItem[]) => void;
  disabled?: boolean;
  className?: string;
  embedded?: boolean;
}

export function EventRosterSlotsEditor({
  value,
  onChange,
  disabled = false,
  className,
  embedded = false,
}: EventRosterSlotsEditorProps) {
  const [customValue, setCustomValue] = useState("");

  const selected = normalizeRosterSlotPlan(value);
  const suggestions = ROSTER_ROLE_PRESETS.filter(
    (preset) => !isRosterRoleSelected(selected.map((item) => item.label), preset.id),
  );

  function addCustomValue() {
    const trimmed = customValue.trim();

    if (!trimmed) {
      return;
    }

    onChange(addRosterSlotPlanItem(value, trimmed));
    setCustomValue("");
  }

  return (
    <div
      className={cn(
        "space-y-4",
        embedded
          ? "rounded-xl border border-border/60 bg-background/80 p-3.5"
          : "rounded-2xl border border-border/80 bg-muted/15 p-4",
        className,
      )}
    >
      {!embedded ? (
        <div>
          <p className="text-sm font-semibold text-foreground">
            Funções necessárias neste evento
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Defina cada função e quantas pessoas são necessárias nesta data.
          </p>
        </div>
      ) : null}

      {selected.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma função definida ainda.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione pelo menos uma função para montar a escala depois.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {selected.map((item) => (
            <li
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {formatRosterRole(item.label)}
                </p>
                <p className="text-xs text-muted-foreground">Pessoas necessárias</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border/70 bg-muted/20">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    disabled={
                      disabled || item.requiredCount <= ROSTER_SLOT_MIN_REQUIRED_COUNT
                    }
                    aria-label={`Diminuir quantidade de ${formatRosterRole(item.label)}`}
                    onClick={() =>
                      onChange(
                        updateRosterSlotPlanCount(
                          value,
                          item.label,
                          item.requiredCount - 1,
                        ),
                      )
                    }
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <Input
                    type="number"
                    min={ROSTER_SLOT_MIN_REQUIRED_COUNT}
                    max={ROSTER_SLOT_MAX_REQUIRED_COUNT}
                    value={item.requiredCount}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange(
                        updateRosterSlotPlanCount(
                          value,
                          item.label,
                          clampRosterRequiredCount(Number(event.target.value)),
                        ),
                      )
                    }
                    className="h-8 w-12 border-0 bg-transparent px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label={`Quantidade para ${formatRosterRole(item.label)}`}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    disabled={
                      disabled ||
                      item.requiredCount >= ROSTER_SLOT_MAX_REQUIRED_COUNT
                    }
                    aria-label={`Aumentar quantidade de ${formatRosterRole(item.label)}`}
                    onClick={() =>
                      onChange(
                        updateRosterSlotPlanCount(
                          value,
                          item.label,
                          item.requiredCount + 1,
                        ),
                      )
                    }
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remover ${formatRosterRole(item.label)}`}
                  onClick={() => onChange(removeRosterSlotPlanItem(value, item.label))}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sugestões rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(addRosterSlotPlanItem(value, preset.id))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                  "hover:border-foreground/20 hover:text-foreground disabled:opacity-50",
                )}
              >
                <Plus className="size-3.5" aria-hidden />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Personalizado
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder="Ex.: Recepção, som, vocal..."
            disabled={disabled}
            className="rounded-xl border-border/70 bg-background/80"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomValue();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !customValue.trim()}
            onClick={addCustomValue}
            className="shrink-0"
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
