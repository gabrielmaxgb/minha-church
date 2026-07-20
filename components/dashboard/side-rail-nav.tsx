"use client";

import type { LucideIcon } from "lucide-react";

import type { ProductDomain } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";
import {
  segmentedListClassName,
  segmentedTriggerClassName,
} from "@/components/ui/segmented-control";

export type SideRailTone = ProductDomain | "danger";

export interface SideRailItem<T extends string = string> {
  id: T;
  label: string;
  /** Rótulo curto nas abas mobile. */
  shortLabel?: string;
  hint?: string;
  icon?: LucideIcon;
  badge?: number;
  highlightBadge?: boolean;
  tone?: SideRailTone;
}

export interface SideRailGroup<T extends string = string> {
  id: string;
  label: string;
  items: SideRailItem<T>[];
}

const toneActiveItem: Record<SideRailTone, string> = {
  home: "bg-domain-home-subtle text-domain-home-foreground",
  members: "bg-domain-members-subtle text-domain-members-foreground",
  ministries: "bg-domain-ministries-subtle text-domain-ministries-foreground",
  activities: "bg-domain-activities-subtle text-domain-activities-foreground",
  schedules: "bg-domain-schedules-subtle text-domain-schedules-foreground",
  communication:
    "bg-domain-communication-subtle text-domain-communication-foreground",
  finances: "bg-domain-finances-subtle text-domain-finances-foreground",
  reports: "bg-domain-reports-subtle text-domain-reports-foreground",
  settings: "bg-muted text-foreground",
  danger: "bg-destructive/10 text-destructive",
};

const toneActiveIcon: Record<SideRailTone, string> = {
  home: "bg-background/70 text-domain-home-foreground shadow-xs",
  members: "bg-background/70 text-domain-members-foreground shadow-xs",
  ministries: "bg-background/70 text-domain-ministries-foreground shadow-xs",
  activities: "bg-background/70 text-domain-activities-foreground shadow-xs",
  schedules: "bg-background/70 text-domain-schedules-foreground shadow-xs",
  communication:
    "bg-background/70 text-domain-communication-foreground shadow-xs",
  finances: "bg-background/70 text-domain-finances-foreground shadow-xs",
  reports: "bg-background/70 text-domain-reports-foreground shadow-xs",
  settings: "bg-background/70 text-foreground shadow-xs",
  danger: "bg-background/70 text-destructive shadow-xs",
};

function SideRailBadge({
  count,
  highlight = false,
}: {
  count: number;
  highlight?: boolean;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none",
        highlight
          ? "bg-domain-communication text-white"
          : "bg-muted text-muted-foreground",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SideRailNavItem<T extends string>({
  item,
  active,
  onSelect,
  layout,
  defaultTone,
  barFill = false,
}: {
  item: SideRailItem<T>;
  active: boolean;
  onSelect: (id: T) => void;
  layout: "rail" | "bar";
  defaultTone: SideRailTone;
  barFill?: boolean;
}) {
  const tone = item.tone ?? defaultTone;
  const Icon = item.icon;
  const isDanger = tone === "danger";

  if (layout === "bar") {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => onSelect(item.id)}
        className={cn(
          "relative",
          segmentedTriggerClassName(
            active,
            cn(
              barFill ? "min-h-11 flex-1 px-3 text-sm" : "min-h-11 shrink-0 px-3 text-sm",
              !active &&
                isDanger &&
                "text-destructive/80 hover:bg-transparent hover:text-destructive",
            ),
          ),
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0 opacity-80" aria-hidden /> : null}
        <span className="truncate">{item.shortLabel ?? item.label}</span>
        <SideRailBadge
          count={item.badge ?? 0}
          highlight={item.highlightBadge}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(item.id)}
      className={cn(
        "group flex h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
        active
          ? toneActiveItem[tone]
          : isDanger
            ? "text-destructive/80 hover:bg-destructive/5 hover:text-destructive"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            active
              ? toneActiveIcon[tone]
              : isDanger
                ? "bg-destructive/10 text-destructive/80"
                : "bg-muted/60 text-muted-foreground group-hover:bg-muted",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              active
                ? isDanger
                  ? "text-destructive"
                  : "text-foreground"
                : "text-inherit",
            )}
          >
            {item.label}
          </span>
          <span className="inline-flex h-4 min-w-5 shrink-0 items-center justify-center">
            <SideRailBadge
              count={item.badge ?? 0}
              highlight={item.highlightBadge}
            />
          </span>
        </span>
        {item.hint ? (
          <span
            className={cn(
              "mt-0.5 block truncate text-xs leading-none",
              active && isDanger
                ? "text-destructive/70"
                : "text-muted-foreground",
            )}
          >
            {item.hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function SideRailNav<T extends string>({
  items,
  groups,
  active,
  onChange,
  tone = "communication",
  ariaLabel = "Navegação",
  className,
  mobileEqual = false,
}: {
  items?: SideRailItem<T>[];
  groups?: SideRailGroup<T>[];
  active: T;
  onChange: (id: T) => void;
  tone?: SideRailTone;
  ariaLabel?: string;
  className?: string;
  /** Abas mobile com largura igual (bom para 2–3 itens). */
  mobileEqual?: boolean;
}) {
  const flatItems =
    groups?.flatMap((group) => group.items) ?? items ?? [];

  return (
    <div className={cn("md:contents", className)}>
      {/* Mobile: abas horizontais com scroll */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={segmentedListClassName(
          cn(
            "sticky top-0 z-10 -mx-1 mb-5 w-auto bg-muted/40 backdrop-blur-sm md:hidden",
            !mobileEqual && "overflow-x-auto scrollbar-none",
          ),
        )}
      >
        {flatItems.map((item) => (
          <SideRailNavItem
            key={item.id}
            item={item}
            active={active === item.id}
            onSelect={onChange}
            layout="bar"
            defaultTone={tone}
            barFill={mobileEqual}
          />
        ))}
      </div>

      {/* Desktop: rail lateral */}
      <nav
        role="tablist"
        aria-label={ariaLabel}
        className="sticky top-6 hidden w-56 shrink-0 space-y-4 md:block"
      >
        {groups
          ? groups.map((group) => (
              <div key={group.id} className="space-y-1">
                <p className="px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <SideRailNavItem
                      key={item.id}
                      item={item}
                      active={active === item.id}
                      onSelect={onChange}
                      layout="rail"
                      defaultTone={tone}
                    />
                  ))}
                </div>
              </div>
            ))
          : (
              <div className="space-y-0.5">
                {flatItems.map((item) => (
                  <SideRailNavItem
                    key={item.id}
                    item={item}
                    active={active === item.id}
                    onSelect={onChange}
                    layout="rail"
                    defaultTone={tone}
                  />
                ))}
              </div>
            )}
      </nav>
    </div>
  );
}
