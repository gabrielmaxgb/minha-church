const accentBar =
  "before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:rounded-full before:bg-attention-emphasis";

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
    md: "flex size-12 shrink-0 items-center justify-center rounded-xl border border-attention-border bg-attention-mark text-attention-foreground",
    section: "text-attention-foreground",
  },
  iconText: "text-attention-foreground/80",
  label:
    "text-xs font-semibold uppercase tracking-wider text-attention-foreground/75",
  badge:
    "border border-attention-border/80 bg-attention-mark text-attention-foreground font-medium hover:bg-attention-mark",
  countBadge:
    "border border-attention-border bg-attention-mark text-attention-foreground font-semibold tabular-nums",
  bellBadge:
    "absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full border border-attention-border bg-attention-mark text-[10px] font-semibold text-attention-foreground tabular-nums",
  schedule: {
    pill:
      "border border-attention-border/80 bg-attention-mark text-attention-foreground",
    dot: "bg-attention-emphasis",
    card:
      "overflow-hidden rounded-xl border border-attention-border/70 bg-card",
    cardHeader:
      "border-b border-attention-border/60 bg-attention-subtle px-4 py-3 sm:px-5",
  },
} as const;
