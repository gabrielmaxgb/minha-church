"use client";

import Link from "next/link";
import { Calendar, MapPin, Pencil, Repeat, Sparkles } from "lucide-react";

import { HoverLift } from "@/components/motion/dashboard-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { cn, formatDateTime } from "@/lib/utils";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import type { ChurchEvent } from "@/types/events";

interface ActivityEventCardProps {
  event: ChurchEvent;
  highlighted?: boolean;
  canManage?: boolean;
  manageActionsBlocked?: boolean;
  manageBlockTitle?: string;
  onEdit?: (event: ChurchEvent) => void;
}

export function ActivityEventCard({
  event,
  highlighted = event.isChurchWide,
  canManage = false,
  manageActionsBlocked = false,
  manageBlockTitle,
  onEdit,
}: ActivityEventCardProps) {
  return (
    <HoverLift>
      <Link href={activityDetailPath(event.id)} className="block">
        <article
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-soft transition-shadow duration-300 hover:shadow-elevated",
            highlighted
              ? "border-primary/15 bg-gradient-to-br from-card to-muted/40"
              : "border-border/70",
          )}
        >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium tracking-tight text-foreground">
                {event.name}
              </h3>
              {event.isChurchWide && (
                <Badge className="gap-1.5">
                  <Sparkles className="size-3" />
                  Igreja
                </Badge>
              )}
              {event.recurrence && (
                <Badge variant="secondary" className="gap-1.5">
                  <Repeat className="size-3" />
                  Recorrente
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            )}
            {event.recurrence && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formatRecurrenceSummary(event.recurrence, event.startsAt)}
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
                variant="outline"
                className="shrink-0"
                disabled={manageActionsBlocked}
                title={manageActionsBlocked ? manageBlockTitle : undefined}
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  clickEvent.stopPropagation();
                  onEdit(event);
                }}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <span className="inline-flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-muted/80">
              <Calendar className="size-3.5 shrink-0 text-foreground/70" />
            </span>
            <span>
              {event.recurrence && (
                <span className="mr-1.5 font-medium text-foreground">
                  Próxima:
                </span>
              )}
              {formatDateTime(event.startsAt)}
              {event.endsAt && ` — ${formatDateTime(event.endsAt)}`}
            </span>
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-muted/80">
                <MapPin className="size-3.5 shrink-0 text-foreground/70" />
              </span>
              {event.location}
            </span>
          )}
        </div>
      </article>
      </Link>
    </HoverLift>
  );
}
