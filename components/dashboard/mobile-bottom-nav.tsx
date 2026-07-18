"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import {
  dashboardNavItems,
  type DashboardNavItem,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useAnnouncementsUnreadCount,
  useCareInboxPendingCount,
  useMyMember,
  useMySchedules,
} from "@/lib/api/queries";
import { announcementsUnreadCount } from "@/lib/communication/announcement-notifications";
import { isActiveAdultMember } from "@/lib/care-requests/eligibility";
import { isActiveMember } from "@/lib/members/active-member-eligibility";
import { canAccessNavItem, canAccessSchedules } from "@/lib/permissions";
import { domainText, type ProductDomain } from "@/lib/ui/domain-theme";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

/** Destinos prioritários no polegar — frequência de uso mobile. */
const MOBILE_PRIMARY_HREFS: string[] = [
  AUTH_ROUTES.dashboard,
  AUTH_ROUTES.mySchedules,
  AUTH_ROUTES.activities,
  AUTH_ROUTES.members,
  AUTH_ROUTES.communication,
  AUTH_ROUTES.finances,
  AUTH_ROUTES.tithesOfferings,
  AUTH_ROUTES.ministries,
  AUTH_ROUTES.careRequests,
  AUTH_ROUTES.prayerRequests,
  AUTH_ROUTES.reports,
];

const MOBILE_LABELS: Record<string, string> = {
  [AUTH_ROUTES.dashboard]: "Início",
  [AUTH_ROUTES.mySchedules]: "Escala",
  [AUTH_ROUTES.activities]: "Eventos",
  [AUTH_ROUTES.members]: "Membros",
  [AUTH_ROUTES.communication]: "Avisos",
  [AUTH_ROUTES.finances]: "Finanças",
  [AUTH_ROUTES.tithesOfferings]: "Ofertas",
  [AUTH_ROUTES.ministries]: "Ministérios",
  [AUTH_ROUTES.careRequests]: "Cuidado",
  [AUTH_ROUTES.prayerRequests]: "Oração",
  [AUTH_ROUTES.reports]: "Relatórios",
};

const MAX_PRIMARY_SLOTS = 4;

function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavCountBadge({ value }: { value: number }) {
  if (value <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-semibold tabular-nums leading-none",
        pendingNotificationStyles.countBadge,
      )}
    >
      {value > 9 ? "9+" : value}
    </span>
  );
}

interface MobileBottomNavProps {
  onOpenMore: () => void;
  moreOpen?: boolean;
}

export function MobileBottomNav({ onOpenMore, moreOpen }: MobileBottomNavProps) {
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

  const visibleItems = useMemo(() => {
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

  const primaryItems = useMemo(() => {
    const byHref = new Map(visibleItems.map((item) => [item.href, item]));
    const picked: DashboardNavItem[] = [];

    for (const href of MOBILE_PRIMARY_HREFS) {
      if (picked.length >= MAX_PRIMARY_SLOTS) break;
      const item = byHref.get(href);
      if (item) picked.push(item);
    }

    return picked;
  }, [visibleItems]);

  const badges: Record<string, number> = {
    [AUTH_ROUTES.mySchedules]:
      canAccessSchedulesData && schedule
        ? schedule.summary.pendingAvailabilityCount
        : 0,
    [AUTH_ROUTES.communication]: announcementsUnreadCount(
      unreadAnnouncements,
      hasCommunicationAccess,
    ),
    [AUTH_ROUTES.careRequests]: canReceiveCare
      ? (carePending?.count ?? 0)
      : 0,
  };

  const primaryActive = primaryItems.some((item) =>
    pathMatches(pathname, item.href),
  );
  const moreActive = moreOpen || (!primaryActive && pathname.startsWith("/app"));

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 backdrop-blur-md lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="mx-auto flex h-14 max-w-lg items-stretch justify-between px-1">
        {primaryItems.map((item) => {
          const Icon = item.icon as LucideIcon;
          const active = pathMatches(pathname, item.href);
          const label = MOBILE_LABELS[item.href] ?? item.shortLabel ?? item.label;
          const badge = badges[item.href] ?? 0;

          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
                  active
                    ? domainText[item.domain as ProductDomain]
                    : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative inline-flex">
                  <Icon
                    className={cn(
                      "size-5",
                      active ? "opacity-100" : "opacity-70",
                    )}
                    aria-hidden
                  />
                  <NavCountBadge value={badge} />
                </span>
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}

        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMore}
            className={cn(
              "relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
              moreActive ? "text-foreground" : "text-muted-foreground",
            )}
            aria-label="Mais opções do menu"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal
              className={cn(
                "size-5",
                moreActive ? "opacity-100" : "opacity-70",
              )}
              aria-hidden
            />
            <span>Mais</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
