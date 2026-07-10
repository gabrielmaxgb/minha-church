"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

export type MinistryPermissionField = "canManageEvents" | "canManageRoster";

interface MinistryPermissionDefinition {
  field: MinistryPermissionField;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const MINISTRY_PERMISSIONS: MinistryPermissionDefinition[] = [
  {
    field: "canManageEvents",
    label: "Gerenciar eventos",
    description: "Cria e edita atividades deste ministério.",
    icon: Calendar,
  },
  {
    field: "canManageRoster",
    label: "Gerenciar escalas",
    description:
      "Monta a escala oficial escolhendo entre quem marcou disponibilidade.",
    icon: CalendarDays,
  },
];

function PermissionSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Alternar ${label}`}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-foreground" : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function MinistryPermissionToggle({
  permission,
  checked,
  disabled,
  onToggle,
}: {
  permission: MinistryPermissionDefinition;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const Icon = permission.icon;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
        checked
          ? "border-violet-500/35 bg-violet-500/6"
          : "border-border/60 bg-card/40",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors",
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            checked
              ? "bg-violet-500/10"
              : "bg-muted/50 group-hover:bg-muted group-disabled:group-hover:bg-muted/50",
          )}
        >
          <Icon
            className={cn(
              "size-4",
              checked ? "text-violet-800 dark:text-violet-300" : "text-muted-foreground",
            )}
            aria-hidden
          />
        </span>

        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-medium leading-tight">
            {permission.label}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {permission.description}
          </span>
        </span>
      </button>

      <PermissionSwitch
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        label={permission.label}
      />
    </div>
  );
}
