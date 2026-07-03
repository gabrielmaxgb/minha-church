"use client";

import { Building2, Loader2 } from "lucide-react";

interface ChurchSwitchOverlayProps {
  churchName: string;
}

export function ChurchSwitchOverlay({ churchName }: ChurchSwitchOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="church-switch-title"
      aria-describedby="church-switch-description"
    >
      <div className="mx-4 flex max-w-sm flex-col items-center rounded-2xl border border-border/80 bg-surface-elevated px-8 py-10 text-center shadow-elevated">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="size-7" aria-hidden />
        </div>

        <Loader2
          className="mb-4 size-8 animate-spin text-primary"
          aria-hidden
        />

        <p
          id="church-switch-title"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Trocando de igreja
        </p>

        <p
          id="church-switch-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          Carregando dados de{" "}
          <span className="font-medium text-foreground">{churchName}</span>
          …
        </p>
      </div>
    </div>
  );
}
