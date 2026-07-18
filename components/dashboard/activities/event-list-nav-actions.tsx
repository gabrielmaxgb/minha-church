"use client";

import Link from "next/link";
import { CalendarClock, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  activitiesCalendarPath,
  activityDetailPath,
} from "@/constants/routes";
import { dateKeyFromIso } from "@/lib/events/calendar";
import { cn } from "@/lib/utils";

interface EventListNavActionsProps {
  eventId: string;
  startsAt: string;
  /** Leva ao detalhe da ocorrência (a “próxima” nas listagens colapsadas). */
  showOccurrence?: boolean;
  /** Abre o calendário de atividades na data do evento. */
  showCalendar?: boolean;
  size?: "sm" | "default";
  className?: string;
}

/**
 * Ações de navegação para listas/cards de evento.
 * Não use no calendário nem na página de detalhe/recorrência
 * (lá já existem “Ver no calendário” e a nav de ocorrências).
 */
export function EventListNavActions({
  eventId,
  startsAt,
  showOccurrence = true,
  showCalendar = false,
  size = "sm",
  className,
}: EventListNavActionsProps) {
  if (!showOccurrence && !showCalendar) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {showOccurrence ? (
        <Button type="button" size={size} asChild>
          <Link
            href={activityDetailPath(eventId)}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <CalendarClock className="size-4" />
            Ver próxima ocorrência
          </Link>
        </Button>
      ) : null}

      {showCalendar ? (
        <Button type="button" size={size} asChild>
          <Link
            href={activitiesCalendarPath(dateKeyFromIso(startsAt))}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <CalendarDays className="size-4" />
            Ver no calendário
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
