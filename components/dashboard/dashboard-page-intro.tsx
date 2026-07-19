"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  domainMark,
  type ProductDomain,
} from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export type DashboardPageIntroProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Domain accent for the hairline. Defaults to settings (neutral). */
  domain?: ProductDomain;
  /** Override hairline color (e.g. giving trust token). */
  accentClassName?: string;
  action?: ReactNode;
  className?: string;
  /** Skip enter motion when nested inside another animated shell. */
  animate?: boolean;
};

export function DashboardPageIntro({
  eyebrow,
  title,
  description,
  domain = "settings",
  accentClassName,
  action,
  className,
  animate = true,
}: DashboardPageIntroProps) {
  const reduceMotion = useReducedMotion();
  const hairline = accentClassName ?? domainMark[domain];

  const body = (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <div className={cn("mt-3 h-px w-10", hairline)} />
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
          {action}
        </div>
      ) : null}
    </div>
  );

  if (!animate || reduceMotion) {
    return body;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {body}
    </motion.div>
  );
}
