"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  countActiveAnnouncementFilters,
  DEFAULT_ANNOUNCEMENT_FILTERS,
  extractAnnouncementMinistries,
  type AnnouncementFiltersState,
  type AnnouncementPriorityFilter,
  type AnnouncementStatusFilter,
} from "@/lib/communication/announcement-filters";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types/announcements";

interface AnnouncementFiltersProps {
  announcements: Announcement[];
  filters: AnnouncementFiltersState;
  canManage?: boolean;
  /** Quando definido, limita os chips de ministério aos IDs permitidos. */
  allowedMinistryIds?: ReadonlySet<string> | null;
  onChange: (filters: AnnouncementFiltersState) => void;
}

export function AnnouncementFiltersBar({
  announcements,
  filters,
  canManage = false,
  allowedMinistryIds = null,
  onChange,
}: AnnouncementFiltersProps) {
  const ministries = extractAnnouncementMinistries(
    announcements,
    canManage ? null : allowedMinistryIds,
  );
  const activeCount = countActiveAnnouncementFilters(filters, { canManage });
  const hasChurchWide = announcements.some(
    (announcement) => announcement.audienceType === "church_wide",
  );

  function patch(partial: Partial<AnnouncementFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onChange(DEFAULT_ANNOUNCEMENT_FILTERS);
  }

  return (
    <section
      aria-label="Filtros de comunicados"
      className="overflow-hidden rounded-lg border border-border/70 bg-muted/20"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Buscar por título ou conteúdo..."
            className="h-10 border-border/60 bg-background/80 pl-9 pr-9 shadow-none focus-visible:bg-background"
            aria-label="Buscar comunicados"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => patch({ search: "" })}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            <span className="font-medium uppercase tracking-[0.12em]">
              Filtros
            </span>
            {activeCount > 0 && (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                {activeCount}
              </span>
            )}
          </div>

          {activeCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-3.5">
        <FilterRow label="Leitura">
          <FilterPill
            active={filters.read === "all"}
            onClick={() => patch({ read: "all" })}
          >
            Todos
          </FilterPill>
          <FilterPill
            active={filters.read === "unread"}
            onClick={() => patch({ read: "unread" })}
            accent="primary"
          >
            Não lidos
          </FilterPill>
          <FilterPill
            active={filters.read === "read"}
            onClick={() => patch({ read: "read" })}
          >
            Lidos
          </FilterPill>
        </FilterRow>

        {canManage && (
          <FilterRow label="Status">
            <StatusPill
              active={filters.status === "all"}
              onClick={() => patch({ status: "all" })}
              value="all"
            />
            <StatusPill
              active={filters.status === "published"}
              onClick={() => patch({ status: "published" })}
              value="published"
            />
            <StatusPill
              active={filters.status === "scheduled"}
              onClick={() => patch({ status: "scheduled" })}
              value="scheduled"
            />
            <StatusPill
              active={filters.status === "expired"}
              onClick={() => patch({ status: "expired" })}
              value="expired"
            />
          </FilterRow>
        )}

        <FilterRow label="Prioridade">
          <PriorityPill
            active={filters.priority === "all"}
            onClick={() => patch({ priority: "all" })}
            value="all"
          />
          <PriorityPill
            active={filters.priority === "important"}
            onClick={() => patch({ priority: "important" })}
            value="important"
          />
          <PriorityPill
            active={filters.priority === "urgent"}
            onClick={() => patch({ priority: "urgent" })}
            value="urgent"
          />
        </FilterRow>

        {(hasChurchWide || ministries.length > 0) && (
          <FilterRow label="Destinatário">
            <FilterPill
              active={filters.audience === "all"}
              onClick={() => patch({ audience: "all" })}
            >
              Todos
            </FilterPill>
            {hasChurchWide && (
              <FilterPill
                active={filters.audience === "church_wide"}
                onClick={() => patch({ audience: "church_wide" })}
                accent="primary"
              >
                Igreja inteira
              </FilterPill>
            )}
            {ministries.map((ministry) => (
              <FilterPill
                key={ministry.id}
                active={filters.audience === ministry.id}
                onClick={() => patch({ audience: ministry.id })}
                accent="muted"
              >
                {ministry.name}
              </FilterPill>
            ))}
          </FilterRow>
        )}
      </div>
    </section>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <p className="shrink-0 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:w-24">
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent?: "primary" | "muted";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? accent === "muted"
            ? "border-border bg-muted text-foreground"
            : "border-primary/25 bg-primary text-primary-foreground"
          : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const STATUS_LABELS: Record<AnnouncementStatusFilter, string> = {
  all: "Todos",
  published: "Publicados",
  scheduled: "Agendados",
  expired: "Expirados",
};

function StatusPill({
  active,
  onClick,
  value,
}: {
  active: boolean;
  onClick: () => void;
  value: AnnouncementStatusFilter;
}) {
  return (
    <FilterPill
      active={active}
      onClick={onClick}
      accent={value === "scheduled" ? "primary" : undefined}
    >
      {STATUS_LABELS[value]}
    </FilterPill>
  );
}

const PRIORITY_LABELS: Record<AnnouncementPriorityFilter, string> = {
  all: "Todas",
  normal: "Normal",
  important: "Importante",
  urgent: "Urgente",
};

function PriorityPill({
  active,
  onClick,
  value,
}: {
  active: boolean;
  onClick: () => void;
  value: AnnouncementPriorityFilter;
}) {
  const urgent = value === "urgent";
  const important = value === "important";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? urgent
            ? "border-destructive/25 bg-destructive/10 text-destructive"
            : important
              ? "border-attention-border bg-attention-subtle text-attention-foreground"
              : "border-primary/25 bg-primary text-primary-foreground"
          : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
      )}
    >
      {PRIORITY_LABELS[value]}
    </button>
  );
}
