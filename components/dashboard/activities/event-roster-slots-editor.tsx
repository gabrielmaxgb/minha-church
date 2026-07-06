"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addRosterRole,
  formatRosterRole,
  isRosterRoleSelected,
  normalizeRosterRoleList,
  removeRosterRole,
  ROSTER_ROLE_PRESETS,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";

interface EventRosterSlotsEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
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

  const selected = normalizeRosterRoleList(value);
  const suggestions = ROSTER_ROLE_PRESETS.filter(
    (preset) => !isRosterRoleSelected(selected, preset.id),
  );

  function addCustomValue() {
    const trimmed = customValue.trim();

    if (!trimmed) {
      return;
    }

    onChange(addRosterRole(value, trimmed));
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
            Defina as vagas da escala para esta data. Você pode editar depois na
            tela da atividade.
          </p>
        </div>
      ) : null}

      {selected.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma função definida ainda.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione pelo menos uma vaga para montar a escala depois.
          </p>
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <li key={item}>
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-foreground/15 bg-foreground px-1 pl-3 text-sm font-medium text-background">
                <span className="truncate">{formatRosterRole(item)}</span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remover ${formatRosterRole(item)}`}
                  onClick={() => onChange(removeRosterRole(value, item))}
                  className="rounded-full p-1 text-background/80 transition-colors hover:bg-background/15 hover:text-background disabled:opacity-50"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </span>
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
                onClick={() => onChange(addRosterRole(value, preset.id))}
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
