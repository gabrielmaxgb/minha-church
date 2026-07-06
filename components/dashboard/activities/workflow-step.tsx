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
}

export function WorkflowStep({
  step,
  title,
  description,
  complete = false,
  disabled = false,
  children,
  className,
}: WorkflowStepProps) {
  return (
    <section
      className={cn(
        "relative border-l-2 border-border/70 pl-6 sm:pl-8",
        disabled && "opacity-55",
        className,
      )}
      aria-disabled={disabled}
    >
      <div
        className={cn(
          "absolute -left-[0.9375rem] top-0 flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
          complete
            ? "border-emerald-600 bg-emerald-600 text-white"
            : disabled
              ? "border-border bg-muted text-muted-foreground"
              : "border-foreground bg-background text-foreground",
        )}
        aria-hidden
      >
        {complete ? <Check className="size-3.5" /> : step}
      </div>

      <div className="pb-1">
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
