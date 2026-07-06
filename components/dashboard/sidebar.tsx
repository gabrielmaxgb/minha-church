"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Logo } from "@/components/layout/logo";
import {
  dashboardNavItems,
  dashboardSecondaryNavItems,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMySchedules } from "@/lib/api/queries";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { canAccessNavItem } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        isActive
          ? "text-primary-foreground"
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
      )}
    >
      {isActive && (
        <motion.span
          layoutId={shouldReduceMotion ? undefined : "sidebar-active"}
          className="absolute inset-0 rounded-xl bg-primary shadow-soft"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon className="relative z-10 size-4 shrink-0" aria-hidden />
      <span className="relative z-10 flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "relative z-10 flex size-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
            isActive
              ? "bg-primary-foreground text-primary"
              : pendingNotificationStyles.countBadge,
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
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { permissions } = useAuth();
  const { data: schedule } = useMySchedules();

  const visibleNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardNavItems;
    }

    return dashboardNavItems.filter((item) =>
      canAccessNavItem(permissions, item),
    );
  }, [permissions]);

  const pendingCount =
    permissions?.schedules.access && schedule
      ? schedule.summary.pendingAvailabilityCount
      : 0;

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
        "flex h-full w-64 shrink-0 flex-col border-r border-border/80 bg-surface",
        className,
      )}
    >
      <div className="border-b border-border/60 px-5 py-5">
        <Logo href={AUTH_ROUTES.dashboard} size="md" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
          Menu
        </p>
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              badge={
                item.href === AUTH_ROUTES.mySchedules ? pendingCount : undefined
              }
              onNavigate={onNavigate}
            />
          );
        })}

        <div className="my-4 border-t border-border/60" />

        {visibleSecondaryNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>
    </aside>
  );
}
