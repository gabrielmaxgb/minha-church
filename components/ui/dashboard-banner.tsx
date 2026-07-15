import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardBannerTone =
  | "billing"
  | "billing-urgent"
  | "billing-critical"
  | "attention"
  | "neutral";

const toneStyles: Record<
  DashboardBannerTone,
  {
    shell: string;
    icon: string;
    accent?: string;
    label?: string;
    title?: string;
    description?: string;
  }
> = {
  billing: {
    shell: "border-transparent bg-[#1a1a18] shadow-xs",
    icon: "bg-white/10 text-[#f4f4f1]",
    accent: "bg-white/40",
    label: "text-[#f4f4f1]/70",
    title: "text-[#f4f4f1]",
    description: "text-[#f4f4f1]/80",
  },
  "billing-urgent": {
    shell: "border-transparent bg-[#1a1a18] shadow-xs",
    icon: "bg-white/15 text-[#f4f4f1]",
    accent: "bg-attention",
    label: "text-[#f4f4f1]/70",
    title: "text-[#f4f4f1]",
    description: "text-[#f4f4f1]/80",
  },
  "billing-critical": {
    shell: "border-transparent bg-[#1a1a18] shadow-xs ring-1 ring-destructive/40",
    icon: "bg-destructive/90 text-white",
    accent: "bg-destructive",
    label: "text-[#f4f4f1]/70",
    title: "text-[#f4f4f1]",
    description: "text-[#f4f4f1]/80",
  },
  attention: {
    shell:
      "border-attention-border bg-gradient-to-br from-attention-subtle via-attention-subtle to-card shadow-xs ring-1 ring-attention/18",
    icon: "bg-attention-mark text-attention-foreground",
    accent: "bg-attention",
    label: "text-attention-foreground",
  },
  neutral: {
    shell: "border-border bg-card shadow-xs ring-1 ring-border/60",
    icon: "bg-muted text-foreground",
    accent: "bg-foreground/40",
    label: "text-muted-foreground",
  },
};

export interface DashboardBannerProps {
  tone?: DashboardBannerTone;
  icon?: LucideIcon;
  label?: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Banner padronizado do painel: ícone + título + texto à esquerda, CTAs à direita.
 * Cores variam por `tone`; o layout permanece o mesmo.
 */
export function DashboardBanner({
  tone = "neutral",
  icon: Icon,
  label,
  title,
  description,
  action,
  className,
}: DashboardBannerProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl border px-4 py-4 sm:px-5",
        styles.shell,
        className,
      )}
    >
      {styles.accent ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-1",
            styles.accent,
          )}
          aria-hidden
        />
      ) : null}

      <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {Icon ? (
            <div
              className={cn(
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                styles.icon,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
          ) : null}
          <div className="min-w-0 space-y-1">
            {label ? (
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  styles.label,
                )}
              >
                {label}
              </p>
            ) : null}
            <p
              className={cn(
                "text-sm font-semibold",
                styles.title ?? "text-foreground",
              )}
            >
              {title}
            </p>
            <div
              className={cn(
                "text-sm leading-relaxed",
                styles.description ?? "text-muted-foreground",
              )}
            >
              {description}
            </div>
          </div>
        </div>

        {action ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}
