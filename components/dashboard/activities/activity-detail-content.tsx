"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  MapPin,
  Pencil,
  Repeat,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import { ActivityAvailabilitySection } from "@/components/dashboard/activities/activity-availability-section";
import { ActivityEventModal } from "@/components/dashboard/activities/activity-event-modal";
import { ActivityOccurrenceNav } from "@/components/dashboard/activities/activity-occurrence-nav";
import { ActivityRosterSection } from "@/components/dashboard/activities/activity-roster-section";
import { EventRegistrationOpenBadge } from "@/components/dashboard/activities/event-registration-open-badge";
import { EventRosterPublicCard } from "@/components/dashboard/activities/event-roster-assignments";
import { EventTicketCheckout } from "@/components/dashboard/activities/event-ticket-checkout";
import { EventTicketRegistrationsPanel } from "@/components/dashboard/activities/event-ticket-registrations-panel";
import { LargeModalShell } from "@/components/dashboard/activities/large-modal-shell";
import { InactiveMinistryBanner } from "@/components/dashboard/ministries/inactive-ministry-banner";
import { TrialExpiredWriteModal } from "@/components/dashboard/trial-expired-write-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activitiesCalendarPath,
  AUTH_ROUTES,
  ministryDetailPath,
} from "@/constants/routes";
import {
  useChurchEvent,
  useEventTicketRegistrations,
  useUpdateChurchEvent,
} from "@/lib/api/queries";
import { dateKeyFromIso } from "@/lib/events/calendar";
import {
  formatEventDateChip,
  formatEventTime,
  formatLongDate,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import {
  isEventRegistrationOpen,
  isEventRegistrationPaid,
} from "@/lib/events/registration";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import {
  canManageActivity,
  canManageEventRoster,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityDetailContentProps {
  eventId: string;
}

function SecondaryMeta({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function ScopeActionCard({
  icon: Icon,
  title,
  description,
  meta,
  actionLabel,
  onAction,
  tone = "default",
  bare = false,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  meta?: string;
  actionLabel: string;
  onAction: () => void;
  tone?: "default" | "open" | "attention";
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-3 p-4",
        !bare && "rounded-2xl border shadow-xs",
        !bare && tone === "open" && "border-success/35 bg-success-subtle/40",
        !bare && tone === "attention" && "border-attention-border bg-attention-subtle",
        !bare && tone === "default" && "border-border bg-card",
        bare && tone === "open" && "bg-success-subtle/35",
        bare && tone === "attention" && "bg-attention-subtle",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
          {meta ? (
            <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={tone === "default" ? "outline" : "default"}
        className="w-full justify-between gap-2 sm:w-auto sm:self-start"
        onClick={onAction}
      >
        {actionLabel}
        <ArrowRight className="size-3.5 opacity-70" aria-hidden />
      </Button>
    </div>
  );
}

function RegistrationManagerCard({
  event,
  onViewList,
  onToggle,
  isToggling,
  bare = false,
}: {
  event: ChurchEventDetail;
  onViewList: () => void;
  onToggle: () => void;
  isToggling: boolean;
  bare?: boolean;
}) {
  const open = isEventRegistrationOpen(event);
  const paid = isEventRegistrationPaid(event);
  const { data, isPending } = useEventTicketRegistrations(event.id, {
    enabled: open,
  });

  const meta = !open
    ? "Enquanto fechada, membros não conseguem confirmar presença."
    : isPending
      ? "Carregando…"
      : `${data?.confirmedCount ?? 0} confirmada${(data?.confirmedCount ?? 0) === 1 ? "" : "s"}${(data?.pendingCount ?? 0) > 0 ? ` · ${data?.pendingCount} aguardando` : ""}${paid && (data?.confirmedAmountCents ?? 0) > 0 ? ` · ${formatCurrency((data?.confirmedAmountCents ?? 0) / 100)}` : ""}`;

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-3 p-4",
        !bare && "rounded-2xl border shadow-xs",
        !bare && open && "border-success/35 bg-success-subtle/40",
        !bare && !open && "border-border bg-card",
        bare && open && "bg-success-subtle/35",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-foreground">
          <Ticket className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {open ? "Inscrições abertas" : "Inscrições fechadas"}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {open
              ? paid && event.priceCents != null
                ? `Taxa de ${formatCurrency(event.priceCents / 100)}. Feche quando quiser encerrar novas entradas.`
                : "Inscrição gratuita. Feche quando quiser encerrar novas entradas."
              : "Se este evento exige inscrição para que membros possam participar, abra as inscrições. É gratuita por padrão; para cobrar, edite o preço."}
          </p>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
            {meta}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={open ? "outline" : "default"}
          className="w-full justify-between gap-2 sm:w-auto"
          disabled={isToggling}
          onClick={onToggle}
        >
          {isToggling ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : null}
          {open ? "Fechar inscrição" : "Abrir inscrição"}
          {!isToggling ? (
            <ArrowRight className="size-3.5 opacity-70" aria-hidden />
          ) : null}
        </Button>
        {open ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full justify-between gap-2 sm:w-auto"
            onClick={onViewList}
          >
            Ver inscritos
            <ArrowRight className="size-3.5 opacity-70" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function EventHero({
  event,
  timeLabel,
  canManage,
  writesBlocked,
}: {
  event: ChurchEventDetail;
  timeLabel: string;
  canManage: boolean;
  writesBlocked: boolean;
}) {
  const [descExpanded, setDescExpanded] = useState(false);
  const chip = formatEventDateChip(event.startsAt);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(
    new Date(event.startsAt),
  );
  const dayMonth = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(event.startsAt));
  const relativeEventDay = formatRelativeEventDay(event.startsAt);
  const description = event.description?.trim() ?? "";
  const descriptionLong = description.length > 140;
  const highlight = event.highlightNote?.trim() ?? "";

  return (
    <header className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          {!event.isChurchWide && event.ministryName && event.ministryId ? (
            writesBlocked ? (
              <Badge variant="secondary" className="gap-1.5 font-medium">
                <Layers className="size-3.5" aria-hidden />
                {event.ministryName}
              </Badge>
            ) : (
              <Link href={ministryDetailPath(event.ministryId)}>
                <Badge
                  variant="secondary"
                  className="gap-1.5 font-medium hover:bg-muted"
                >
                  <Layers className="size-3.5" aria-hidden />
                  {event.ministryName}
                </Badge>
              </Link>
            )
          ) : null}

          {event.isChurchWide ? (
            <Badge variant="secondary" className="gap-1.5 font-medium">
              <Sparkles className="size-3" aria-hidden />
              Igreja
            </Badge>
          ) : null}

          {relativeEventDay ? (
            <Badge className="font-medium">{relativeEventDay}</Badge>
          ) : null}

          {event.recurrence ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground"
              title={formatRecurrenceSummary(event.recurrence, event.startsAt)}
            >
              <Repeat className="size-3" aria-hidden />
              Recorrente
            </span>
          ) : null}

          <EventRegistrationOpenBadge event={event} showPrice />
        </div>

        <div className="flex items-start gap-4">
          <time
            dateTime={event.startsAt}
            className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 py-2 text-center shadow-xs"
            aria-label={formatLongDate(new Date(event.startsAt))}
          >
            <span className="text-[1.55rem] font-semibold leading-none tracking-tight text-foreground">
              {chip.day}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {chip.month}
            </span>
          </time>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="page-title text-balance text-[1.35rem] leading-tight sm:text-[1.6rem]">
              {event.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="capitalize">{weekday}</span>
              <span className="mx-1.5 text-border">·</span>
              <span>{dayMonth}</span>
              <span className="mx-1.5 text-border">·</span>
              <span className="font-medium tabular-nums text-foreground">
                {timeLabel}
              </span>
            </p>
            {description ? (
              <div className="pt-0.5">
                <p
                  className={cn(
                    "max-w-2xl text-sm leading-relaxed text-muted-foreground",
                    !descExpanded && descriptionLong && "line-clamp-2",
                  )}
                >
                  {description}
                </p>
                {descriptionLong ? (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                    onClick={() => setDescExpanded((value) => !value)}
                  >
                    {descExpanded ? "Mostrar menos" : "Ler mais"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {(event.location ||
        (canManage && !event.isChurchWide) ||
        event.recurrence ||
        highlight) && (
        <div className="space-y-2.5 border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {event.location ? (
              <SecondaryMeta icon={MapPin}>{event.location}</SecondaryMeta>
            ) : null}
            {canManage && !event.isChurchWide ? (
              <SecondaryMeta icon={event.visibleToChurch ? Eye : EyeOff}>
                {event.visibleToChurch
                  ? "Visível na agenda da igreja"
                  : "Somente no ministério"}
              </SecondaryMeta>
            ) : null}
            {event.recurrence ? (
              <SecondaryMeta icon={Repeat}>
                {formatRecurrenceSummary(event.recurrence, event.startsAt)}
              </SecondaryMeta>
            ) : null}
          </div>
          {highlight ? (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm leading-snug text-foreground">
              <span className="mr-1.5 text-[10px] font-semibold tracking-[0.12em] text-amber-800/80 uppercase">
                Destaque
              </span>
              {highlight}
            </p>
          ) : null}
        </div>
      )}
    </header>
  );
}

export function ActivityDetailContent({ eventId }: ActivityDetailContentProps) {
  const router = useRouter();
  const { user, permissions } = useAuth();
  const { data: event, isLoading, isError, error } = useChurchEvent(eventId);
  const [editOpen, setEditOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [registrationToggleError, setRegistrationToggleError] = useState<
    string | null
  >(null);
  const { writesBlocked, guardWrite, paywallAction, closePaywall } =
    useTrialWriteGuard();
  const updateEvent = useUpdateChurchEvent(eventId);

  const canManage =
    event && permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  const canManageRoster =
    event && permissions
      ? canManageEventRoster(permissions, event, user?.id ?? null)
      : false;
  const showAvailabilityPanel = Boolean(
    event?.usesRoster &&
      event.rosterOpen &&
      event.canRespondToAvailability,
  );
  const hasRegistration = event ? isEventRegistrationOpen(event) : false;
  const hasPaidTicket = event ? isEventRegistrationPaid(event) : false;
  const ministryInactive = Boolean(
    event?.ministryId && !event.ministryIsActive,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
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

        <div className="rounded-2xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar a atividade."}
        </div>
      </div>
    );
  }

  const timeLabel = event.endsAt
    ? `${formatEventTime(event.startsAt)} – ${formatEventTime(event.endsAt)}`
    : formatEventTime(event.startsAt);

  const availableCount = event.rosterCandidates.filter(
    (candidate) => candidate.availabilityStatus === "available",
  ).length;
  const assignedCount = event.roster.length;
  const showPublicRoster =
    !canManageRoster && event.usesRoster && event.roster.length > 0;
  const showManagerActions = canManageRoster || canManage;
  const showActionRail =
    hasRegistration || showAvailabilityPanel || showManagerActions;

  async function toggleRegistration() {
    setRegistrationToggleError(null);
    try {
      await updateEvent.mutateAsync({
        registrationOpen: !hasRegistration,
        // Fechar limpa preço no backend; abrir sem preço = gratuita.
        ...(hasRegistration ? { priceCents: null } : {}),
      });
    } catch (toggleError) {
      setRegistrationToggleError(
        toggleError instanceof Error
          ? toggleError.message
          : "Não foi possível atualizar a inscrição.",
      );
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={AUTH_ROUTES.activities}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Atividades
          </Link>

          {!ministryInactive ? (
            <div className="flex flex-wrap items-center gap-2">
              <ActivityOccurrenceNav event={event} />
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={activitiesCalendarPath(dateKeyFromIso(event.startsAt))}
                >
                  <CalendarDays className="size-4" />
                  Calendário
                </Link>
              </Button>
              {canManage ? (
                <Button
                  size="sm"
                  onClick={() =>
                    guardWrite("editar atividades", () => setEditOpen(true))
                  }
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {ministryInactive ? (
          <InactiveMinistryBanner
            ministryName={event.ministryName}
            ministryHref={
              event.ministryId
                ? ministryDetailPath(event.ministryId)
                : undefined
            }
          />
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-4",
            ministryInactive && "pointer-events-none select-none opacity-60",
          )}
          aria-hidden={ministryInactive || undefined}
        >
          <EventHero
            event={event}
            timeLabel={timeLabel}
            canManage={canManage}
            writesBlocked={writesBlocked}
          />

          {showActionRail ? (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-border/70 shadow-xs">
              <div className="grid gap-px sm:grid-cols-2">
                {hasRegistration ? (
                  <div
                    className={cn(
                      "bg-card",
                      !showAvailabilityPanel &&
                        !showManagerActions &&
                        "sm:col-span-2",
                    )}
                  >
                    <Suspense
                      fallback={<Skeleton className="h-24 w-full rounded-none" />}
                    >
                      <EventTicketCheckout
                        eventId={event.id}
                        priceCents={
                          hasPaidTicket ? event.priceCents! : null
                        }
                        eventName={event.name}
                        myTicketStatus={event.myTicketStatus ?? null}
                        dense
                        flush
                      />
                    </Suspense>
                  </div>
                ) : null}

                {showAvailabilityPanel ? (
                  <div
                    className={cn(
                      "bg-card",
                      !hasRegistration &&
                        !showManagerActions &&
                        "sm:col-span-2",
                    )}
                  >
                    <ActivityAvailabilitySection
                      event={event}
                      interactionsDisabled={writesBlocked}
                      registrationAlsoOpen={hasRegistration}
                      dense
                      flush
                    />
                  </div>
                ) : null}

                {canManageRoster ? (
                  <div
                    className={cn(
                      "bg-card",
                      canManage && !showAvailabilityPanel && "sm:row-span-2",
                    )}
                  >
                    <ScopeActionCard
                      icon={ClipboardList}
                      title="Escala"
                      description={
                        event.rosterOpen
                          ? "Coleta aberta — monte a equipe e acompanhe respostas."
                          : "Monte a equipe e abra a coleta quando quiser."
                      }
                      meta={`${assignedCount} na escala · ${availableCount} disponível${availableCount === 1 ? "" : "eis"}`}
                      actionLabel="Gerenciar escala"
                      onAction={() =>
                        guardWrite("gerenciar escalas", () => setRosterOpen(true))
                      }
                      tone={event.rosterOpen ? "open" : "default"}
                      bare
                    />
                  </div>
                ) : null}

                {canManage ? (
                  <div className="bg-card">
                    <RegistrationManagerCard
                      event={event}
                      bare
                      isToggling={updateEvent.isPending}
                      onViewList={() => setRegistrationsOpen(true)}
                      onToggle={() =>
                        guardWrite("gerenciar inscrições", () => {
                          void toggleRegistration();
                        })
                      }
                    />
                    {registrationToggleError ? (
                      <p className="border-t border-border/60 px-4 py-2 text-xs text-destructive">
                        {registrationToggleError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {showPublicRoster ? (
            <EventRosterPublicCard event={event} dense />
          ) : null}
        </div>
      </div>

      <LargeModalShell
        open={rosterOpen}
        onClose={() => setRosterOpen(false)}
        title="Gerenciar escala"
        subtitle={event.name}
        icon={ClipboardList}
        titleId="event-roster-modal-title"
        size="workspace"
      >
        <ActivityRosterSection event={event} readOnly={writesBlocked} />
      </LargeModalShell>

      <LargeModalShell
        open={registrationsOpen}
        onClose={() => setRegistrationsOpen(false)}
        title="Inscritos"
        subtitle={
          hasPaidTicket
            ? `Pagamentos da taxa · ${event.name}`
            : `Inscrições · ${event.name}`
        }
        icon={Users}
        titleId="event-registrations-modal-title"
      >
        <EventTicketRegistrationsPanel
          eventId={event.id}
          eventName={event.name}
          startsAt={event.startsAt}
          location={event.location}
          isPaid={hasPaidTicket}
          embedded
        />
      </LargeModalShell>

      <ActivityEventModal
        eventId={event.id}
        open={editOpen}
        initialMode="edit"
        onClose={() => setEditOpen(false)}
        onDeleted={() => router.push(AUTH_ROUTES.activities)}
      />

      <TrialExpiredWriteModal
        open={paywallAction !== null}
        onClose={closePaywall}
        action={paywallAction ?? undefined}
      />
    </>
  );
}
