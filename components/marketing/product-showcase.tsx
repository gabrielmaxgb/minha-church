"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Church,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Mail,
  Megaphone,
  Repeat,
  Settings,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

type MockView =
  | "dashboard"
  | "members"
  | "ministries"
  | "activities"
  | "communication"
  | "schedules";

const primaryNav: {
  id: MockView;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  domainClass: string;
  sectionStart?: boolean;
}[] = [
  {
    id: "dashboard",
    label: "Início",
    icon: LayoutDashboard,
    domainClass:
      "border border-domain-home/30 bg-domain-home-subtle text-domain-home-foreground",
  },
  {
    id: "activities",
    label: "Eventos",
    icon: Calendar,
    sectionStart: true,
    domainClass:
      "border border-domain-activities/30 bg-domain-activities-subtle text-domain-activities-foreground",
  },
  {
    id: "communication",
    label: "Avisos",
    icon: Mail,
    domainClass:
      "border border-domain-communication/30 bg-domain-communication-subtle text-domain-communication-foreground",
  },
  {
    id: "schedules",
    label: "Minha escala",
    icon: CalendarDays,
    badge: 2,
    domainClass:
      "border border-domain-schedules/30 bg-domain-schedules-subtle text-domain-schedules-foreground",
  },
  {
    id: "members",
    label: "Membros",
    icon: Users,
    sectionStart: true,
    domainClass:
      "border border-domain-members/30 bg-domain-members-subtle text-domain-members-foreground",
  },
  {
    id: "ministries",
    label: "Ministérios",
    icon: Layers,
    domainClass:
      "border border-domain-ministries/30 bg-domain-ministries-subtle text-domain-ministries-foreground",
  },
];

const upcomingEvents = [
  {
    name: "Adoração EBD",
    day: 6,
    month: "jul",
    time: "09:30",
    ministry: "Louvor",
    recurring: true,
    relative: "Amanhã",
  },
  {
    name: "Culto de Domingo",
    day: 6,
    month: "jul",
    time: "19:00",
    ministry: "Igreja",
    churchWide: true,
    relative: "Domingo",
  },
  {
    name: "Ensaio de louvor",
    day: 9,
    month: "jul",
    time: "20:00",
    ministry: "Louvor",
    recurring: true,
  },
];

const ministries = [
  { name: "Ministério de Louvor", members: 18, roster: true },
  { name: "Recepção", members: 12, roster: true },
  { name: "Mídia", members: 9, roster: true },
  { name: "Infantil", members: 14, roster: false },
];

const membersPreview = [
  { name: "Ana Silva", role: "Vocal", ministry: "Louvor" },
  { name: "Carlos Mendes", role: "Violão", ministry: "Louvor" },
  { name: "João Pereira", role: "Recepção", ministry: "Recepção" },
  { name: "Maria Santos", role: "Operador", ministry: "Mídia" },
];

function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
      <div className="flex gap-1.5">
        <div className="size-2.5 rounded-full bg-red-400/80" />
        <div className="size-2.5 rounded-full bg-yellow-400/80" />
        <div className="size-2.5 rounded-full bg-green-400/80" />
      </div>
      <div className="flex flex-1 items-center justify-center rounded-md border border-border bg-background px-3 py-1">
        <span className="text-[11px] text-muted-foreground">
          app.minhachurch.com.br
        </span>
      </div>
    </div>
  );
}

function MockChurchBrand() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-domain-members-subtle via-card to-attention-subtle p-3 shadow-xs">
      <div
        className="pointer-events-none absolute -left-6 -top-8 size-20 rounded-full bg-domain-members/18 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-4 -bottom-8 size-16 rounded-full bg-attention/22 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-xs ring-1 ring-domain-members/15">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            className="size-7 object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-medium tracking-wide text-domain-members-foreground/80">
            Minha Church
          </p>
          <p className="mt-0.5 truncate font-display text-[12px] font-semibold leading-snug tracking-tight text-foreground">
            Igreja Esperança
          </p>
        </div>
      </div>
    </div>
  );
}

function MockTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium tracking-tight sm:text-base">
          {title}
        </h3>
        {subtitle && (
          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex h-9 shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative flex size-8 items-center justify-center rounded-lg border border-border bg-card">
          <Bell className="size-3.5 text-foreground" />
          <span
            className={cn(
              pendingNotificationStyles.bellBadge,
              "size-3.5 min-w-3.5 text-[8px]",
            )}
          >
            1
          </span>
        </div>
        <div className="hidden h-8 max-w-[11rem] items-center gap-1.5 rounded-lg border border-border bg-card px-2 sm:flex">
          <Church className="size-3 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
            Igreja Esperança
          </span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          PS
        </div>
      </div>
    </header>
  );
}

