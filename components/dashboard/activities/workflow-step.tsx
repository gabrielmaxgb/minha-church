"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  step: number;
  title: string;
  description: string;
  complete?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Painel em coluna (workflow horizontal) vs linha do tempo vertical */
  variant?: "timeline" | "panel";
}

function StepBadge({
  step,
  complete,
  disabled,
  size = "default",
}: {
  step: number;
  complete: boolean;
  disabled: boolean;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 font-bold",
        size === "sm" ? "size-6 text-[10px]" : "size-7 text-xs",
        complete
          ? "border-emerald-600 bg-emerald-600 text-white"
          : disabled
            ? "border-border bg-muted text-muted-foreground"
            : "border-foreground bg-background text-foreground",
      )}
      aria-hidden
    >
      {complete ? <Check className={size === "sm" ? "size-3" : "size-3.5"} /> : step}
    </div>
  );
}

export function WorkflowStep({
  step,
  title,
  description,
  complete = false,
  disabled = false,
  children,
  className,
  variant = "timeline",
}: WorkflowStepProps) {
  if (variant === "panel") {
    return (
      <section
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm",
          disabled && "opacity-55",
          className,
        )}
        aria-disabled={disabled}
      >
        <header className="flex items-start gap-2.5 border-b border-border/50 bg-muted/20 px-3 py-2.5">
          <StepBadge step={step} complete={complete} disabled={disabled} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {description}
            </p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative border-l-2 border-border/70 pl-7 sm:pl-9",
        disabled && "opacity-55",
        className,
      )}
      aria-disabled={disabled}
    >
      <div className="absolute -left-[0.9375rem] top-0">
        <StepBadge step={step} complete={complete} disabled={disabled} />
      </div>

      <div className="pb-1">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
