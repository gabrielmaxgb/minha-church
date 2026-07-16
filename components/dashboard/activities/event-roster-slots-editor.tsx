"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addRosterSlotPlanItem,
  CHURCH_WIDE_DEFAULT_ROSTER_ROLE,
  formatRosterRole,
  isRosterRoleSelected,
  normalizeRosterRoleValue,
  normalizeRosterSlotPlan,
  removeRosterSlotPlanItem,
  ROSTER_ROLE_PRESETS,
  type RosterSlotPlanItem,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";

interface EventRosterSlotsEditorProps {
  value: RosterSlotPlanItem[];
  onChange: (next: RosterSlotPlanItem[]) => void;
  disabled?: boolean;
  className?: string;
  embedded?: boolean;
  compact?: boolean;
  /** Atividade da igreja: funções opcionais; equipe só marca disponibilidade. */
  optional?: boolean;
  /** Funções que não podem ser removidas (ex.: Voluntário no ministério). */
  lockedLabels?: string[];
}

function RosterSlotTile({
  item,
  value,
  disabled,
  lockedLabels,
  onChange,
}: {
  item: RosterSlotPlanItem;
  value: RosterSlotPlanItem[];
  disabled: boolean;
  lockedLabels?: string[];
  onChange: (next: RosterSlotPlanItem[]) => void;
}) {
  const label = formatRosterRole(item.label);
  const locked = lockedLabels?.some(
    (lockedLabel) =>
      normalizeRosterRoleValue(lockedLabel) ===
      normalizeRosterRoleValue(item.label),
  );

  return (
    <li className="group relative rounded-lg border border-border/70 bg-background px-2.5 py-2 shadow-sm transition-colors hover:border-border">
      <p
        className={cn(
          "min-w-0 text-sm font-medium leading-tight text-foreground",
          !locked && "pr-5",
        )}
        title={label}
      >
        {label}
        {locked ? (
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Padrão
          </span>
        ) : null}
      </p>

      {!locked ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={`Remover ${label}`}
          onClick={() =>
            onChange(removeRosterSlotPlanItem(value, item.label, { lockedLabels }))
          }
          className="absolute right-1.5 top-1.5 rounded-md p-0.5 text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

export function EventRosterSlotsEditor({
  value,
  onChange,
  disabled = false,
  className,
  embedded = false,
  compact = false,
  optional = false,
  lockedLabels,
}: EventRosterSlotsEditorProps) {
  const [customValue, setCustomValue] = useState("");
  const dense = compact || embedded;

  const selected = normalizeRosterSlotPlan(value);
  const suggestions = ROSTER_ROLE_PRESETS.filter(
    (preset) =>
      (!optional || preset.id !== CHURCH_WIDE_DEFAULT_ROSTER_ROLE) &&
      !lockedLabels?.some(
        (locked) => normalizeRosterRoleValue(locked) === preset.id,
      ) &&
      !isRosterRoleSelected(selected.map((item) => item.label), preset.id),
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
        dense ? "space-y-2.5" : "space-y-4",
        embedded
          ? "rounded-lg border border-border/50 bg-background/80 p-2.5"
          : "rounded-xl border border-border/80 bg-muted/15 p-4",
        className,
      )}
    >
      {!embedded ? (
        <div>
          <p className="text-sm font-semibold text-foreground">
            {optional
              ? "Funções para a escala (opcional)"
              : "Funções necessárias neste evento"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {optional
              ? "A equipe marca se pode servir; você escolhe a função ao montar a escala."
              : "Defina as funções necessárias nesta data."}
          </p>
        </div>
      ) : optional ? (
        <div>
          <p className="text-sm font-medium text-foreground">
            Funções para a escala (opcional)
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ex.: Recepção, mídia. Sem funções definidas, a escala usa &quot;Voluntário&quot;.
          </p>
        </div>
      ) : null}

      {selected.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border border-dashed border-border/80 bg-background/60 text-center",
            dense ? "px-3 py-4" : "rounded-xl px-4 py-5",
          )}
        >
          <p className={cn("text-muted-foreground", dense ? "text-xs" : "text-sm")}>
            {optional
              ? "Nenhuma função definida."
              : "Nenhuma função definida ainda."}
          </p>
          {!dense && (
            <p className="mt-1 text-xs text-muted-foreground">
              {optional
                ? "Opcional — ao montar a escala, quem estiver disponível aparece como Voluntário."
                : "Adicione pelo menos uma função para montar a escala depois."}
            </p>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {selected.map((item) => (
            <RosterSlotTile
              key={item.label}
              item={item}
              value={value}
              disabled={disabled}
              lockedLabels={lockedLabels}
              onChange={onChange}
            />
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sugestões
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(addRosterSlotPlanItem(value, preset.id))}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-50",
                  dense
                    ? "px-2 py-0.5 text-[11px]"
                    : "gap-1.5 px-3 py-1.5 text-sm",
                )}
              >
                <Plus className={dense ? "size-3" : "size-3.5"} aria-hidden />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("flex gap-1.5", dense ? "flex-row" : "flex-col gap-2 sm:flex-row")}>
        <Input
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          placeholder={dense ? "Outra função..." : "Ex.: Recepção, infantil, coordenação..."}
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 border-border/70 bg-background/80",
            dense ? "h-8 rounded-lg text-sm" : "rounded-xl",
          )}
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
          className={cn("shrink-0", dense && "h-8 px-2.5")}
          size={dense ? "sm" : "default"}
        >
          <Plus className="size-3.5" />
          {!dense && "Adicionar"}
        </Button>
      </div>
    </div>
  );
}
