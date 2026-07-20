"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { segmentedTriggerClassName } from "@/components/ui/segmented-control";
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
  const hasAudienceOptions = hasChurchWide || ministries.length > 0;
  const hasAdvancedDefaults =
    filters.priority !== "all" ||
    filters.audience !== "all" ||
    (canManage && filters.status !== "all");

  const [advancedOpen, setAdvancedOpen] = useState(hasAdvancedDefaults);

  function patch(partial: Partial<AnnouncementFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onChange(DEFAULT_ANNOUNCEMENT_FILTERS);
    setAdvancedOpen(false);
  }

  return (
    <section aria-label="Filtros de comunicados" className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Buscar comunicados..."
            className="h-11 rounded-xl border-border/80 bg-card pl-9 pr-9 shadow-xs focus-visible:ring-domain-communication/30"
            aria-label="Buscar comunicados"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => patch({ search: "" })}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-11 gap-1.5 rounded-xl border-border/80 bg-card shadow-xs",
              (advancedOpen || hasAdvancedDefaults) &&
                "border-domain-communication/35 bg-domain-communication-subtle text-domain-communication-foreground",
            )}
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden />
            Filtros
            {activeCount > 0 ? (
              <span className="rounded-full bg-domain-communication px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                {activeCount}
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                "size-3.5 opacity-60 transition-transform",
                advancedOpen && "rotate-180",
              )}
              aria-hidden
            />
          </Button>

          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-11 px-3 text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          ) : null}
        </div>
      </div>

      {/* Linha mental rápida: leitura primeiro */}
      <div
        className="inline-flex max-w-full flex-wrap rounded-xl border border-border/80 bg-muted/30 p-1"
        role="group"
        aria-label="Filtrar por leitura"
      >
        <QuickPill
          active={filters.read === "all"}
          onClick={() => patch({ read: "all" })}
        >
          Todos
        </QuickPill>
        <QuickPill
          active={filters.read === "unread"}
          onClick={() => patch({ read: "unread" })}
        >
          Não lidos
        </QuickPill>
        <QuickPill
          active={filters.read === "read"}
          onClick={() => patch({ read: "read" })}
        >
          Lidos
        </QuickPill>
      </div>

      {advancedOpen ? (
        <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs sm:p-4">
          {canManage ? (
            <FilterGroup label="Status">
              {(
                [
                  "all",
                  "published",
                  "scheduled",
                  "expired",
                ] as AnnouncementStatusFilter[]
              ).map((value) => (
                <QuickPill
                  key={value}
                  active={filters.status === value}
                  onClick={() => patch({ status: value })}
                >
                  {STATUS_LABELS[value]}
                </QuickPill>
              ))}
            </FilterGroup>
          ) : null}

          <FilterGroup label="Prioridade">
            {(
              ["all", "important", "urgent"] as AnnouncementPriorityFilter[]
            ).map((value) => (
              <QuickPill
                key={value}
                active={filters.priority === value}
                onClick={() => patch({ priority: value })}
                tone={
                  value === "urgent"
                    ? "urgent"
                    : value === "important"
                      ? "important"
                      : "default"
                }
              >
                {PRIORITY_LABELS[value]}
              </QuickPill>
            ))}
          </FilterGroup>

          {hasAudienceOptions ? (
            <FilterGroup label="Para quem">
              <QuickPill
                active={filters.audience === "all"}
                onClick={() => patch({ audience: "all" })}
              >
                Todos
              </QuickPill>
              {hasChurchWide ? (
                <QuickPill
                  active={filters.audience === "church_wide"}
                  onClick={() => patch({ audience: "church_wide" })}
                >
                  Igreja inteira
                </QuickPill>
              ) : null}
              {ministries.map((ministry) => (
                <QuickPill
                  key={ministry.id}
                  active={filters.audience === ministry.id}
                  onClick={() => patch({ audience: ministry.id })}
                >
                  {ministry.name}
                </QuickPill>
              ))}
            </FilterGroup>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function QuickPill({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "important" | "urgent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? tone === "urgent"
            ? "bg-destructive/10 text-destructive"
            : tone === "important"
              ? "bg-attention-subtle text-attention-foreground"
              : segmentedTriggerClassName(true, "rounded-lg px-3 py-1.5 text-xs")
          : "text-muted-foreground hover:text-foreground",
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

const PRIORITY_LABELS: Record<AnnouncementPriorityFilter, string> = {
  all: "Todas",
  normal: "Normal",
  important: "Importante",
  urgent: "Urgente",
};
