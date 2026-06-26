"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";

type MockView = "dashboard" | "members" | "cultos" | "finances";

const navItems: { id: MockView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Membros", icon: Users },
  { id: "cultos", label: "Cultos", icon: Calendar },
  { id: "finances", label: "Finanças", icon: Wallet },
];

const viewTitles: Record<MockView, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Visão geral da sua igreja",
  },
  members: {
    title: "Membros",
    subtitle: "248 membros cadastrados",
  },
  cultos: {
    title: "Cultos & Eventos",
    subtitle: "Agenda da igreja",
  },
  finances: {
    title: "Finanças",
    subtitle: "Prestação de contas — Março 2026",
  },
};

const membersData = [
  { name: "Ana Silva", ministry: "Louvor", status: "Ativo", since: "2021" },
  { name: "Carlos Mendes", ministry: "Diáconato", status: "Ativo", since: "2019" },
  { name: "Maria Santos", ministry: "Célula 3", status: "Ativo", since: "2022" },
  { name: "João Pereira", ministry: "Recepção", status: "Visitante", since: "2026" },
  { name: "Fernanda Lima", ministry: "Infantil", status: "Ativo", since: "2020" },
  { name: "Roberto Alves", ministry: "Mídia", status: "Ativo", since: "2023" },
  { name: "Patricia Souza", ministry: "Intercessão", status: "Ativo", since: "2018" },
  { name: "Lucas Ferreira", ministry: "Jovens", status: "Inativo", since: "2024" },
];

const cultosData = [
  { title: "Culto de Domingo", date: "29 Mar", time: "19:00", volunteers: 12, confirmed: 9 },
  { title: "Estudo Bíblico", date: "01 Abr", time: "20:00", volunteers: 4, confirmed: 4 },
  { title: "Culto de Oração", date: "02 Abr", time: "07:00", volunteers: 6, confirmed: 5 },
  { title: "Encontro de Células", date: "05 Abr", time: "19:30", volunteers: 24, confirmed: 18 },
];

const transactions = [
  { label: "Dízimos — Culto Domingo", value: "+ R$ 8.420", type: "in" as const },
  { label: "Ofertas missionárias", value: "+ R$ 2.150", type: "in" as const },
  { label: "Aluguel do templo", value: "− R$ 3.800", type: "out" as const },
  { label: "Material de limpeza", value: "− R$ 340", type: "out" as const },
  { label: "Ofertas — Culto Jovens", value: "+ R$ 890", type: "in" as const },
];

const chartData = [
  { label: "Dom", value: 186 },
  { label: "Seg", value: 42 },
  { label: "Ter", value: 38 },
  { label: "Qua", value: 55 },
  { label: "Qui", value: 48 },
  { label: "Sex", value: 62 },
  { label: "Sáb", value: 78 },
];

const maxChartValue = Math.max(...chartData.map((d) => d.value));

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "Ativo" && "bg-foreground/10 text-foreground",
        status === "Visitante" && "bg-muted text-muted-foreground",
        status === "Inativo" && "bg-muted text-muted-foreground/60",
      )}
    >
      {status}
    </span>
  );
}

interface AppMockProps {
  compact?: boolean;
  className?: string;
}

