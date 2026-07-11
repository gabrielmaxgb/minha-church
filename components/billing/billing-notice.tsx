import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BillingNoticeTone = "info" | "urgent" | "critical";

const toneStyles: Record<
  BillingNoticeTone,
  {
    shell: string;
    icon: string;
  }
> = {
  info: {
    shell:
      "border-billing-border bg-gradient-to-br from-billing-subtle via-billing-subtle to-card shadow-xs ring-1 ring-billing/15",
    icon: "bg-billing-mark text-billing-foreground",
  },
  urgent: {
    shell:
      "border-billing-border bg-gradient-to-br from-billing-subtle via-billing-mark/80 to-billing-subtle shadow-xs ring-1 ring-billing/25",
    icon: "bg-billing text-white",
  },
  critical: {
    shell:
      "border-billing/45 bg-gradient-to-br from-billing-mark via-billing-subtle to-destructive/8 shadow-xs ring-1 ring-billing/30",
    icon: "bg-billing text-white",
  },
};

interface BillingNoticeProps {
  tone?: BillingNoticeTone;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Aviso de assinatura/billing com identidade visual própria. */
export function BillingNotice({
  tone = "info",
  icon: Icon,
  title,
  description,
  action,
  className,
}: BillingNoticeProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl border px-4 py-4 sm:px-5",
        styles.shell,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-billing"
        aria-hidden
      />
      <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
              styles.icon,
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-billing-foreground">
              Assinatura
            </p>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
        {action ? <div className="sm:shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
