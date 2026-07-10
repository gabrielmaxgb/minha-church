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
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Membros", icon: Users },
  { id: "ministries", label: "Ministérios", icon: Layers },
  { id: "activities", label: "Atividades", icon: Calendar },
  { id: "schedules", label: "Minhas escalas", icon: CalendarDays, badge: 2 },
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
          <p className="text-[10px] text-muted-foreground">domingo, 6 de julho</p>
          <p className="text-base font-semibold tracking-tight">
            Boa noite, Samuel
          </p>
        </div>
        {!compact && (
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-[10px] font-medium text-background">
              <Plus className="size-3" />
              Nova atividade
            </span>
            <span className="rounded-md border border-border px-2.5 py-1.5 text-[10px] font-medium">
              Ver membros
            </span>
          </div>
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
                Próximo culto / atividade
              </span>
              <span className="rounded-md bg-attention-subtle px-1.5 py-0.5 text-[9px] font-medium text-attention-foreground">
                Amanhã
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium">Culto de Domingo</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              19:00
              <MapPin className="ml-2 size-3" />
              Templo principal
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
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium tracking-tight">Pendências</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            O que precisa da sua atenção.
          </p>
        </div>
      </div>
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2.5 rounded-md border border-attention-border/70 bg-attention-subtle/50 px-2.5 py-2">
          <ClipboardList className="mt-0.5 size-3.5 shrink-0 text-attention-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">2 escalas sem resposta</p>
            <p className="text-[9px] text-muted-foreground">Louvor · Responder</p>
          </div>
        </li>
        <li className="flex items-start gap-2.5 rounded-md border border-border px-2.5 py-2">
          <UserCheck className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">Funções da escala</p>
            <p className="text-[9px] text-muted-foreground">Complete seu perfil</p>
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

function MockGrowthMetric() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[10px] font-medium text-muted-foreground">
        Membros ativos
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">98</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        79% do cadastro · Ver membros
      </p>
    </div>
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
        <MockEventsPanel compact={compact} />
        <MockPendencias />
      </div>
      <MockGrowthMetric />
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
          2 eventos aguardando sua resposta em Louvor
        </p>
      </div>
      {["Ministério de Louvor", "Recepção"].map((name) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Layers className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold">{name}</p>
            <p className="text-[10px] text-muted-foreground">
              Cadastre funções na escala
            </p>
          </div>
          <span className={cn(pendingNotificationStyles.badge, "rounded-full px-2 py-0.5 text-[9px]")}>
            Funções pendentes
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
    title: "Dashboard",
    subtitle: "Visão geral da igreja",
  },
  members: {
    title: "Membros",
    subtitle: "Cadastro e histórico pastoral",
  },
  ministries: {
    title: "Ministérios",
    subtitle: "Áreas de serviço, cargos e equipes",
  },
  activities: {
    title: "Atividades",
    subtitle: "Eventos e encontros por ministério",
  },
  schedules: {
    title: "Minhas escalas",
    subtitle: "Escalas e disponibilidade por ministério",
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
        "overflow-hidden rounded-xl border border-border bg-card shadow-lg",
        className,
      )}
    >
      <BrowserChrome />

      <div className={cn("flex", compact ? "min-h-[420px]" : "min-h-[540px]")}>
        <aside className="hidden w-44 shrink-0 flex-col border-r border-border/80 bg-surface sm:flex">
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <span className="text-[11px] font-semibold">Minha Church</span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-2 py-4">
            <p className="px-2 pb-2 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
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
                      ? "bg-muted font-medium text-foreground"
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
