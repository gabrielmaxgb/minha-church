import { cn } from "@/lib/utils";

interface EventHighlightNoteProps {
  note: string;
  className?: string;
}

export function EventHighlightNote({ note, className }: EventHighlightNoteProps) {
  const trimmed = note.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <aside
      className={cn(
        "rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800/80 dark:text-amber-300/90">
        Destaque
      </p>
      <p className="mt-1.5 whitespace-pre-line text-sm font-medium leading-relaxed text-foreground">
        {trimmed}
      </p>
    </aside>
  );
}
