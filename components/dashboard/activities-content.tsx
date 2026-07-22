"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, List, Plus } from "lucide-react";

import { ActivityCalendar } from "@/components/dashboard/activities/activity-calendar";
import { ActivityEventCard } from "@/components/dashboard/activities/activity-event-card";
import { ActivityEventModal } from "@/components/dashboard/activities/activity-event-modal";
import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { StaggerItem, StaggerList } from "@/components/motion/dashboard-motion";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  segmentedListClassName,
  segmentedTriggerClassName,
} from "@/components/ui/segmented-control";
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
  const { writesBlocked, subscriptionLocked, blockProps } = useTrialWriteGuard();

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
      <div className="space-y-7">
        <DashboardPageIntro
          eyebrow="Agenda"
          title="Atividades"
          description="Datas da igreja e agenda dos ministérios num só lugar."
          domain="activities"
          action={
            canCreate ? (
              <>
                <Button onClick={() => openCreateModal()} {...blockProps}>
                  <Plus className="size-4" />
                  Novo evento
                </Button>
                {subscriptionLocked ? (
                  <LockedFeatureHint action="criar ou editar eventos" />
                ) : null}
              </>
            ) : undefined
          }
        />

        <div
          role="tablist"
          aria-label="Visualização de eventos"
          className={segmentedListClassName()}
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

        <div className="max-w-sm space-y-1.5">
          <label
            htmlFor="activities-ministry-filter"
            className="text-sm font-medium text-foreground"
          >
            Filtrar por
          </label>
          <SelectField
            id="activities-ministry-filter"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as ActivityFilter)
            }
            aria-label="Filtrar eventos"
          >
            <option value="all">Todos os eventos</option>
            <option value="church">Só da igreja</option>
            {canList
              ? activeMinistries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))
              : null}
          </SelectField>
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
                    Criar evento
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
      className={segmentedTriggerClassName(
        active,
        "min-h-11 gap-2 px-3.5 py-2 text-sm font-medium",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
