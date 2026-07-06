"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Music2, Pencil, Plus, Repeat, UserPlus } from "lucide-react";

import { AddMinistryMemberModal } from "@/components/dashboard/ministries/add-ministry-member-modal";
import { MinistryMembersList } from "@/components/dashboard/ministries/ministry-members-list";
import { CreateMinistryEventModal } from "@/components/dashboard/ministries/create-ministry-event-modal";
import { EditActivityModal } from "@/components/dashboard/activities/edit-activity-modal";
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
import { myScheduleMinistryPath } from "@/constants/routes";
import {
  useMinistryEvents,
  useMinistryMembers,
  useRemoveMemberFromMinistry,
  useUpdateMemberMinistryRole,
} from "@/lib/api/queries";
import { activityDetailPath } from "@/constants/routes";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import {
  canCreateMinistryActivity,
  canManageActivity,
  canManageMembers,
} from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Ministry, MinistryEvent } from "@/types/ministries";

interface MinistryDashboardSectionProps {
  ministry: Ministry;
  onGoToMembers: () => void;
  onGoToAvailability?: () => void;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function MinistryDashboardSection({
  ministry,
  onGoToMembers,
  onGoToAvailability,
}: MinistryDashboardSectionProps) {
  const { permissions } = useAuth();
  const { data: members, isLoading: membersLoading } = useMinistryMembers(ministry.id);
  const { data: events, isLoading: eventsLoading } = useMinistryEvents(ministry.id);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MinistryEvent | null>(null);

  const canAddMembers = permissions ? canManageMembers(permissions) : false;
  const canManageEvents =
    permissions !== null && canCreateMinistryActivity(permissions, ministry.id);

  const upcomingEvents = useMemo(
    () => collapseRecurringEventsForList(events ?? []).slice(0, 5),
    [events],
  );

  const rolesWithEvents = ministry.roles.filter((role) => role.canManageEvents).length;

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Membros"
            value={membersLoading ? "—" : (members?.length ?? 0)}
            hint="Pessoas vinculadas"
          />
          <StatCard
            label="Cargos"
            value={ministry.roles.length}
            hint={`${rolesWithEvents} com permissão de eventos`}
          />
          <StatCard
            label="Próximos eventos"
            value={eventsLoading ? "—" : upcomingEvents.length}
            hint="Agendados a partir de hoje"
          />
          <StatCard
            label="Status"
            value={ministry.isActive ? "Ativo" : "Inativo"}
            hint={ministry.description || "Sem descrição"}
          />
        </div>

        <Link
          href={myScheduleMinistryPath(ministry.id)}
          className="flex w-full items-start gap-4 rounded-2xl border border-foreground/10 bg-gradient-to-br from-muted/50 to-card px-5 py-4 text-left shadow-soft transition-all hover:shadow-elevated"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <Music2 className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-semibold tracking-tight">
              Minhas escalas
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              Veja suas escalas, responda se pode ir e ajude o líder a montar
              a equipe.
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap gap-2">
          {canAddMembers && (
            <Button size="sm" onClick={() => setMemberModalOpen(true)}>
              <UserPlus className="size-4" />
              Adicionar membros
            </Button>
          )}
          {canManageEvents && (
            <Button size="sm" variant="outline" onClick={() => setEventModalOpen(true)}>
              <Calendar className="size-4" />
              Novo evento
            </Button>
          )}
          {onGoToAvailability && (
            <Button size="sm" variant="outline" onClick={onGoToAvailability}>
              <Calendar className="size-4" />
              Escalas
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onGoToMembers}>
            Ver equipe completa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos eventos</CardTitle>
            <CardDescription>
              Cultos, ensaios e outras atividades deste ministério.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsLoading && (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            )}

            {!eventsLoading && upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum evento agendado.
                {canManageEvents && " Crie o primeiro com o botão acima."}
              </p>
            )}

            {!eventsLoading &&
              upcomingEvents.map((event) => {
                const canEdit =
                  permissions !== null && canManageActivity(permissions, event);

                return (
                  <div
                    key={event.recurrenceSeriesId ?? event.id}
                    className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <Link
                      href={activityDetailPath(event.id)}
                      className="min-w-0 flex-1 transition-colors hover:text-foreground"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{event.name}</p>
                        {event.recurrence && (
                          <Badge variant="secondary" className="gap-1">
                            <Repeat className="size-3" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      {event.recurrence && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatRecurrenceSummary(event.recurrence, event.startsAt)}
                        </p>
                      )}
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {event.recurrence && (
                          <span className="font-medium text-foreground">
                            Próxima:
                          </span>
                        )}
                        {formatDateTime(event.startsAt)}
                      </p>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {event.location && (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {event.location}
                        </p>
                      )}
                      {canEdit && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Pencil className="size-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <AddMinistryMemberModal
        ministry={ministry}
        currentMembers={members ?? []}
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
      />

      <CreateMinistryEventModal
        ministryId={ministry.id}
        ministryName={ministry.name}
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
      />

      <EditActivityModal
        event={editingEvent}
        open={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
      />
    </>
  );
}

interface MinistryMembersSectionProps {
  ministry: Ministry;
  canManage: boolean;
}

export function MinistryMembersSection({
  ministry,
  canManage,
}: MinistryMembersSectionProps) {
  const { data: members, isLoading, isError } = useMinistryMembers(ministry.id);
  const [modalOpen, setModalOpen] = useState(false);
  const removeMember = useRemoveMemberFromMinistry(ministry.id);
  const updateRole = useUpdateMemberMinistryRole(ministry.id);

  const roles = [...ministry.roles].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Equipe do ministério</CardTitle>
            <CardDescription>
              Membros vinculados e seus cargos nesta área de serviço.
            </CardDescription>
          </div>
          {canManage && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Adicionar membros
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os membros do ministério.
            </p>
          )}

          {!isLoading && !isError && (members?.length ?? 0) === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum membro vinculado ainda.
              </p>
              {canManage && (
                <Button className="mt-3" size="sm" onClick={() => setModalOpen(true)}>
                  <UserPlus className="size-4" />
                  Adicionar primeiro membro
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && (members?.length ?? 0) > 0 && (
            <MinistryMembersList
              members={members ?? []}
              roles={roles}
              canManage={canManage}
              isRemoving={removeMember.isPending}
              isUpdatingRoles={updateRole.isPending}
              onRemove={(memberId) => removeMember.mutate(memberId)}
              onToggleRoles={(memberId, ministryRoleIds) =>
                updateRole.mutate({ memberId, ministryRoleIds })
              }
            />
          )}
        </CardContent>
      </Card>

      <AddMinistryMemberModal
        ministry={ministry}
        currentMembers={members ?? []}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
