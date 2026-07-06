"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Repeat,
  Sparkles,
} from "lucide-react";

import { EditActivityModal } from "@/components/dashboard/activities/edit-activity-modal";
import { EventRosterSection } from "@/components/dashboard/activities/event-roster-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activityDetailPath,
  AUTH_ROUTES,
  ministryDetailPath,
} from "@/constants/routes";
import { useChurchEvent } from "@/lib/api/queries";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import { canManageActivity, canManageMinistryRoster } from "@/lib/permissions";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";

interface ActivityDetailContentProps {
  eventId: string;
}

function OccurrenceRow({
  occurrence,
  isCurrent,
}: {
  occurrence: ChurchEvent;
  isCurrent: boolean;
}) {
  const isPast = new Date(occurrence.startsAt).getTime() < Date.now();

  return (
    <Link
      href={activityDetailPath(occurrence.id)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors hover:bg-muted/40",
        isCurrent
          ? "border-primary/20 bg-primary/5"
          : "border-border/70 bg-card",
        isPast && !isCurrent && "opacity-60",
      )}
    >
      <span className="inline-flex items-center gap-2 text-foreground">
        <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
        {formatDateTime(occurrence.startsAt)}
      </span>
      {isCurrent && (
        <Badge variant="secondary" className="shrink-0">
          Esta ocorrência
        </Badge>
      )}
      {!isCurrent && isPast && (
        <span className="text-xs text-muted-foreground">Passada</span>
      )}
    </Link>
  );
}

export function ActivityDetailContent({ eventId }: ActivityDetailContentProps) {
  const router = useRouter();
  const { permissions } = useAuth();
  const { data: event, isLoading, isError, error } = useChurchEvent(eventId);
  const [editOpen, setEditOpen] = useState(false);

  const canManage = event && permissions ? canManageActivity(permissions, event) : false;
  const canManageRoster =
    event && permissions && event.ministryId
      ? canManageMinistryRoster(permissions, event.ministryId)
      : false;

  const upcomingOccurrences =
    event?.seriesOccurrences.filter(
      (occurrence) => new Date(occurrence.startsAt).getTime() >= Date.now(),
    ) ?? [];

  const isNextInSeries =
    Boolean(event?.recurrence) && upcomingOccurrences[0]?.id === event?.id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <Link
          href={AUTH_ROUTES.activities}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para atividades
        </Link>

        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar a atividade."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={AUTH_ROUTES.activities}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar para atividades
          </Link>

          {canManage && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
          )}
        </div>

        <Card
          className={cn(
            event.isChurchWide && "border-primary/15 bg-gradient-to-br from-card to-muted/30",
          )}
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
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
              {!event.isChurchWide && event.ministryName && event.ministryId && (
                <Link href={ministryDetailPath(event.ministryId)}>
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    {event.ministryName}
                  </Badge>
                </Link>
              )}
            </div>

            <CardTitle className="font-display text-2xl tracking-tight">
              {event.name}
            </CardTitle>

            {event.description && (
              <CardDescription className="text-sm leading-relaxed">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {isNextInSeries ? "Próxima data" : "Data e hora"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatDateTime(event.startsAt)}
                  </p>
                </div>
              </div>

              {event.endsAt && (
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Término
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDateTime(event.endsAt)}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3 sm:col-span-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Local
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {event.recurrence && (
              <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Repetição</p>
                <p className="mt-1">
                  {formatRecurrenceSummary(event.recurrence, event.startsAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {event.usesRoster && (
          <EventRosterSection event={event} canManage={canManageRoster} />
        )}

        {event.recurrence && event.seriesOccurrences.length > 1 && (
          <section className="space-y-3">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                Ocorrências da série
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {upcomingOccurrences.length > 0
                  ? `${upcomingOccurrences.length} próximas datas agendadas.`
                  : "Todas as ocorrências desta série já passaram."}
              </p>
            </div>

            <div className="space-y-2">
              {event.seriesOccurrences.map((occurrence) => (
                <OccurrenceRow
                  key={occurrence.id}
                  occurrence={occurrence}
                  isCurrent={occurrence.id === event.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <EditActivityModal
        event={event}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onDeleted={() => router.push(AUTH_ROUTES.activities)}
      />
    </>
  );
}
