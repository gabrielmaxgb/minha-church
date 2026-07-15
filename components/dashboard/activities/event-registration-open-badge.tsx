"use client";

import { Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  isEventRegistrationOpen,
  isEventRegistrationPaid,
} from "@/lib/events/registration";
import { cn, formatCurrency } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

export function EventRegistrationOpenBadge({
  event,
  className,
  showPrice = false,
}: {
  event: Pick<ChurchEvent, "registrationOpen" | "priceCents">;
  className?: string;
  /** Exibe Gratuita / valor ao lado do texto. */
  showPrice?: boolean;
}) {
  if (!isEventRegistrationOpen(event)) {
    return null;
  }

  const paid = isEventRegistrationPaid(event);
  const suffix =
    showPrice && paid && event.priceCents != null
      ? ` · ${formatCurrency(event.priceCents / 100)}`
      : showPrice
        ? " · gratuita"
        : "";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-success/30 bg-success-subtle font-medium text-success-foreground",
        className,
      )}
    >
      <Ticket className="size-3" aria-hidden />
      Inscrições abertas{suffix}
    </Badge>
  );
}