function MockDashboardHero() {
  return (
    <section className="min-w-0 space-y-1">
      <p className="text-[10px] text-muted-foreground sm:text-xs">
        domingo, 6 de julho · Igreja Esperança
      </p>
      <p className="text-base font-semibold tracking-tight sm:text-xl">
        Boa noite, Samuel
      </p>
      <p className="text-[10px] text-muted-foreground sm:text-sm">
        O que mais importa para a igreja hoje.
      </p>
    </section>
  );
}

const priorityTones: Record<
  "attention" | "schedules" | "communication",
  { shell: string; icon: string }
> = {
  attention: {
    shell: "border-attention-border bg-attention-subtle/80",
    icon: "bg-attention-mark text-attention-foreground",
  },
  schedules: {
    shell:
      "border-attention-border bg-gradient-to-br from-attention-subtle via-card to-card",
    icon: "bg-attention-mark text-attention-foreground",
  },
  communication: {
    shell:
      "border-domain-communication/30 bg-gradient-to-br from-domain-communication-subtle via-card to-card",
    icon: "bg-domain-communication/20 text-domain-communication-foreground",
  },
};

const priorities: {
  tone: keyof typeof priorityTones;
  icon: typeof ClipboardList;
  title: string;
  description: string;
}[] = [
  {
    tone: "schedules",
    icon: ClipboardList,
    title: "Escala do Culto de Domingo",
    description: "3 pessoas ainda não responderam",
  },
  {
    tone: "attention",
    icon: UserCheck,
    title: "1 acesso pendente",
    description: "Aprovar entrada de membro",
  },
  {
    tone: "communication",
    icon: Megaphone,
    title: "Comunicado do ensaio",
    description: "Publicar para o Louvor",
  },
];

