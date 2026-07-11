"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Layers,
  LayoutDashboard,
  MapPin,
  Plus,
  Repeat,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { LogoMark } from "@/components/layout/logo";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

type MockView =
  | "dashboard"
  | "members"
  | "ministries"
  | "activities"
  | "schedules";

const primaryNav: {
  id: MockView;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  domainClass: string;
}[] = [
  {
    id: "dashboard",
    label: "Início",
    icon: LayoutDashboard,
    domainClass: "bg-domain-home-subtle text-domain-home-foreground",
  },
  {
    id: "members",
    label: "Membros",
    icon: Users,
    domainClass: "bg-domain-members-subtle text-domain-members-foreground",
  },
  {
    id: "ministries",
    label: "Ministérios",
    icon: Layers,
    domainClass:
      "bg-domain-ministries-subtle text-domain-ministries-foreground",
  },
  {
    id: "activities",
    label: "Atividades",
    icon: Calendar,
    domainClass:
      "bg-domain-activities-subtle text-domain-activities-foreground",
  },
  {
    id: "schedules",
    label: "Minhas escalas",
    icon: CalendarDays,
    badge: 2,
    domainClass:
      "bg-domain-schedules-subtle text-domain-schedules-foreground",
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

function MockTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium tracking-tight">{title}</h3>
        {subtitle && (
          <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative flex size-8 items-center justify-center rounded-lg border border-border bg-card">
          <Bell className="size-3.5 text-foreground" />
          <span className={cn(pendingNotificationStyles.bellBadge, "size-3.5 min-w-3.5 text-[8px]")}>
            1
          </span>
        </div>
        <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 sm:flex">
          <span className="max-w-[7rem] truncate text-[10px] font-medium">
            Igreja Esperança
          </span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          PS
        </div>
      </div>
    </header>
  );
}

function MockDashboardHero({ compact }: { compact?: boolean }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] text-muted-foreground">
            domingo, 6 de julho · Igreja Esperança
          </p>
          <p className="text-base font-semibold tracking-tight">
            Boa noite, Samuel
          </p>
          <p className="text-[10px] text-muted-foreground">
            O essencial da sua semana
          </p>
        </div>
        {!compact && (
          <span className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-[10px] font-medium text-background">
            <Plus className="size-3" />
            Nova atividade
          </span>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-md bg-foreground text-background">
            <span className="text-sm font-semibold leading-none">6</span>
            <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide opacity-80">
              jul
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                Próximo culto
              </span>
              <span className="rounded-md bg-attention-subtle px-1.5 py-0.5 text-[9px] font-medium text-attention-foreground">
                Amanhã · 19:00
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium">Culto de Domingo</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="size-3" />
              Templo principal · Louvor com 3 aguardando resposta
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

function MockPendencias() {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <p className="text-sm font-medium tracking-tight">Antes do culto</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          O que ainda precisa de resposta.
        </p>
      </div>
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2.5 rounded-md border border-attention-border bg-attention-subtle px-2.5 py-2">
          <ClipboardList className="mt-0.5 size-3.5 shrink-0 text-attention-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">3 escalas sem resposta</p>
            <p className="text-[9px] text-muted-foreground">
              Louvor · Fechar escala
            </p>
          </div>
        </li>
        <li className="flex items-start gap-2.5 rounded-md border border-border px-2.5 py-2">
          <UserCheck className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">1 acesso pendente</p>
            <p className="text-[9px] text-muted-foreground">Aprovar entrada</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5 rounded-md border border-border px-2.5 py-2">
          <Bell className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">Comunicado do ensaio</p>
            <p className="text-[9px] text-muted-foreground">Publicar para Louvor</p>
          </div>
        </li>
      </ul>
    </section>
  );
}

function MockEventsPanel({ compact }: { compact?: boolean }) {
  const items = compact ? upcomingEvents.slice(0, 2) : upcomingEvents;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium tracking-tight">Agenda</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Próximas atividades da igreja.
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[9px] font-medium">
          Ver todas
        </span>
      </div>
      <ol className="divide-y divide-border">
        {items.map((event) => (
          <li key={event.name} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-[9px] font-semibold leading-tight">
              <span>{event.day}</span>
              <span className="text-muted-foreground">{event.month}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1">
                <p className="truncate text-[11px] font-medium">{event.name}</p>
                {event.recurring && (
                  <Repeat className="size-2.5 text-muted-foreground" />
                )}
                {event.churchWide && (
                  <Sparkles className="size-2.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">
                {event.time}
                {event.ministry ? ` · ${event.ministry}` : ""}
              </p>
            </div>
            {event.relative && (
              <span className="shrink-0 text-[9px] font-medium text-muted-foreground">
                {event.relative}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function MockCommunication() {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium tracking-tight">Comunicação</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        Último aviso publicado
      </p>
      <p className="mt-3 text-[11px] font-medium">Ensaio de louvor — quinta 20h</p>
      <p className="mt-0.5 text-[9px] text-muted-foreground">
        Louvor · Publicado ontem
      </p>
    </section>
  );
}

function DashboardView({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3">
      <MockDashboardHero compact={compact} />
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-1" : "lg:grid-cols-2",
        )}
      >
        <MockPendencias />
        <MockEventsPanel compact={compact} />
      </div>
      {!compact ? <MockCommunication /> : null}
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

const viewMeta: Record<
  MockView,
  { title: string; subtitle?: string }
> = {
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
    title: "Atividades",
    subtitle: "Agenda da igreja",
  },
  schedules: {
    title: "Escalas",
    subtitle: "Confirmações do culto",
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

      <div className={cn("flex", compact ? "min-h-[400px]" : "min-h-[520px]")}>
        <aside className="hidden w-48 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <span className="text-[11px] font-semibold">Minha Church</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-2 py-4">
            <p className="px-2 pb-2 text-[9px] font-medium tracking-wide text-muted-foreground">
              Menu
            </p>
            {primaryNav.map((item) => {
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] transition-colors",
                    isActive
                      ? cn("font-medium", item.domainClass)
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        "flex size-4 min-w-4 items-center justify-center rounded-full text-[8px] font-bold tabular-nums",
                        isActive
                          ? "bg-foreground text-background"
                          : pendingNotificationStyles.countBadge,
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="my-3 border-t border-border" />

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-medium text-muted-foreground"
            >
              <Settings className="size-3.5" />
              Configurações
            </button>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <MockTopbar title={meta.title} subtitle={meta.subtitle} />

          <div className="dashboard-canvas flex-1 overflow-auto p-3 sm:p-4">
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
