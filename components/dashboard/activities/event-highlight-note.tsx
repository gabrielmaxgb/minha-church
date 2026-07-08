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
    <div
      className={cn(
        "rounded-2xl border-l-4 border-primary bg-primary/5 px-5 py-4",
        className,
      )}
    >
      <p className="whitespace-pre-line text-base font-medium leading-relaxed text-foreground">
        {trimmed}
      </p>
    </div>
  );
}
