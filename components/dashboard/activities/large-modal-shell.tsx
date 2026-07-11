"use client";

import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface LargeModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  disabled?: boolean;
  titleId?: string;
  className?: string;
}

export function LargeModalShell({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  disabled = false,
  titleId,
  className,
}: LargeModalShellProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !disabled) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, disabled]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 lg:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(96dvh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-border/80 bg-background shadow-popover sm:rounded-xl",
          className,
        )}
      >
        <header className="shrink-0 border-b border-border/80 bg-muted/15 px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4 pr-10">
            {Icon ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                <Icon className="size-5" aria-hidden />
              </div>
            ) : null}

            <div className="min-w-0 flex-1 space-y-1">
              <h2
                id={titleId}
                className="text-xl font-semibold tracking-tight sm:text-2xl"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className="absolute right-4 top-4 rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 sm:right-5 sm:top-5"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-border/80 bg-muted/10 px-5 py-4 sm:px-8">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
