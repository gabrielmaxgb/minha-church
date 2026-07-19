"use client";

import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

import { ModalPortal } from "@/components/ui/modal-portal";
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
  /** default ≈ 5xl/920px · workspace ≈ quase viewport (escala, etc.) */
  size?: "default" | "workspace";
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
  size = "default",
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

  const isWorkspace = size === "workspace";

  return (
    <ModalPortal>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center",
          isWorkspace ? "sm:p-3 lg:p-4" : "sm:p-4 lg:p-6",
        )}
      >
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
            "relative z-10 flex w-full flex-col overflow-hidden rounded-t-xl border border-border/80 bg-background shadow-popover sm:rounded-xl",
            isWorkspace
              ? "h-[100dvh] max-h-[100dvh] max-w-none sm:h-[min(96dvh,1200px)] sm:max-h-[min(96dvh,1200px)] sm:w-[min(96vw,1440px)]"
              : "max-h-[min(96dvh,920px)] max-w-5xl",
            className,
          )}
        >
          <header
            className={cn(
              "shrink-0 border-b border-border/80 bg-muted/15",
              isWorkspace
                ? "px-4 py-3.5 sm:px-6 sm:py-4"
                : "px-5 py-5 sm:px-8 sm:py-6",
            )}
          >
            <div className="flex items-start gap-3 pr-10 sm:gap-4">
              {Icon ? (
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-xl bg-foreground text-background",
                    isWorkspace ? "size-10" : "size-12",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </div>
              ) : null}

              <div className="min-w-0 flex-1 space-y-0.5">
                <h2
                  id={titleId}
                  className={cn(
                    "font-semibold tracking-tight",
                    isWorkspace
                      ? "text-lg sm:text-xl"
                      : "text-xl sm:text-2xl",
                  )}
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

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto",
              isWorkspace ? "px-4 py-4 sm:px-6" : "px-5 py-6 sm:px-8",
            )}
          >
            {children}
          </div>

          {footer ? (
            <footer className="shrink-0 border-t border-border/80 bg-muted/10 px-5 py-4 sm:px-8">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </ModalPortal>
  );
}
