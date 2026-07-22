"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toasts globais do app (erros de API, sucesso de ações, avisos transitórios).
 * Preferir `toastError` / `toastSuccess` / `toastApiError` de `@/lib/ui/toast`.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={4500}
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-card-foreground shadow-popover",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          closeButton: "border-border bg-card text-foreground",
        },
      }}
    />
  );
}
