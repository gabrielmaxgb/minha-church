"use client";

import { cn } from "@/lib/utils";
import type { EventMutationScope } from "@/types/events";

const SCOPE_OPTIONS: Array<{
  value: EventMutationScope;
  label: string;
  description: string;
}> = [
  {
    value: "this",
    label: "Somente este evento",
    description: "Altera só esta ocorrência da série.",
  },
  {
    value: "this_and_following",
    label: "Este e os seguintes",
    description: "Aplica a esta data e a todas as próximas.",
  },
  {
    value: "all",
    label: "Todos os eventos da série",
    description: "Aplica a todas as ocorrências, passadas e futuras.",
  },
];

interface EventMutationScopeFieldsProps {
  value: EventMutationScope;
  onChange: (scope: EventMutationScope) => void;
  disabled?: boolean;
  actionLabel?: "edit" | "delete" | "collection";
  name?: string;
}

export function EventMutationScopeFields({
  value,
  onChange,
  disabled = false,
  actionLabel = "edit",
  name = "event-mutation-scope",
}: EventMutationScopeFieldsProps) {
  const title =
    actionLabel === "delete"
      ? "Excluir eventos recorrentes"
      : actionLabel === "collection"
        ? "Alcance da coleta de disponibilidade"
        : "Editar eventos recorrentes";

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </legend>
      <p className="text-sm text-muted-foreground">
        {actionLabel === "collection"
          ? "Escolha se abre ou fecha a coleta só nesta data, nesta e nas próximas, ou em toda a série."
          : "Escolha o alcance, como no Google Agenda."}
      </p>

      <div className="space-y-2">
        {SCOPE_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors",
                selected
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/80 bg-background hover:bg-muted/40",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 accent-foreground"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
