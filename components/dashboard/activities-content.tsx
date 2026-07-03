"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { ActivityEventCard } from "@/components/dashboard/activities/activity-event-card";
import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { EditActivityModal } from "@/components/dashboard/activities/edit-activity-modal";
import { StaggerItem, StaggerList } from "@/components/motion/dashboard-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChurchEvents, useMinistries } from "@/lib/api/queries";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import { canCreateAnyActivity, canManageActivity } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";

type ActivityFilter = "all" | "church" | string;

export function ActivitiesContent() {
  const { permissions } = useAuth();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  const { data: ministries } = useMinistries();
  const activeMinistries = useMemo(
    () => ministries?.filter((ministry) => ministry.isActive) ?? [],
    [ministries],
  );

  const queryParams = useMemo(() => {
    if (filter === "church") {
      return { churchWideOnly: true };
    }

    if (filter !== "all") {
      return { ministryId: filter };
    }

    return {};
  }, [filter]);

  const { data: events, isLoading, isError } = useChurchEvents(queryParams);
  const canCreate = permissions ? canCreateAnyActivity(permissions) : false;

  const sortedEvents = useMemo(
    () => collapseRecurringEventsForList(events ?? []),
    [events],
  );

  const churchWideEvents = sortedEvents.filter((event) => event.isChurchWide);
  const ministryEvents = sortedEvents.filter((event) => !event.isChurchWide);

  const defaultMinistryId =
    filter !== "all" && filter !== "church" ? filter : "";

  function canManageEvent(event: ChurchEvent) {
    return permissions ? canManageActivity(permissions, event) : false;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Todas as atividades agendadas — cultos, ensaios, encontros e eventos da igreja.
          </p>

          {canCreate && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Nova atividade
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtrar por ministério
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Todos
            </FilterPill>
            <FilterPill
              active={filter === "church"}
              onClick={() => setFilter("church")}
            >
              Igreja
            </FilterPill>
            {activeMinistries.map((ministry) => (
              <FilterPill
                key={ministry.id}
                active={filter === ministry.id}
                onClick={() => setFilter(ministry.id)}
              >
                {ministry.name}
              </FilterPill>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Não foi possível carregar as atividades.
          </div>
        )}

        {!isLoading && !isError && sortedEvents.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade agendada com os filtros atuais.
            </p>
            {canCreate && (
              <Button className="mt-4" size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="size-4" />
                Criar atividade
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && sortedEvents.length > 0 && (
          <div className="space-y-8">
            {filter === "all" && churchWideEvents.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-sm font-semibold tracking-tight text-foreground/90">
                  Destaques da igreja
                </h2>
                <StaggerList className="space-y-3">
                  {churchWideEvents.map((event) => (
                    <StaggerItem key={event.recurrenceSeriesId ?? event.id}>
                      <ActivityEventCard
                        event={event}
                        highlighted
                        canManage={canManageEvent(event)}
                        onEdit={setEditingEvent}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </section>
            )}

            {(filter !== "all" || ministryEvents.length > 0) && (
              <section className="space-y-4">
                {filter === "all" && churchWideEvents.length > 0 && (
                  <h2 className="font-display text-sm font-semibold tracking-tight text-foreground/90">
                    Por ministério
                  </h2>
                )}
                <StaggerList className="space-y-3">
                  {(filter === "all" ? ministryEvents : sortedEvents).map((event) => (
                    <StaggerItem key={event.recurrenceSeriesId ?? event.id}>
                      <ActivityEventCard
                        event={event}
                        canManage={canManageEvent(event)}
                        onEdit={setEditingEvent}
                      />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </section>
            )}
          </div>
        )}
      </div>

      <CreateActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultMinistryId={defaultMinistryId}
      />

      <EditActivityModal
        event={editingEvent}
        open={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
      />
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border-primary/20 bg-primary text-primary-foreground shadow-soft"
          : "border-border/80 bg-card text-muted-foreground shadow-soft hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
