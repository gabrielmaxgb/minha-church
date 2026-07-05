"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  Layers,
  Mail,
  Navigation,
  Settings,
  Shield,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CHURCH_PERMISSION_DESCRIPTIONS,
  CHURCH_PERMISSION_GROUPS,
  CHURCH_PERMISSION_LABELS,
  type ChurchPermissionKey,
} from "@/types/church-roles";

const PERMISSION_ICONS: Record<ChurchPermissionKey, LucideIcon> = {
  dashboard_access: LayoutDashboard,
  members_access: Users,
  ministries_access: Layers,
  activities_access: Calendar,
  schedules_access: CalendarDays,
  finances_access: Wallet,
  communication_access: Mail,
  reports_access: BarChart3,
  settings_access: Settings,
  members_manage: UserCog,
  ministries_manage: Layers,
  events_create_church_wide: CalendarPlus,
  roles_manage: Shield,
  memberships_manage: UserPlus,
};

const GROUP_STYLES = {
  sections: {
    icon: Navigation,
    accent: "text-sky-700 dark:text-sky-300",
    iconBg: "bg-sky-500/10",
    cardBorder: "border-sky-500/15",
    cardActive: "border-sky-500/35 bg-sky-500/6",
    progress: "bg-sky-500",
  },
  actions: {
    icon: Shield,
    accent: "text-amber-800 dark:text-amber-300",
    iconBg: "bg-amber-500/12",
    cardBorder: "border-amber-500/15",
    cardActive: "border-amber-500/35 bg-amber-500/6",
    progress: "bg-amber-500",
  },
} as const;

interface ChurchRolePermissionsEditorProps {
  permissions: ChurchPermissionKey[];
  onToggle: (permission: ChurchPermissionKey) => void;
  onSetGroup: (groupId: "sections" | "actions", enabled: boolean) => void;
}

function PermissionSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Alternar ${label}`}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-foreground" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function PermissionCard({
  permission,
  checked,
  variant,
  onToggle,
}: {
  permission: ChurchPermissionKey;
  checked: boolean;
  variant: "sections" | "actions";
  onToggle: () => void;
}) {
  const Icon = PERMISSION_ICONS[permission];
  const styles = GROUP_STYLES[variant];
  const label = CHURCH_PERMISSION_LABELS[permission];
  const description = CHURCH_PERMISSION_DESCRIPTIONS[permission];

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
        checked
          ? styles.cardActive
          : "border-border/60 bg-card/40",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors",
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            checked ? styles.iconBg : "bg-muted/50 group-hover:bg-muted",
          )}
        >
          <Icon
            className={cn(
              "size-4",
              checked ? styles.accent : "text-muted-foreground",
            )}
            aria-hidden
          />
        </span>

        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-medium leading-tight">{label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </button>

      <PermissionSwitch checked={checked} onChange={onToggle} label={label} />
    </div>
  );
}

function PermissionGroup({
  group,
  permissions,
  onToggle,
  onSetGroup,
}: {
  group: (typeof CHURCH_PERMISSION_GROUPS)[number];
  permissions: ChurchPermissionKey[];
  onToggle: (permission: ChurchPermissionKey) => void;
  onSetGroup: (enabled: boolean) => void;
}) {
  const styles = GROUP_STYLES[group.id];
  const GroupIcon = styles.icon;
  const enabledCount = group.permissions.filter((permission) =>
    permissions.includes(permission),
  ).length;
  const total = group.permissions.length;
  const allEnabled = enabledCount === total;
  const noneEnabled = enabledCount === 0;
  const progress = total > 0 ? (enabledCount / total) * 100 : 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card/30 shadow-soft",
        styles.cardBorder,
      )}
    >
      <header className="border-b border-border/50 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                styles.iconBg,
              )}
            >
              <GroupIcon className={cn("size-4", styles.accent)} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium leading-tight">{group.label}</h4>
                <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {enabledCount}/{total}
                </span>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-background/60 p-0.5">
            <button
              type="button"
              disabled={allEnabled}
              onClick={() => onSetGroup(true)}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Marcar todos
            </button>
            <span className="text-border" aria-hidden>
              |
            </span>
            <button
              type="button"
              disabled={noneEnabled}
              onClick={() => onSetGroup(false)}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpar
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/60"
          role="progressbar"
          aria-valuenow={enabledCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${group.label}: ${enabledCount} de ${total}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              styles.progress,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2 p-3 sm:p-4">
        {group.permissions.map((permission) => (
          <PermissionCard
            key={permission}
            permission={permission}
            checked={permissions.includes(permission)}
            variant={group.id}
            onToggle={() => onToggle(permission)}
          />
        ))}
      </div>
    </section>
  );
}

export function ChurchRolePermissionsEditor({
  permissions,
  onToggle,
  onSetGroup,
}: ChurchRolePermissionsEditorProps) {
  return (
    <div className="space-y-5">
      {CHURCH_PERMISSION_GROUPS.map((group) => (
        <PermissionGroup
          key={group.id}
          group={group}
          permissions={permissions}
          onToggle={onToggle}
          onSetGroup={(enabled) => onSetGroup(group.id, enabled)}
        />
      ))}
    </div>
  );
}

export function ChurchRolePermissionsSummary({
  enabledCount,
  total,
}: {
  enabledCount: number;
  total: number;
}) {
  const progress = total > 0 ? (enabledCount / total) * 100 : 0;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">Permissões ativas</span>
          <span className="font-medium tabular-nums">
            {enabledCount}
            <span className="text-muted-foreground">/{total}</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
