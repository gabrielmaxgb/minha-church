"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { ChevronDown, Settings, X } from "lucide-react";

import { SidebarChurchBrand } from "@/components/dashboard/sidebar-church-brand";
import {
  dashboardNavGroups,
  dashboardNavItems,
  dashboardNavOrder,
  type DashboardNavGroup,
  type DashboardNavItem,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useCareInboxPendingCount,
  useMyMember,
  useMySchedules,
  useAnnouncementsUnreadCount,
} from "@/lib/api/queries";
import { announcementsUnreadCount } from "@/lib/communication/announcement-notifications";
import { isActiveAdultMember } from "@/lib/care-requests/eligibility";
import { isActiveMember } from "@/lib/members/active-member-eligibility";
import { canAccessNavItem, canAccessSchedules } from "@/lib/permissions";
import {
  domainNavActive,
  type ProductDomain,
} from "@/lib/ui/domain-theme";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
}

function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBadge({ value }: { value: number }) {
  if (value <= 0) {
    return null;
  }

  // Cor única de notificação (âmbar sólido), independente de estado ativo —
  // treina o usuário: "âmbar preenchido = há algo pendente aqui".
  return (
    <span
      className={cn(
        "mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1 text-xs tabular-nums",
        pendingNotificationStyles.countBadge,
      )}
    >
      {value > 9 ? "9+" : value}
    </span>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  domain,
  badge,
  onNavigate,
  nested = false,
}: {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  isActive: boolean;
  domain: ProductDomain;
  badge?: number;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-start gap-3 rounded-lg text-sm leading-snug transition-colors duration-150",
        nested ? "px-2.5 py-2" : "px-2.5 py-2.5",
        isActive
          ? cn("font-medium", domainNavActive[domain])
          : "border border-transparent font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            isActive ? "opacity-90" : "opacity-65",
          )}
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 flex-1 text-pretty wrap-break-word">{label}</span>
      <NavBadge value={badge ?? 0} />
    </Link>
  );
}

