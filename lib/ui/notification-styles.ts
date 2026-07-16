const accentBar =
  "before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-full before:bg-signal";

/** Soft amber attention tokens — see `globals.css` `--attention-*`. */
export const pendingNotificationStyles = {
  banner: {
    compact:
      "rounded-xl border border-attention-border bg-attention-subtle px-4 py-3",
    full: `relative overflow-hidden rounded-xl border border-attention-border/80 bg-attention-subtle py-5 pl-5 pr-5 sm:py-6 sm:pl-6 sm:pr-6 ${accentBar}`,
    inline:
      "rounded-xl border border-attention-border bg-attention-subtle px-4 py-3",
    interactive: `group relative block overflow-hidden rounded-xl border border-attention-border/80 bg-attention-subtle py-5 pl-5 pr-5 transition-colors hover:border-attention-border sm:py-6 sm:pl-6 sm:pr-6 ${accentBar}`,
    section:
      "rounded-xl border border-attention-border bg-attention-subtle p-5",
    item: "flex items-start gap-3 rounded-xl border border-attention-border/70 bg-card/70 px-3 py-2.5 transition-colors hover:bg-card",
  },
  icon: {
    sm: "flex size-7 shrink-0 items-center justify-center rounded-lg bg-attention-mark text-attention-foreground",
    // Chip "cheio" do banner hero — nível 4: precisa saltar no primeiro olhar.
    md: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-signal text-attention-solid-foreground shadow-xs",
    section: "text-attention-foreground",
  },
  iconText: "text-attention-foreground/80",
  label:
    "text-xs font-semibold uppercase tracking-wider text-attention-foreground/75",
  badge:
    "border border-attention-border/80 bg-attention-mark text-attention-foreground font-medium hover:bg-attention-mark",
  // Contadores de pendência: preenchimento sólido para passar no teste da vesguice.
  countBadge:
    "bg-signal text-attention-solid-foreground font-semibold tabular-nums",
  bellBadge:
    "absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-signal text-[10px] font-semibold text-attention-solid-foreground tabular-nums ring-2 ring-background",
  /** Ponto de sinal "vivo" (novo/pendente). Combine com `signal-pulse` para
   *  itens genuinamente novos. Sólido + anel para descolar do fundo. */
  dot: "inline-block size-2 shrink-0 rounded-full bg-signal ring-2 ring-signal-ring",
  dotStandalone:
    "relative inline-flex size-2 shrink-0 rounded-full bg-signal ring-2 ring-signal-ring",
  schedule: {
    pill:
      "border border-attention-border/80 bg-attention-mark text-attention-foreground",
    dot: "bg-signal",
    card:
      "overflow-hidden rounded-xl border border-attention-border/70 bg-card",
    cardHeader:
      "border-b border-attention-border/60 bg-attention-subtle px-4 py-3 sm:px-5",
  },
} as const;
