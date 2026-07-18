"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

import type { DashboardPriorityItem } from "@/lib/dashboard/priority-items";
import { cn } from "@/lib/utils";

const toneStyles: Record<
  DashboardPriorityItem["tone"],
  { shell: string; icon: string }
> = {
  attention: {
    shell: "border-attention-border bg-attention-subtle/80 hover:bg-attention-subtle",
    icon: "bg-attention-mark text-attention-foreground",
  },
  schedules: {
    shell:
      "border-attention-border bg-gradient-to-br from-attention-subtle via-card to-card hover:border-attention/40",
    icon: "bg-attention-mark text-attention-foreground",
  },
  care: {
    shell: "border-border bg-card hover:bg-muted/50",
    icon: "bg-muted text-foreground",
  },
  communication: {
    shell:
      "border-domain-communication/30 bg-gradient-to-br from-domain-communication-subtle via-card to-card hover:border-domain-communication/45",
    icon: "bg-domain-communication/20 text-domain-communication-foreground",
  },
  activities: {
    shell:
      "border-domain-activities/30 bg-gradient-to-br from-domain-activities-subtle via-card to-card hover:border-domain-activities/45",
    icon: "bg-domain-activities/20 text-domain-activities-foreground",
  },
};

interface DashboardPrioritiesProps {
  items: DashboardPriorityItem[];
}

export function DashboardPriorities({ items }: DashboardPrioritiesProps) {
  if (items.length === 0) {
    return (
      <section className="flex h-full flex-col justify-start rounded-xl border border-dashed border-border bg-card/60 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-success-foreground">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-foreground">
              Nada urgente te espera agora
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Quando houver escalas, pedidos ou avisos, eles aparecem aqui.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const heading =
    items.length === 1
      ? "1 coisa pede você hoje"
      : `${items.length} coisas pedem você hoje`;

  return (
    <section className="flex h-full min-w-0 flex-col justify-start rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-foreground">{heading}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Resolva estas primeiro — o restante pode esperar
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item, index) => {
          const styles = toneStyles[item.tone];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors sm:px-4",
                  styles.shell,
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    styles.icon,
                  )}
                >
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