function AppMock({ compact = false, className }: AppMockProps) {
  const [activeView, setActiveView] = useState<MockView>("dashboard");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "Ativo" | "Visitante">("all");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [financePeriod, setFinancePeriod] = useState<"mar" | "fev">("mar");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return membersData.filter((m) => {
      const matchesSearch =
        memberSearch === "" ||
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.ministry.toLowerCase().includes(memberSearch.toLowerCase());
      const matchesFilter =
        memberFilter === "all" || m.status === memberFilter;
      return matchesSearch && matchesFilter;
    });
  }, [memberSearch, memberFilter]);

  const { title, subtitle } = viewTitles[activeView];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-lg",
        className,
      )}
    >
      <BrowserChrome />

      <div className={cn("flex", compact ? "min-h-[380px]" : "min-h-[520px]")}>
        {/* Sidebar */}
        <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-muted/30 p-3">
          <div className="mb-4 flex items-center gap-2 px-2">
            <LogoMark size={28} />
            <div>
              <div className="text-[11px] font-semibold leading-tight">
                Minha Church
              </div>
              <div className="text-[9px] text-muted-foreground">
                Sua igreja
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] font-medium transition-colors",
                  activeView === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-md border border-border bg-background p-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                PS
              </div>
              <div className="min-w-0">
                <div className="truncate text-[10px] font-medium">Pr. Samuel</div>
                <div className="text-[9px] text-muted-foreground">Administrador</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 sm:flex">
                <Search className="size-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  Buscar...
                </span>
              </div>
              <button
                type="button"
                className="rounded-md bg-foreground px-3 py-1.5 text-[10px] font-medium text-background transition-opacity hover:opacity-90"
              >
                + Novo
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === "dashboard" && (
                  <DashboardView
                    compact={compact}
                    hoveredBar={hoveredBar}
                    onHoverBar={setHoveredBar}
                    onNavigate={setActiveView}
                  />
                )}
                {activeView === "members" && (
                  <MembersView
                    members={filteredMembers}
                    search={memberSearch}
                    onSearchChange={setMemberSearch}
                    filter={memberFilter}
                    onFilterChange={setMemberFilter}
                    selected={selectedMember}
                    onSelect={setSelectedMember}
                  />
                )}
                {activeView === "cultos" && <CultosView />}
                {activeView === "finances" && (
                  <FinancesView
                    period={financePeriod}
                    onPeriodChange={setFinancePeriod}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({
  compact,
  hoveredBar,
  onHoverBar,
  onNavigate,
}: {
  compact: boolean;
  hoveredBar: number | null;
  onHoverBar: (i: number | null) => void;
  onNavigate: (view: MockView) => void;
}) {
  const stats = [
    { label: "Membros ativos", value: "248", change: "+12", view: "members" as const },
    { label: "Presença domingo", value: "186", change: "+8%", view: "dashboard" as const },
    { label: "Ofertas do mês", value: "R$ 18,4k", change: "+5%", view: "finances" as const },
    { label: "Próximo culto", value: "Dom 19h", change: "12 vol.", view: "cultos" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => stat.view !== "dashboard" && onNavigate(stat.view)}
            className="rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-foreground/30 hover:bg-muted/30"
          >
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {stat.value}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="size-2.5" />
              {stat.change}
            </div>
          </button>
        ))}
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-5")}>
        {/* Chart */}
        <div className={cn("rounded-lg border border-border p-4", compact ? "" : "col-span-3")}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium">Presença semanal</span>
            <span className="text-[10px] text-muted-foreground">Últimos 7 dias</span>
          </div>
          <div className="flex h-28 gap-1.5 overflow-hidden">
            {chartData.map((bar, i) => (
              <div
                key={bar.label}
                className="flex h-full flex-1 flex-col items-center"
              >
                <div className="relative flex w-full flex-1 items-end">
                  {hoveredBar === i && (
                    <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap text-background">
                      {bar.value}
                    </div>
                  )}
                  <button
                    type="button"
                    className="w-full min-h-1 rounded-sm bg-foreground/15 transition-colors hover:bg-foreground/30"
                    style={{
                      height: `${(bar.value / maxChartValue) * 100}%`,
                    }}
                    onMouseEnter={() => onHoverBar(i)}
                    onMouseLeave={() => onHoverBar(null)}
                    aria-label={`${bar.label}: ${bar.value} presentes`}
                  />
                </div>
                <span className="mt-1 shrink-0 text-[9px] text-muted-foreground">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        {!compact && (
          <div className="col-span-2 rounded-lg border border-border p-4">
            <div className="mb-3 text-xs font-medium">Próximos cultos</div>
            <div className="space-y-2">
              {cultosData.slice(0, 3).map((culto) => (
                <div
                  key={culto.title}
                  className="flex items-center gap-3 rounded-md border border-border px-2.5 py-2"
                >
                  <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-[9px] font-semibold leading-tight">
                    <span>{culto.date.split(" ")[0]}</span>
                    <span className="text-muted-foreground">
                      {culto.date.split(" ")[1]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">
                      {culto.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {culto.time} · {culto.confirmed}/{culto.volunteers} confirmados
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 text-xs font-medium">Atividade recente</div>
        <div className="space-y-2">
          {[
            { icon: Users, text: "João Pereira cadastrado como visitante", time: "Há 2h" },
            { icon: Wallet, text: "Entrada de R$ 8.420 registrada — Dízimos", time: "Há 5h" },
            { icon: MessageSquare, text: "Comunicado enviado para 186 membros", time: "Ontem" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                <item.icon className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px]">{item.text}</div>
                <div className="text-[10px] text-muted-foreground">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembersView({
  members,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  selected,
  onSelect,
}: {
  members: typeof membersData;
  search: string;
  onSearchChange: (v: string) => void;
  filter: "all" | "Ativo" | "Visitante";
  onFilterChange: (v: "all" | "Ativo" | "Visitante") => void;
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const filters = [
    { id: "all" as const, label: "Todos" },
    { id: "Ativo" as const, label: "Ativos" },
    { id: "Visitante" as const, label: "Visitantes" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar membro ou ministério..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-[11px] outline-none transition-colors focus:border-foreground/40"
          />
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                filter === f.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[10px] font-medium text-muted-foreground">
          <span>Nome</span>
          <span>Ministério</span>
          <span>Status</span>
          <span>Desde</span>
        </div>
        {members.length === 0 ? (
          <div className="px-3 py-8 text-center text-[11px] text-muted-foreground">
            Nenhum membro encontrado.
          </div>
        ) : (
          members.map((row) => (
            <button
              key={row.name}
              type="button"
              onClick={() => onSelect(selected === row.name ? null : row.name)}
              className={cn(
                "grid w-full grid-cols-[1fr_1fr_auto_auto] gap-2 border-b border-border px-3 py-2.5 text-left text-[11px] transition-colors last:border-0 hover:bg-muted/40",
                selected === row.name && "bg-muted/60",
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                  {row.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                {row.name}
              </span>
              <span className="self-center text-muted-foreground">
                {row.ministry}
              </span>
              <span className="self-center">
                <StatusBadge status={row.status} />
              </span>
              <span className="self-center text-muted-foreground">{row.since}</span>
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {members.length} de {membersData.length} membros
        </span>
        <div className="flex gap-1">
          <button type="button" className="rounded border border-border px-2 py-0.5 opacity-40" disabled>
            Anterior
          </button>
          <button type="button" className="rounded border border-border bg-muted px-2 py-0.5">
            1
          </button>
          <button type="button" className="rounded border border-border px-2 py-0.5">
            Próximo
          </button>
        </div>
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-lg border border-foreground/20 bg-muted/30 p-3"
        >
          <div className="text-[11px] font-medium">{selected}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Clique para ver perfil completo, histórico pastoral e presença.
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CultosView() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {["Semana", "Mês"].map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] font-medium",
                i === 0
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[10px] font-medium"
        >
          Março 2026
          <ChevronDown className="size-3" />
        </button>
      </div>

      <div className="space-y-2">
        {cultosData.map((culto) => (
          <div
            key={culto.title}
            className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:border-foreground/20 hover:bg-muted/20"
          >
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-sm font-bold leading-none">
                {culto.date.split(" ")[0]}
              </span>
              <span className="text-[9px] uppercase opacity-70">
                {culto.date.split(" ")[1]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold">{culto.title}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {culto.time}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold">
                {culto.confirmed}/{culto.volunteers}
              </div>
              <div className="text-[10px] text-muted-foreground">voluntários</div>
            </div>
            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
              <div
                className="h-full rounded-full bg-foreground"
                style={{
                  width: `${(culto.confirmed / culto.volunteers) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancesView({
  period,
  onPeriodChange,
}: {
  period: "mar" | "fev";
  onPeriodChange: (p: "mar" | "fev") => void;
}) {
  const isMar = period === "mar";

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {[
          { id: "mar" as const, label: "Março 2026" },
          { id: "fev" as const, label: "Fevereiro 2026" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPeriodChange(p.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
              period === p.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entradas", value: isMar ? "R$ 18.450" : "R$ 16.200" },
          { label: "Saídas", value: isMar ? "R$ 6.200" : "R$ 5.800" },
          { label: "Saldo", value: isMar ? "R$ 12.250" : "R$ 10.400" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border p-3"
          >
            <div className="text-[10px] text-muted-foreground">{card.label}</div>
            <div className="mt-1 text-base font-semibold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 text-xs font-medium">Composição de entradas</div>
          <div className="space-y-2">
            {[
              { label: "Dízimos", pct: 77, value: isMar ? "R$ 14.200" : "R$ 12.500" },
              { label: "Ofertas", pct: 23, value: isMar ? "R$ 4.250" : "R$ 3.700" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-300"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 text-xs font-medium">Últimas movimentações</div>
          <div className="space-y-1.5">
            {transactions.map((tx) => (
              <div
                key={tx.label}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-[10px] transition-colors hover:bg-muted/40"
              >
                <span className="truncate text-muted-foreground">{tx.label}</span>
                <span
                  className={cn(
                    "ml-2 shrink-0 font-medium",
                    tx.type === "in" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tx.value}
                </span>
              </div>
            ))}
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
