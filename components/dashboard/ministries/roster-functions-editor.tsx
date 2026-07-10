"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { SettingsSaveBar } from "@/components/dashboard/settings/settings-shared";
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

interface RosterFunctionsEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  dirty?: boolean;
  saving?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
}

export function RosterFunctionsEditor({
  value,
  onChange,
  disabled = false,
  dirty = false,
  saving = false,
  onDiscard,
  onSave,
}: RosterFunctionsEditorProps) {
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
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/10">
      <div className="space-y-5 p-4 sm:p-5">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Suas funções na escala
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cadastre como você costuma servir neste ministério. Remova com o ×
              quando não fizer mais sentido.
            </p>
          </div>

          {selected.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-background/60 px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma função cadastrada ainda.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use as sugestões abaixo ou digite algo personalizado.
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
                      disabled={disabled || saving}
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
        </div>

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
                  disabled={disabled || saving}
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
              placeholder="Ex.: Recepção, infantil, coordenação..."
              disabled={disabled || saving}
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
              disabled={disabled || saving || !customValue.trim()}
              onClick={addCustomValue}
              className="shrink-0"
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {dirty && onSave && onDiscard && (
        <SettingsSaveBar
          visible
          saving={saving}
          onDiscard={onDiscard}
          onSave={onSave}
        />
      )}
    </div>
  );
}