"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Logo } from "@/components/layout/logo";
import {
  dashboardNavItems,
  dashboardSecondaryNavItems,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import { canAccessNav } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { permissions } = useAuth();

  const visibleNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardNavItems;
    }

    return dashboardNavItems.filter(
      (item) => !item.permission || canAccessNav(permissions, item.permission),
    );
  }, [permissions]);

  const visibleSecondaryNavItems = useMemo(() => {
    if (!permissions) {
      return dashboardSecondaryNavItems;
    }

    return dashboardSecondaryNavItems.filter(
      (item) => !item.permission || canAccessNav(permissions, item.permission),
    );
  }, [permissions]);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-background",
        className,
      )}
    >
      <div className="border-b border-border px-5 py-4">
        <Logo href={AUTH_ROUTES.dashboard} size="md" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />

        {visibleSecondaryNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
