import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { HoverLift } from "@/components/motion/dashboard-motion";
import { cn } from "@/lib/utils";

export interface DashboardMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon: LucideIcon;
  accent: "emerald" | "sky" | "amber" | "violet";
}

const accentStyles = {
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    ring: "group-hover:ring-emerald-500/20",
    value: "text-emerald-950 dark:text-emerald-50",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    ring: "group-hover:ring-sky-500/20",
    value: "text-sky-950 dark:text-sky-50",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    ring: "group-hover:ring-amber-500/20",
    value: "text-amber-950 dark:text-amber-50",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    ring: "group-hover:ring-violet-500/20",
    value: "text-violet-950 dark:text-violet-50",
  },
} as const;

export function DashboardMetricCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  accent,
}: DashboardMetricCardProps) {
  const styles = accentStyles[accent];

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-soft ring-1 ring-transparent transition-all duration-300 hover:shadow-elevated",
        href && "cursor-pointer",
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>

        {href && (
          <span className="flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-bold tracking-tight",
          styles.value,
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );

  if (!href) {
    return <HoverLift>{content}</HoverLift>;
  }

  return (
    <HoverLift>
      <Link href={href} className="block focus-visible:outline-none">
        {content}
      </Link>
    </HoverLift>
  );
}
