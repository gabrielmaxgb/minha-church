"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { X } from "lucide-react";

import { SidebarChurchBrand } from "@/components/dashboard/sidebar-church-brand";
import {
  dashboardNavItems,
  dashboardSecondaryNavItems,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMySchedules, useAnnouncementsUnreadCount } from "@/lib/api/queries";
import { announcementsUnreadCount } from "@/lib/communication/announcement-notifications";
import { canAccessNavItem, canAccessSchedules } from "@/lib/permissions";
import {
  domainNavActive,
  type ProductDomain,
} from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  domain,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  domain: ProductDomain;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
        isActive
          ? cn("font-medium", domainNavActive[domain])
          : "font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", isActive ? "opacity-90" : "opacity-65")}
        aria-hidden
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums",
            isActive
              ? "bg-foreground/90 text-background"
              : "bg-attention-subtle text-attention-foreground",
          )}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export function DashboardSidebar({
  onNavigate,
  onClose,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { permissions } = useAuth();
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const { data: schedule } = useMySchedules({
    enabled: canAccessSchedulesData,
  });
  const { data: unreadAnnouncements } = useAnnouncementsUnreadCount({
    enabled: hasCommunicationAccess,
  });

  const visibleNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardNavItems;
    }

    return dashboardNavItems.filter((item) =>
      canAccessNavItem(permissions, item),
    );
  }, [permissions]);

  const pendingCount =
    canAccessSchedulesData && schedule
      ? schedule.summary.pendingAvailabilityCount
      : 0;
  const communicationUnreadCount = announcementsUnreadCount(
    unreadAnnouncements,
    hasCommunicationAccess,
  );

  const visibleSecondaryNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardSecondaryNavItems;
    }

    return dashboardSecondaryNavItems.filter((item) =>
      canAccessNavItem(permissions, item),
    );
  }, [permissions]);

  return (
    <aside
      className={cn(
        "flex h-full w-full shrink-0 flex-col border-r border-border/80 bg-surface lg:w-56",
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

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              domain={item.domain}
              isActive={isActive}
              badge={
                item.href === AUTH_ROUTES.mySchedules
                  ? pendingCount
                  : item.href === AUTH_ROUTES.communication
                    ? communicationUnreadCount
                    : undefined
              }
              onNavigate={onNavigate}
            />
          );
        })}

        {visibleSecondaryNavItems.length > 0 && (
          <>
            <div className="my-3 border-t border-border/80" />
            {visibleSecondaryNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  domain={item.domain}
                  isActive={isActive}
                  onNavigate={onNavigate}
                />
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
