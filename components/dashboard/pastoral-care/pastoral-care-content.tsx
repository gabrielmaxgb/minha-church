"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  HeartPulse,
  Inbox,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  segmentedListClassName,
  segmentedTriggerClassName,
} from "@/components/ui/segmented-control";
import { memberDetailPath } from "@/constants/routes";
import {
  resolvePastoralNotesError,
  usePastoralCareSummary,
} from "@/lib/api/queries";
import { canAccessMembers } from "@/lib/permissions";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { MEMBER_STATUS_LABELS, type MemberStatus } from "@/types/members";
import {
  PASTORAL_NOTE_TYPE_LABELS,
  type PastoralCareSummaryMember,
  type PastoralNote,
} from "@/types/pastoral-notes";

type CareListTab = "followUps" | "withoutContact" | "recent";

function todayIsoDateLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function partitionFollowUps(members: PastoralCareSummaryMember[]) {
  const today = todayIsoDateLocal();
  const overdue: PastoralCareSummaryMember[] = [];
  const dueToday: PastoralCareSummaryMember[] = [];
  const upcoming: PastoralCareSummaryMember[] = [];

  for (const member of members) {
    const date = member.openFollowUpOn;
    if (!date || date < today) {
      overdue.push(member);
    } else if (date === today) {
      dueToday.push(member);
    } else {
      upcoming.push(member);
    }
  }

  return { overdue, dueToday, upcoming };
}

function followUpDetail(
  openFollowUpOn: string | null,
  bucket: "overdue" | "today" | "upcoming",
): string {
  if (!openFollowUpOn) return "Retorno agendado";
  const label = formatDate(openFollowUpOn);

  if (bucket === "overdue") return `Desde ${label}`;
  if (bucket === "today") return "Combinado para hoje";
  return label;
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-domain-members-subtle text-domain-members-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PanelIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-2.5 h-px w-8 bg-domain-members" />
      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function MemberStatusChip({ status }: { status: string }) {
  const label =
    status in MEMBER_STATUS_LABELS
      ? MEMBER_STATUS_LABELS[status as MemberStatus]
      : status;

  return <span className="text-xs text-muted-foreground">{label}</span>;
}

function SummaryMemberRow({
  member,
  detail,
  framed = false,
}: {
  member: PastoralCareSummaryMember;
  detail: string;
  framed?: boolean;
}) {
  const { permissions } = useAuth();
  const canOpen = canAccessMembers(permissions);
  const nameNode = canOpen ? (
    <Link
      href={memberDetailPath(member.memberId, {
        tab: "acompanhamento",
        from: "acompanhamento",
      })}
      className="font-medium text-foreground underline-offset-2 hover:underline"
    >
      {member.memberName}
    </Link>
  ) : (
    <span className="font-medium text-foreground">{member.memberName}</span>
  );

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-3.5 py-3",
        framed && "rounded-xl border border-border/70 bg-background",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {nameNode}
          <MemberStatusChip status={member.memberStatus} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <MemberDetailButton
        memberId={member.memberId}
        memberName={member.memberName}
        tab="acompanhamento"
        from="acompanhamento"
      />
    </li>
  );
}

