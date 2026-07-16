"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FloatingSaveBarProps {
  visible: boolean;
  saving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
  message?: string;
  className?: string;
}

/**
 * Discord-style floating save bar — fixed to the viewport bottom when the form is dirty.
 * Accounts for the desktop sidebar width (`lg:w-56`).
 */
export function FloatingSaveBar({
  visible,
  saving = false,
  onDiscard,
  onSave,
  message = "Você tem alterações não salvas!",
  className,
}: FloatingSaveBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    document.body.dataset.floatingSaveBar = "true";
    return () => {
      delete document.body.dataset.floatingSaveBar;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Keeps the last form fields above the fixed bar */}
      <div className="h-20 w-full shrink-0" aria-hidden />
      {mounted
        ? createPortal(
            <div
              className={cn(
                "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4",
                "lg:pl-56",
                className,
              )}
              role="status"
              aria-live="polite"
            >
              <div
                className={cn(
                  "pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3",
                  "rounded-xl border border-border/80 bg-foreground px-4 py-3 text-background shadow-elevated",
                  "animate-in fade-in slide-in-from-bottom-2 duration-200",
                )}
              >
                <p className="min-w-0 text-sm font-medium text-background/90">
                  {message}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={onDiscard}
                    className="text-background/80 hover:bg-background/10 hover:text-background"
                  >
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving}
                    onClick={onSave}
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Salvando
                      </>
                    ) : (
                      "Salvar alterações"
                    )}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
