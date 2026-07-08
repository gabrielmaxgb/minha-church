"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EventFormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Sem card interno — útil quando o conteúdo já traz seus próprios blocos */
  bare?: boolean;
}

export function EventFormSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  bare = false,
}: EventFormSectionProps) {
  return (
    <section className={cn("space-y-3.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
              <Icon className="size-4" aria-hidden />
            </div>
          ) : null}
          <div className="min-w-0 pt-0.5">
            <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
      </div>

      {bare ? (
        children
      ) : (
        <div
          className={cn(
            "rounded-2xl border border-border/70 bg-muted/10 p-4 sm:p-5",
            contentClassName,
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
