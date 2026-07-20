import { cn } from "@/lib/utils";

/**
 * Trilho de tabs / filtros segmentados no dashboard.
 * Selected = tinta (preto) no claro — padrão único do app.
 */
export function segmentedListClassName(className?: string) {
  return cn(
    "inline-flex gap-0.5 rounded-xl border border-border/80 bg-muted/30 p-1",
    className,
  );
}

export function segmentedTriggerClassName(
  selected: boolean,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors",
    selected
      ? "bg-foreground font-medium text-background"
      : "font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    className,
  );
}