function NavGroupDropdown({
  group,
  items,
  badges,
  onNavigate,
}: {
  group: DashboardNavGroup;
  items: DashboardNavItem[];
  badges: Record<string, number>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groupActive = items.some((item) => pathMatches(pathname, item.href));
  const [open, setOpen] = useState(groupActive);
  const groupBadge = items.reduce(
    (sum, item) => sum + (badges[item.href] ?? 0),
    0,
  );

  useEffect(() => {
    if (groupActive) {
      setOpen(true);
    }
  }, [groupActive]);

  if (items.length === 0) {
    return null;
  }

  const GroupIcon = group.icon;

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm leading-snug transition-colors duration-150",
          groupActive
            ? cn("font-medium", domainNavActive[group.domain])
            : "border border-transparent font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        aria-expanded={open}
      >
        <GroupIcon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            groupActive ? "opacity-90" : "opacity-65",
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-pretty wrap-break-word">
          {group.label}
        </span>
        <NavBadge value={groupBadge} />
        <ChevronDown
          className={cn(
            "mt-1 size-3.5 shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180",
            groupActive && "opacity-70",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div
            className="ml-2.5 mt-0.5 flex flex-col gap-0.5 border-l border-border/80 py-0.5 pl-2.5"
            inert={open ? undefined : true}
          >
            {items.map((item) => {
              const isActive = pathMatches(pathname, item.href);
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.shortLabel ?? item.label}
                  isActive={isActive}
                  domain={item.domain}
                  badge={badges[item.href]}
                  onNavigate={onNavigate}
                  nested
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, permissions } = useAuth();
  const isSettingsRoute = pathname.startsWith(AUTH_ROUTES.settings);
  const [open, setOpen] = useState(isSettingsRoute);
  const canAccessChurchSettings =
    Boolean(user?.isOwner) || Boolean(permissions?.settings.access);

  useEffect(() => {
    if (isSettingsRoute) {
      setOpen(true);
    }
  }, [isSettingsRoute]);

  const userLabel = user?.name?.trim() || "Usuário";

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm leading-snug transition-colors duration-150",
          isSettingsRoute
            ? cn("font-medium", domainNavActive.settings)
            : "border border-transparent font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        aria-expanded={open}
      >
        <Settings
          className={cn(
            "mt-0.5 size-5 shrink-0",
            isSettingsRoute ? "opacity-90" : "opacity-65",
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-pretty">Configurações</span>
        <ChevronDown
          className={cn(
            "mt-1 size-3.5 shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180",
            isSettingsRoute && "opacity-70",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div
            className="ml-2.5 mt-0.5 flex flex-col gap-0.5 border-l border-border/80 py-0.5 pl-2.5"
            inert={open ? undefined : true}
          >
            {canAccessChurchSettings ? (
              <Link
                href={AUTH_ROUTES.settingsChurch}
                onClick={onNavigate}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm transition-colors",
                  pathname.startsWith(AUTH_ROUTES.settingsChurch)
                    ? cn("font-medium", domainNavActive.settings)
                    : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                Igreja
              </Link>
            ) : null}
            <Link
              href={AUTH_ROUTES.settingsUser}
              onClick={onNavigate}
              className={cn(
                "rounded-lg px-2.5 py-2 text-sm transition-colors",
                pathname.startsWith(AUTH_ROUTES.settingsUser)
                  ? cn("font-medium", domainNavActive.settings)
                  : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span className="block truncate">{userLabel}</span>
              <span className="block text-xs leading-tight opacity-70">
                Usuário
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar({
  onNavigate,
  onClose,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { permissions, user } = useAuth();
  const isOwner = Boolean(user?.isOwner);
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const canReceiveCare =
    isOwner || Boolean(permissions?.counseling?.receive);
  const { data: myMember } = useMyMember();
  const isAdultMember = isOwner || isActiveAdultMember(myMember);
  const isMemberActive = isOwner || isActiveMember(myMember);
  const { data: schedule } = useMySchedules({
    enabled: canAccessSchedulesData,
  });
  const { data: unreadAnnouncements } = useAnnouncementsUnreadCount({
    enabled: hasCommunicationAccess,
  });
  const { data: carePending } = useCareInboxPendingCount({
    enabled: canReceiveCare,
  });

  const visibleNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardNavItems;
    }

    return dashboardNavItems.filter((item) =>
      canAccessNavItem(permissions, item, {
        isActiveAdultMember: isAdultMember,
        isActiveMember: isMemberActive,
        isOwner,
      }),
    );
  }, [permissions, isAdultMember, isMemberActive, isOwner]);

  const itemsByHref = useMemo(() => {
    const map = new Map<string, DashboardNavItem>();
    for (const item of visibleNavItems) {
      map.set(item.href, item);
    }
    return map;
  }, [visibleNavItems]);

  const pendingCount =
    canAccessSchedulesData && schedule
      ? schedule.summary.pendingAvailabilityCount
      : 0;
  const communicationUnreadCount = announcementsUnreadCount(
    unreadAnnouncements,
    hasCommunicationAccess,
  );
  const carePendingCount = canReceiveCare ? (carePending?.count ?? 0) : 0;

  const badges: Record<string, number> = {
    [AUTH_ROUTES.mySchedules]: pendingCount,
    [AUTH_ROUTES.communication]: communicationUnreadCount,
    [AUTH_ROUTES.careRequests]: carePendingCount,
  };

  const groupsById = useMemo(() => {
    const map = new Map<string, DashboardNavGroup>();
    for (const group of dashboardNavGroups) {
      map.set(group.id, group);
    }
    return map;
  }, []);

  const orderedHrefs = useMemo(() => {
    const hrefs = new Set<string>();
    for (const entry of dashboardNavOrder) {
      if (entry.type === "item") {
        hrefs.add(entry.href);
      } else {
        const group = groupsById.get(entry.id);
        for (const href of group?.itemHrefs ?? []) {
          hrefs.add(href);
        }
      }
    }
    return hrefs;
  }, [groupsById]);

  type ResolvedNavEntry =
    | {
        kind: "item";
        key: string;
        item: DashboardNavItem;
        sectionStart?: boolean;
      }
    | {
        kind: "group";
        key: string;
        group: DashboardNavGroup;
        items: DashboardNavItem[];
        sectionStart?: boolean;
      };

  const resolvedEntries = useMemo(() => {
    const entries: ResolvedNavEntry[] = [];

    for (const entry of dashboardNavOrder) {
      if (entry.type === "item") {
        const item = itemsByHref.get(entry.href);
        if (!item) continue;
        entries.push({
          kind: "item",
          key: item.href,
          item,
          sectionStart: entry.sectionStart,
        });
        continue;
      }

      const group = groupsById.get(entry.id);
      if (!group) continue;

      const items = group.itemHrefs
        .map((href) => itemsByHref.get(href))
        .filter((item): item is DashboardNavItem => Boolean(item));

      if (items.length === 0) continue;

      // Grupo com uma só opção visível → link de 1º nível.
      if (items.length === 1) {
        entries.push({
          kind: "item",
          key: items[0].href,
          item: items[0],
          sectionStart: entry.sectionStart,
        });
        continue;
      }

      entries.push({
        kind: "group",
        key: group.id,
        group,
        items,
        sectionStart: entry.sectionStart,
      });
    }

    return entries;
  }, [groupsById, itemsByHref]);

  // Itens visíveis que não estão na ordem canônica (defesa).
  const orphanItems = visibleNavItems.filter(
    (item) => !orderedHrefs.has(item.href),
  );

  return (
    <aside
      className={cn(
        "flex h-full w-full shrink-0 flex-col border-r border-border/80 bg-surface lg:w-60",
        className,
      )}
    >
      <div className="border-b border-border/80 px-3 py-3.5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <SidebarChurchBrand />
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3.5">
        {resolvedEntries.map((entry) => {
          const sectionClass = entry.sectionStart ? "mt-2" : undefined;

          if (entry.kind === "item") {
            return (
              <div key={entry.key} className={sectionClass}>
                <NavLink
                  href={entry.item.href}
                  label={entry.item.shortLabel ?? entry.item.label}
                  icon={entry.item.icon}
                  domain={entry.item.domain}
                  isActive={pathMatches(pathname, entry.item.href)}
                  badge={badges[entry.item.href]}
                  onNavigate={onNavigate}
                />
              </div>
            );
          }

          return (
            <div key={entry.key} className={sectionClass}>
              <NavGroupDropdown
                group={entry.group}
                items={entry.items}
                badges={badges}
                onNavigate={onNavigate}
              />
            </div>
          );
        })}

        {orphanItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.shortLabel ?? item.label}
            icon={item.icon}
            domain={item.domain}
            isActive={pathMatches(pathname, item.href)}
            badge={badges[item.href]}
            onNavigate={onNavigate}
          />
        ))}

        <div className="my-3 border-t border-border/80" />
        <SettingsNavDropdown onNavigate={onNavigate} />
      </nav>
    </aside>
  );
}