function FollowUpGroup({
  title,
  hint,
  count,
  emptyLabel,
  members,
  bucket,
}: {
  title: string;
  hint?: string;
  count: number;
  emptyLabel: string;
  members: PastoralCareSummaryMember[];
  bucket: "overdue" | "today" | "upcoming";
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-3.5 py-5 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-card">
          {members.map((member) => (
            <SummaryMemberRow
              key={member.memberId}
              member={member}
              detail={followUpDetail(member.openFollowUpOn, bucket)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FollowUpsBoard({
  members,
  horizonDays,
}: {
  members: PastoralCareSummaryMember[];
  horizonDays: number;
}) {
  const { overdue, dueToday, upcoming } = useMemo(
    () => partitionFollowUps(members),
    [members],
  );

  if (members.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nenhum retorno nesta janela"
        description={`Não há retorno vencido, de hoje ou nos próximos ${horizonDays} dias.`}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6 lg:items-start">
      {/* Esquerda: hoje + próximos */}
      <div className="order-2 min-w-0 lg:order-1">
        <div className="relative overflow-hidden rounded-2xl border border-domain-members/25 bg-card shadow-xs">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-domain-members-subtle/80 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 space-y-5 p-4 sm:p-5">
            <header className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-domain-members-subtle text-domain-members-foreground">
                <CalendarDays className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                  Agenda
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Hoje em cima. Embaixo, o que vem nos próximos {horizonDays}{" "}
                  dias.
                </p>
              </div>
            </header>

            <FollowUpGroup
              title="Hoje"
              hint="Quem precisa de um toque ainda hoje."
              count={dueToday.length}
              emptyLabel="Ninguém marcado para hoje."
              members={dueToday}
              bucket="today"
            />

            <div className="h-px bg-border/80" aria-hidden />

            <FollowUpGroup
              title="Próximos dias"
              hint={`Até ${horizonDays} dias à frente.`}
              count={upcoming.length}
              emptyLabel="Nenhum retorno nos próximos dias."
              members={upcoming}
              bucket="upcoming"
            />
          </div>
        </div>
      </div>

      {/* Direita: vencidos */}
      <div className="order-1 min-w-0 lg:order-2">
        <div className="relative overflow-hidden rounded-2xl border border-attention/30 bg-card shadow-xs">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-attention-subtle to-transparent"
            aria-hidden
          />
          <div className="relative z-10 space-y-5 p-4 sm:p-5">
            <header className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-attention-subtle text-attention-foreground">
                <CalendarClock className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                  Vencidos
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  A data passou — prioridade para retomar o contato.
                </p>
              </div>
              <span className="ml-auto shrink-0 rounded-md border border-attention/25 bg-attention-subtle px-2 py-0.5 text-xs font-medium tabular-nums text-attention-foreground">
                {overdue.length}
              </span>
            </header>

            {overdue.length === 0 ? (
              <p className="rounded-xl border border-dashed border-attention/25 bg-attention-subtle/40 px-3.5 py-8 text-center text-xs text-muted-foreground">
                Nada atrasado. Bom sinal.
              </p>
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-attention/20 bg-card">
                {overdue.map((member) => (
                  <SummaryMemberRow
                    key={member.memberId}
                    member={member}
                    detail={followUpDetail(member.openFollowUpOn, "overdue")}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function groupRecentNotesByMember(notes: PastoralNote[]) {
  const groups: Array<{
    memberId: string;
    memberName: string;
    notes: PastoralNote[];
  }> = [];
  const indexByMember = new Map<string, number>();

  for (const note of notes) {
    const existing = indexByMember.get(note.memberId);
    if (existing === undefined) {
      indexByMember.set(note.memberId, groups.length);
      groups.push({
        memberId: note.memberId,
        memberName: note.memberName,
        notes: [note],
      });
      continue;
    }
    groups[existing].notes.push(note);
  }

  return groups;
}

function MemberRecentNotesCard({
  memberId,
  memberName,
  notes,
}: {
  memberId: string;
  memberName: string;
  notes: PastoralNote[];
}) {
  const { permissions } = useAuth();
  const canOpen = canAccessMembers(permissions);
  const [latest, ...older] = notes;
  const extraVisible = older.slice(0, 2);
  const hiddenCount = Math.max(0, older.length - extraVisible.length);

  return (
    <li className="rounded-2xl border border-border/80 bg-background px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {canOpen ? (
              <Link
                href={memberDetailPath(memberId, {
                  tab: "acompanhamento",
                  from: "acompanhamento",
                })}
                className="underline-offset-2 hover:underline"
              >
                {memberName}
              </Link>
            ) : (
              memberName
            )}
          </p>
          {notes.length > 1 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {notes.length} registros recentes
            </p>
          ) : null}
        </div>
        <MemberDetailButton
          memberId={memberId}
          memberName={memberName}
          tab="acompanhamento"
          from="acompanhamento"
        />
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-md border border-domain-members/25 bg-domain-members-subtle px-2 py-0.5 text-[11px] font-medium text-domain-members-foreground">
              {PASTORAL_NOTE_TYPE_LABELS[latest.type]}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(latest.occurredOn)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {latest.body}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Por {latest.authorName}
            {latest.followUpOn
              ? ` · Retorno ${formatDate(latest.followUpOn)}`
              : null}
          </p>
        </div>

        {extraVisible.length > 0 ? (
          <ul className="space-y-2 border-t border-border/70 pt-3">
            {extraVisible.map((note) => (
              <li key={note.id} className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {PASTORAL_NOTE_TYPE_LABELS[note.type]}
                  </span>
                  <span>· {formatDate(note.occurredOn)}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                  {note.body}
                </p>
              </li>
            ))}
            {hiddenCount > 0 ? (
              <li className="text-xs text-muted-foreground">
                +{hiddenCount}{" "}
                {hiddenCount === 1 ? "registro" : "registros"} na ficha
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export function PastoralCareContent() {
  const summaryQuery = usePastoralCareSummary();
  const data = summaryQuery.data;
  const [tab, setTab] = useState<CareListTab | null>(null);

  const resolvedTab = useMemo((): CareListTab => {
    if (tab) return tab;
    if (!data) return "followUps";
    if (data.followUpsDue.length > 0) return "followUps";
    if (data.withoutRecentContact.length > 0) return "withoutContact";
    return "recent";
  }, [tab, data]);

  const recentByMember = useMemo(
    () => groupRecentNotesByMember(data?.recentNotes ?? []),
    [data?.recentNotes],
  );

  if (summaryQuery.isLoading) {
    return <SummarySkeleton />;
  }

  if (summaryQuery.isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        {resolvePastoralNotesError(
          summaryQuery.error,
          "Não foi possível carregar o acompanhamento.",
        )}
      </div>
    );
  }

  const days = data.thresholds.withoutContactDays;
  const followUpHorizonDays = data.thresholds.followUpHorizonDays ?? 7;

  const tabs: Array<{
    id: CareListTab;
    label: string;
    count: number;
    icon: LucideIcon;
  }> = [
    {
      id: "followUps",
      label: "Retornos",
      count: data.followUpsDue.length,
      icon: CalendarClock,
    },
    {
      id: "withoutContact",
      label: "Sem contato",
      count: data.withoutRecentContact.length,
      icon: HeartPulse,
    },
    {
      id: "recent",
      label: "Registros",
      count: recentByMember.length,
      icon: NotebookPen,
    },
  ];

  const activeMeta = tabs.find((item) => item.id === resolvedTab) ?? tabs[0];

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Cuidado pastoral"
        title="Acompanhamento"
        description="Retornos da semana, quem sumiu do radar e o que a equipe registrou por último."
        domain="members"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-muted/10 px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Retornos
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            {data.followUpsDue.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-muted/10 px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sem contato ({days}d)
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            {data.withoutRecentContact.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-muted/10 px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pessoas com registro
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            {recentByMember.length}
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Listas de acompanhamento"
        className={segmentedListClassName(
          "w-full gap-0.5 overflow-x-auto overscroll-x-contain scrollbar-none",
        )}
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const selected = resolvedTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`acompanhamento-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={segmentedTriggerClassName(
                selected,
                "min-h-9 shrink-0 px-3 py-2 text-sm",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  selected ? "opacity-100" : "opacity-70",
                )}
                aria-hidden
              />
              {item.label}
              <span className="tabular-nums opacity-80">{item.count}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`acompanhamento-tab-${resolvedTab}`}
        aria-label={activeMeta.label}
        className="min-h-48"
      >
        {resolvedTab === "followUps" ? (
          <section>
            <PanelIntro
              title="Retornos"
              description="À esquerda, a agenda da semana. À direita, o que já passou da data — sempre com base no retorno da última anotação."
            />
            <FollowUpsBoard
              members={data.followUpsDue}
              horizonDays={followUpHorizonDays}
            />
          </section>
        ) : null}

        {resolvedTab === "withoutContact" ? (
          <section>
            <PanelIntro
              title={`Sem contato há ${days} dias ou mais`}
              description="Membros e visitantes ativos sem anotação recente — um sinal para olhar com carinho."
            />
            {data.withoutRecentContact.length === 0 ? (
              <EmptyState
                icon={HeartPulse}
                title="Ninguém nesta lista"
                description={`Todas as pessoas ativas tiveram contato nos últimos ${days} dias.`}
              />
            ) : (
              <ul className="space-y-2">
                {data.withoutRecentContact.map((member) => (
                  <SummaryMemberRow
                    key={member.memberId}
                    member={member}
                    framed
                    detail={
                      member.lastNoteOn
                        ? `Último registro em ${formatDate(member.lastNoteOn)}${
                            member.daysSinceLastNote != null
                              ? ` · ${member.daysSinceLastNote} dias`
                              : ""
                          }`
                        : "Ainda sem registro de acompanhamento"
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {resolvedTab === "recent" ? (
          <section>
            <PanelIntro
              title="Registros recentes"
              description="Uma pessoa por card — a anotação mais nova em destaque. Abra a ficha para o histórico completo."
            />
            {recentByMember.length === 0 ? (
              <EmptyState
                icon={
                  data.followUpsDue.length || data.withoutRecentContact.length
                    ? NotebookPen
                    : Inbox
                }
                title="Nenhuma anotação ainda"
                description="Abra a ficha de uma pessoa e registre a primeira visita ou conversa."
              />
            ) : (
              <ul className="space-y-3">
                {recentByMember.map((group) => (
                  <MemberRecentNotesCard
                    key={group.memberId}
                    memberId={group.memberId}
                    memberName={group.memberName}
                    notes={group.notes}
                  />
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
