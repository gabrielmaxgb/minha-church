"use client";

import { Calendar, MapPin, Pencil, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

interface ActivityEventCardProps {
  event: ChurchEvent;
  highlighted?: boolean;
  canManage?: boolean;
  onEdit?: (event: ChurchEvent) => void;
}

export function ActivityEventCard({
  event,
  highlighted = event.isChurchWide,
  canManage = false,
  onEdit,
}: ActivityEventCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-background p-5",
        highlighted
          ? "border-foreground/25 bg-muted/30 shadow-sm"
          : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{event.name}</h3>
            {event.isChurchWide && (
              <Badge className="gap-1">
                <Sparkles className="size-3" />
                Igreja
              </Badge>
            )}
          </div>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!event.isChurchWide && event.ministryName && (
            <Badge variant="secondary">{event.ministryName}</Badge>
          )}
          {canManage && onEdit && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => onEdit(event)}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
        <span className="inline-flex items-center gap-2">
          <Calendar className="size-4 shrink-0" />
          {formatDateTime(event.startsAt)}
          {event.endsAt && ` — ${formatDateTime(event.endsAt)}`}
        </span>
        {event.location && (
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {event.location}
          </span>
        )}
      </div>
    </article>
  );
}
