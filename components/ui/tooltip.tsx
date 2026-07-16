"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "top" | "bottom";
};

export function Tooltip({
  content,
  children,
  className,
  contentClassName,
  side = "top",
}: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex max-w-full", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs leading-relaxed text-popover-foreground shadow-popover",
          "opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top"
            ? "bottom-full mb-2 origin-bottom"
            : "top-full mt-2 origin-top",
          contentClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
