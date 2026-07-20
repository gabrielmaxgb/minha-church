"use client";

import Link from "next/link";
import {
  CalendarClock,
  HeartPulse,
  Inbox,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import { Skeleton } from "@/components/ui/skeleton";
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

function SectionIntro({
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

  return (
    <span className="text-xs text-muted-foreground">{label}</span>
  );
}

function SummaryMemberRow({
  member,
  detail,
}: {
  member: PastoralCareSummaryMember;
  detail: string;
}) {
  const { permissions } = useAuth();
  const canOpen = canAccessMembers(permissions);
  const nameNode = canOpen ? (
    <Link
      href={memberDetailPath(member.memberId)}
      className="font-medium text-foreground underline-offset-2 hover:underline"
    >
      {member.memberName}
    </Link>
  ) : (
    <span className="font-medium text-foreground">{member.memberName}</span>
  );

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3.5 py-3">
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
      />
    </li>
  );
}

function RecentNoteCard({ note }: { note: PastoralNote }) {
  const { permissions } = useAuth();
  const canOpen = canAccessMembers(permissions);

  return (
    <li className="rounded-2xl border border-border/80 bg-background px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-md border border-domain-members/25 bg-domain-members-subtle px-2 py-0.5 text-[11px] font-medium text-domain-members-foreground">
            {PASTORAL_NOTE_TYPE_LABELS[note.type]}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(note.occurredOn)}
          </span>
        </div>
        <MemberDetailButton
          memberId={note.memberId}
          memberName={note.memberName}
        />
      </div>

      <p className="mt-2 text-sm font-medium text-foreground">
        {canOpen ? (
          <Link
            href={memberDetailPath(note.memberId)}
            className="underline-offset-2 hover:underline"
          >
            {note.memberName}
          </Link>
        ) : (
          note.memberName
        )}
      </p>

      <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {note.body}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        Por {note.authorName}
        {note.followUpOn
          ? ` · Retorno ${formatDate(note.followUpOn)}`
          : null}
      </p>
    </li>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export function PastoralCareContent() {
  const summaryQuery = usePastoralCareSummary();
  const data = summaryQuery.data;

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

  return (
    <div className="space-y-8">
      <DashboardPageIntro
        eyebrow="Cuidado pastoral"
        title="Acompanhamento"
        description="Quem precisa de retorno, quem ficou sem contato e o que foi registrado recentemente — para a equipe com permissão de acompanhamento."
        domain="members"
      />

      <div
        className={cn(
          "grid gap-3 sm:grid-cols-3",
        )}
      >
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
            Notas recentes
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            {data.recentNotes.length}
          </p>
        </div>
      </div>

      <section>
        <SectionIntro
          title="Retornos em aberto"
          description="Pessoas com data de retorno já vencida ou para hoje."
        />
        {data.followUpsDue.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum retorno pendente"
            description="Quando uma anotação tiver data de retorno, ela aparece aqui."
          />
        ) : (
          <ul className="space-y-2">
            {data.followUpsDue.map((member) => (
              <SummaryMemberRow
                key={member.memberId}
                member={member}
                detail={
                  member.openFollowUpOn
                    ? `Retorno em ${formatDate(member.openFollowUpOn)}`
                    : "Retorno agendado"
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionIntro
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

      <section>
        <SectionIntro
          title="Registros recentes"
          description="Últimas anotações da equipe — abra a ficha para ver o histórico completo."
        />
        {data.recentNotes.length === 0 ? (
          <EmptyState
            icon={data.followUpsDue.length || data.withoutRecentContact.length ? NotebookPen : Inbox}
            title="Nenhuma anotação ainda"
            description="Abra a ficha de uma pessoa e registre a primeira visita ou conversa."
          />
        ) : (
          <ul className="space-y-3">
            {data.recentNotes.map((note) => (
              <RecentNoteCard key={note.id} note={note} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
