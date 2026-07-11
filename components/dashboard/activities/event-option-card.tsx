"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EventOptionCardProps {
  type: "radio" | "checkbox";
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  disabled?: boolean;
  compact?: boolean;
}

export function EventOptionCard({
  type,
  name,
  checked,
  onChange,
  title,
  description,
  icon: Icon,
  disabled,
  compact = false,
}: EventOptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border transition-all",
        compact ? "px-3.5 py-3" : "px-4 py-3.5",
        checked
          ? "border-primary/40 bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.08)]"
          : "border-border/70 bg-background hover:border-border hover:bg-muted/20",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type={type}
        name={name}
        className="mt-0.5 size-4 shrink-0 border-border accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span className="flex min-w-0 flex-1 items-start gap-2.5">
        {Icon ? (
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
              checked
                ? "bg-primary/12 text-primary"
                : "bg-muted/60 text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </span>
        ) : null}

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </label>
  );
}
