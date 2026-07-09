"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, List, Plus } from "lucide-react";

import { ActivityCalendar } from "@/components/dashboard/activities/activity-calendar";
import { ActivityEventCard } from "@/components/dashboard/activities/activity-event-card";
import { ActivityEventModal } from "@/components/dashboard/activities/activity-event-modal";
import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { StaggerItem, StaggerList } from "@/components/motion/dashboard-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChurchEvents, useMinistries } from "@/lib/api/queries";
import { getMonthQueryRange, startsAtForDateKey } from "@/lib/events/calendar";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import {
  canCreateAnyActivity,
  canListMinistries,
  canManageActivity,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";

type ActivityFilter = "all" | "church" | string;
type ActivityView = "calendar" | "list";

export function ActivitiesContent() {
  const { permissions, user } = useAuth();
  const searchParams = useSearchParams();
  const now = new Date();

  const initialFocus = useMemo(() => {
    const raw = searchParams.get("date");
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [year, month] = raw.split("-").map(Number);
      return { dateKey: raw, year, monthIndex: month - 1 };
    }
    return null;
    // Lido apenas na montagem para posicionar o mês inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [view, setView] = useState<ActivityView>(
    searchParams.get("view") === "list" ? "list" : "calendar",
  );
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [monthYear, setMonthYear] = useState(
    initialFocus?.year ?? now.getFullYear(),
  );
  const [monthIndex, setMonthIndex] = useState(
    initialFocus?.monthIndex ?? now.getMonth(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [createStartsAt, setCreateStartsAt] = useState<string | undefined>();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const canList = canListMinistries(permissions);
  const { data: ministries } = useMinistries({ enabled: canList });
  const activeMinistries = useMemo(
    () => ministries?.filter((ministry) => ministry.isActive) ?? [],
    [ministries],
  );

  const filterParams = useMemo(() => {
    if (filter === "church") {
      return { churchWideOnly: true as const };
    }

    if (filter !== "all") {
      return { ministryId: filter };
    }

    return {};
  }, [filter]);

  const calendarRange = useMemo(
    () => getMonthQueryRange(monthYear, monthIndex),
    [monthYear, monthIndex],
  );

  const listQuery = useChurchEvents(filterParams, {
    enabled: view === "list",
  });
  const calendarQuery = useChurchEvents(
    {
      ...filterParams,
      from: calendarRange.from,
      to: calendarRange.to,
    },
    { enabled: view === "calendar" },
  );

  const listEvents = listQuery.data;
  const calendarEvents = calendarQuery.data;
  const isLoading = view === "list" ? listQuery.isLoading : calendarQuery.isLoading;
  const isError = view === "list" ? listQuery.isError : calendarQuery.isError;

  const knownMinistryNames = useMemo(() => {
    const names: Record<string, string> = {};

    for (const event of [...(calendarEvents ?? []), ...(listEvents ?? [])]) {
      if (event.ministryId && event.ministryName) {
        names[event.ministryId] = event.ministryName;
      }
    }

    return names;
  }, [calendarEvents, listEvents]);

  const canCreate = permissions ? canCreateAnyActivity(permissions) : false;
  const { writesBlocked, blockProps } = useTrialWriteGuard();

  const sortedEvents = useMemo(
    () => collapseRecurringEventsForList(listEvents ?? []),
    [listEvents],
  );

  const churchWideEvents = sortedEvents.filter((event) => event.isChurchWide);
  const ministryEvents = sortedEvents.filter((event) => !event.isChurchWide);

  const defaultMinistryId =
    filter !== "all" && filter !== "church" ? filter : "";

  function canManageEvent(event: ChurchEvent) {
    return permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  }

  function openCreateModal(startsAtValue?: string) {
    setCreateStartsAt(startsAtValue);
    setModalOpen(true);
  }

  function closeCreateModal() {
    setModalOpen(false);
    setCreateStartsAt(undefined);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Planeje datas importantes da igreja e veja a agenda dos ministérios.
          </p>

          {canCreate && (
            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <Button
                size="sm"
                onClick={() => openCreateModal()}
                {...blockProps}
              >
                <Plus className="size-4" />
                Nova atividade
              </Button>
              {writesBlocked && (
                <LockedFeatureHint action="criar ou editar atividades" />
              )}
            </div>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Visualização de atividades"
          className="inline-flex rounded-xl border border-border/80 bg-muted/30 p-1"
        >
          <ViewTab
            active={view === "calendar"}
            onClick={() => setView("calendar")}
            icon={<CalendarDays className="size-4" />}
          >
            Calendário
          </ViewTab>
          <ViewTab
            active={view === "list"}
            onClick={() => setView("list")}
            icon={<List className="size-4" />}
          >
            Lista
          </ViewTab>
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
            {canList &&
              activeMinistries.map((ministry) => (
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

        {view === "calendar" && (
          <ActivityCalendar
            year={monthYear}
            monthIndex={monthIndex}
            events={calendarEvents ?? []}
            focusDateKey={initialFocus?.dateKey}
            isLoading={isLoading}
            isError={isError}
            canCreate={canCreate}
            createBlockProps={blockProps}
            onMonthChange={(nextYear, nextMonthIndex) => {
              setMonthYear(nextYear);
              setMonthIndex(nextMonthIndex);
            }}
            onCreateOnDay={(dateKey) =>
              openCreateModal(startsAtForDateKey(dateKey))
            }
          />
        )}

        {view === "list" && (
          <>
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
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => openCreateModal()}
                    {...blockProps}
                  >
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
                            manageActionsBlocked={writesBlocked}
                            manageBlockTitle={blockProps.title}
                            onEdit={(event) => setEditingEventId(event.id)}
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
                      {(filter === "all" ? ministryEvents : sortedEvents).map(
                        (event) => (
                          <StaggerItem
                            key={event.recurrenceSeriesId ?? event.id}
                          >
                            <ActivityEventCard
                              event={event}
                              canManage={canManageEvent(event)}
                              manageActionsBlocked={writesBlocked}
                              manageBlockTitle={blockProps.title}
                              onEdit={(event) => setEditingEventId(event.id)}
                            />
                          </StaggerItem>
                        ),
                      )}
                    </StaggerList>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <CreateActivityModal
        open={modalOpen}
        onClose={closeCreateModal}
        defaultMinistryId={defaultMinistryId}
        defaultStartsAtValue={createStartsAt}
        knownMinistryNames={knownMinistryNames}
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

function ViewTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
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
