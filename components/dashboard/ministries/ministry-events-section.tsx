"use client";

import { useMemo, useState } from "react";
import { Calendar, Plus } from "lucide-react";

import { ActivityEventCard } from "@/components/dashboard/activities/activity-event-card";
import { ActivityEventModal } from "@/components/dashboard/activities/activity-event-modal";
import { CreateMinistryEventModal } from "@/components/dashboard/ministries/create-ministry-event-modal";
import { StaggerItem, StaggerList } from "@/components/motion/dashboard-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMinistryEvents } from "@/lib/api/queries";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import {
  canCreateMinistryActivity,
  canManageActivity,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";
import type { Ministry, MinistryEvent } from "@/types/ministries";

interface MinistryEventsSectionProps {
  ministry: Ministry;
}

function toChurchEvent(event: MinistryEvent, ministryIsActive: boolean): ChurchEvent {
  return { ...event, ministryIsActive };
}

export function MinistryEventsSection({ ministry }: MinistryEventsSectionProps) {
  const { permissions, user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const canManageEvents =
    permissions !== null && canCreateMinistryActivity(permissions, ministry.id);

  const { data: listEvents, isLoading, isError } = useMinistryEvents(ministry.id);

  const sortedEvents = useMemo(
    () =>
      collapseRecurringEventsForList(listEvents ?? []).map((event) =>
        toChurchEvent(event, ministry.isActive),
      ),
    [listEvents, ministry.isActive],
  );

  function canManageEvent(event: ChurchEvent) {
    return permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Eventos e atividades</CardTitle>
            <CardDescription>
              Cultos, ensaios e outras atividades agendadas para este ministério.
            </CardDescription>
          </div>
          {canManageEvents && (
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="size-4" />
              Novo evento
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os eventos deste ministério.
            </p>
          )}

          {!isLoading && !isError && sortedEvents.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <Calendar className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum evento agendado para este ministério.
              </p>
              {canManageEvents && (
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="size-4" />
                  Criar primeiro evento
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && sortedEvents.length > 0 && (
            <StaggerList className="space-y-3">
              {sortedEvents.map((event) => (
                <StaggerItem key={event.recurrenceSeriesId ?? event.id}>
                  <ActivityEventCard
                    event={event}
                    canManage={canManageEvent(event)}
                    onEdit={(item) => setEditingEventId(item.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </CardContent>
      </Card>

      <CreateMinistryEventModal
        ministryId={ministry.id}
        ministryName={ministry.name}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <ActivityEventModal
        eventId={editingEventId}
        open={editingEventId !== null}
        initialMode="edit"
        onClose={() => setEditingEventId(null)}
      />
    </>
  );
}
