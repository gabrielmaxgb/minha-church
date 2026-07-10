"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DashboardMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}

export function DashboardMetricCard({
  label,
  value,
  hint,
  href,
}: DashboardMetricCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        href && "transition-colors duration-150 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {href && (
          <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus-visible:outline-none">
      {content}
    </Link>
  );
}