function MockPriorities() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium tracking-tight">
          3 coisas pedem você hoje
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
          Resolva estas primeiro — o restante pode esperar
        </p>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {priorities.map((item, index) => {
          const tone = priorityTones[item.tone];
          return (
            <li
              key={item.title}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                tone.shell,
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  tone.icon,
                )}
              >
                <item.icon className="size-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-medium tabular-nums text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="truncate text-[11px] font-semibold sm:text-xs">
                    {item.title}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const weekDensity = [
  { label: "dom", count: 2, isToday: true },
  { label: "seg", count: 0 },
  { label: "ter", count: 1 },
  { label: "qua", count: 1 },
  { label: "qui", count: 2 },
  { label: "sex", count: 0 },
  { label: "sáb", count: 3 },
];

function MockWeekPulse() {
  const maxCount = Math.max(...weekDensity.map((day) => day.count), 1);
  const total = weekDensity.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-domain-activities/30 bg-gradient-to-br from-domain-activities-subtle via-card to-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-domain-activities-foreground">
            Ritmo da semana
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
            Eventos por dia na agenda
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="inline-flex h-7 items-center gap-1 rounded-md border border-domain-activities/25 bg-card/80 px-2 text-[9px] font-medium text-domain-activities-foreground">
            Ver agenda
            <ArrowRight className="size-3 opacity-80" />
          </span>
          <span className="rounded-md bg-domain-activities/20 px-2 py-1 text-[9px] font-medium tabular-nums text-domain-activities-foreground">
            {total} no total
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-1 items-end gap-1.5">
        {weekDensity.map((day) => {
          const heightPct =
            day.count === 0 ? 8 : Math.max(18, (day.count / maxCount) * 100);

          return (
            <div
              key={day.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex h-20 w-full items-end justify-center">
                <div
                  className={cn(
                    "w-full max-w-[1.75rem] rounded-md",
                    day.count === 0
                      ? "bg-muted"
                      : day.isToday
                        ? "bg-domain-activities"
                        : "bg-domain-activities/55",
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <div className="text-center leading-none">
                <p
                  className={cn(
                    "text-[9px] font-medium capitalize",
                    day.isToday
                      ? "text-domain-activities-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {day.label}
                </p>
                <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                  {day.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const domainIconShell = {
  members: "bg-domain-members-subtle text-domain-members-foreground",
  activities: "bg-domain-activities-subtle text-domain-activities-foreground",
  communication:
    "bg-domain-communication-subtle text-domain-communication-foreground",
  schedules: "bg-domain-schedules-subtle text-domain-schedules-foreground",
} as const;

const quickActions: {
  domain: keyof typeof domainIconShell;
  icon: typeof Users;
  label: string;
  description: string;
}[] = [
  {
    domain: "members",
    icon: UserPlus,
    label: "Cadastrar membro",
    description: "Novo cadastro pastoral",
  },
  {
    domain: "activities",
    icon: Calendar,
    label: "Criar evento",
    description: "Culto, ensaio ou encontro",
  },
  {
    domain: "communication",
    icon: Megaphone,
    label: "Publicar aviso",
    description: "Comunicado para a igreja",
  },
  {
    domain: "schedules",
    icon: CalendarDays,
    label: "Ver agenda",
    description: "Escalas e próximos encontros",
  },
];

function MockQuickActions({ compact }: { compact?: boolean }) {
  const items = compact ? quickActions.slice(0, 2) : quickActions;

  return (
    <section className="space-y-2.5">
      <div>
        <p className="text-sm font-medium tracking-tight sm:text-base">
          Faça agora
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
          As tarefas mais comuns da secretaria
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((action) => (
          <li
            key={action.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                domainIconShell[action.domain],
              )}
            >
              <action.icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold tracking-tight sm:text-sm">
                {action.label}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                {action.description}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MockEventsPanel({ compact }: { compact?: boolean }) {
  const items = compact ? upcomingEvents.slice(0, 2) : upcomingEvents;

  return (
    <section className="rounded-xl border border-domain-activities/30 bg-gradient-to-br from-domain-activities-subtle via-card to-card">
      <div className="flex items-start justify-between gap-2 border-b border-domain-activities/20 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-domain-activities-foreground sm:text-base">
            Agenda da semana
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
            Próximos cultos e encontros
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border bg-card px-2.5 py-1.5 text-[9px] font-medium">
          Ver todas
        </span>
      </div>
      <ol className="space-y-0.5 p-2">
        {items.map((event, index) => {
          const isNext = index === 0;
          return (
            <li
              key={event.name}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2.5",
                isNext && "bg-muted/40",
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 flex-col items-center justify-center rounded-md border text-center leading-none",
                  isNext
                    ? "border-foreground/15 bg-foreground text-background"
                    : "border-border bg-card text-foreground",
                )}
              >
                <span className="text-[11px] font-semibold">{event.day}</span>
                <span
                  className={cn(
                    "mt-0.5 text-[8px] font-medium uppercase tracking-wide",
                    isNext ? "text-background/80" : "text-muted-foreground",
                  )}
                >
                  {event.month}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[11px] font-medium sm:text-xs">
                    {event.name}
                  </p>
                  {event.relative && (
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                      {event.relative}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[9px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-2.5 shrink-0" />
                    {event.time}
                  </span>
                  {event.recurring && (
                    <span className="inline-flex items-center gap-1">
                      <Repeat className="size-2.5 shrink-0" />
                      Semanal
                    </span>
                  )}
                  {event.churchWide ? (
                    <span>Igreja</span>
                  ) : event.ministry ? (
                    <span className="truncate">{event.ministry}</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const mockAnnouncements = [
  { title: "Ensaio de louvor — quinta 20h", body: "Louvor · Publicado ontem" },
  {
    title: "Reunião de líderes — sábado",
    body: "Liderança · Publicado há 2 dias",
  },
  {
    title: "Campanha do agasalho começa domingo",
    body: "Igreja · Publicado há 3 dias",
  },
];

function MockCommunication() {
  return (
    <section className="rounded-xl border border-domain-communication/30 bg-gradient-to-br from-domain-communication-subtle via-card to-card">
      <div className="flex items-start justify-between gap-2 border-b border-domain-communication/20 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-domain-communication-foreground sm:text-base">
            Avisos
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
            Comunicados publicados para a igreja
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border bg-card px-2.5 py-1.5 text-[9px] font-medium">
          Ver tudo
        </span>
      </div>
      <ul className="divide-y divide-border/70">
        {mockAnnouncements.map((item) => (
          <li key={item.title} className="flex items-start gap-3 px-4 py-3">
            <Megaphone className="mt-0.5 size-3.5 shrink-0 text-domain-communication-foreground" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium sm:text-xs">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DashboardView({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <MockDashboardHero />
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-1" : "lg:grid-cols-2 lg:items-stretch",
        )}
      >
        <MockPriorities />
        <MockWeekPulse />
      </div>
      <MockQuickActions compact={compact} />
      <div
        className={cn(
          "grid gap-4",
          compact ? "grid-cols-1" : "lg:grid-cols-2",
        )}
      >
        <MockEventsPanel compact={compact} />
        {!compact ? <MockCommunication /> : null}
      </div>
    </div>
  );
}

function MembersView() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-border bg-muted/30 px-3 py-2 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Nome</span>
        <span>Função</span>
        <span>Ministério</span>
      </div>
      {membersPreview.map((member) => (
        <div
          key={member.name}
          className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-border/60 px-3 py-2.5 text-[10px] last:border-0"
        >
          <span className="font-medium">{member.name}</span>
          <span className="text-muted-foreground">{member.role}</span>
          <span className="text-muted-foreground">{member.ministry}</span>
        </div>
      ))}
    </div>
  );
}

function MinistriesView() {
  return (
    <div className="space-y-2">
      {ministries.map((ministry) => (
        <div
          key={ministry.name}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-[11px] font-medium">{ministry.name}</p>
              {ministry.roster && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  Escalas
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {ministry.members} membros
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}

function SchedulesView() {
  return (
    <div className="space-y-3">
      <div className={pendingNotificationStyles.banner.compact}>
        <p className="text-[11px] font-medium">
          Culto de Domingo · 3 pessoas ainda não responderam
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Feche a escala de Louvor antes das 19h.
        </p>
      </div>
      {[
        { name: "Ana Silva", role: "Vocal", status: "Aguardando" },
        { name: "Carlos Mendes", role: "Violão", status: "Posso ir" },
        { name: "João Pereira", role: "Recepção", status: "Aguardando" },
      ].map((row) => (
        <div
          key={row.name}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">{row.role}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[9px] font-medium",
              row.status === "Posso ir"
                ? "bg-success-subtle text-success-foreground"
                : "bg-attention-subtle text-attention-foreground",
            )}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

const viewMeta: Record<MockView, { title: string; subtitle?: string }> = {
  dashboard: {
    title: "Início",
    subtitle: "A semana da igreja",
  },
  members: {
    title: "Membros",
    subtitle: "Cadastro pastoral",
  },
  ministries: {
    title: "Ministérios",
    subtitle: "Equipes e cargos",
  },
  activities: {
    title: "Eventos",
    subtitle: "Cultos e encontros da semana",
  },
  communication: {
    title: "Avisos",
    subtitle: "Comunicados para a igreja",
  },
  schedules: {
    title: "Minha escala",
    subtitle: "Convocações e disponibilidade",
  },
};

function AppMock({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [activeView, setActiveView] = useState<MockView>("dashboard");
  const meta = viewMeta[activeView];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-popover",
        className,
      )}
    >
      <BrowserChrome />

      <div className={cn("flex", compact ? "min-h-[400px]" : "min-h-[560px]")}>
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="border-b border-border px-3 py-3">
            <MockChurchBrand />
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
            <p className="px-2.5 pb-2 text-[9px] font-medium tracking-wide text-muted-foreground">
              Menu
            </p>
            {primaryNav.map((item) => {
              const isActive = activeView === item.id;

              return (
                <div key={item.id}>
                  {item.sectionStart ? (
                    <div className="my-2 border-t border-border/70" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] transition-colors",
                      isActive
                        ? cn("font-medium", item.domainClass)
                        : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "opacity-90" : "opacity-65",
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          "flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[8px] font-bold tabular-nums",
                          pendingNotificationStyles.countBadge,
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            <div className="my-3 border-t border-border" />

            <button
              type="button"
              className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-[11px] font-medium text-muted-foreground"
            >
              <Settings className="size-4 opacity-65" />
              Configurações
            </button>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <MockTopbar title={meta.title} subtitle={meta.subtitle} />

          <div className="dashboard-canvas flex-1 overflow-auto p-3 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {activeView === "dashboard" && (
                  <DashboardView compact={compact} />
                )}
                {activeView === "members" && <MembersView />}
                {activeView === "ministries" && <MinistriesView />}
                {activeView === "activities" && (
                  <MockEventsPanel compact={compact} />
                )}
                {activeView === "communication" && <MockCommunication />}
                {activeView === "schedules" && <SchedulesView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductShowcase({ className }: { className?: string }) {
  return <AppMock className={className} />;
}

export function ProductShowcaseCompact({ className }: { className?: string }) {
  return <AppMock compact className={className} />;
}
