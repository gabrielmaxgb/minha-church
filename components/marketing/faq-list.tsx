import type { FaqItem } from "@/constants/faq";

import { cn } from "@/lib/utils";

interface FaqListProps {
  items: FaqItem[];
  className?: string;
}

export function FaqList({ items, className }: FaqListProps) {
  return (
    <div className={cn("divide-y divide-border rounded-lg border border-border", className)}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
