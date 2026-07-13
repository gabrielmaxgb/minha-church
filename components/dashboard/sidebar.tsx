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
import { dashboardNavItems } from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useCareInboxPendingCount,
  useMyMember,
  useMySchedules,
  useAnnouncementsUnreadCount,
} from "@/lib/api/queries";
import { announcementsUnreadCount } from "@/lib/communication/announcement-notifications";
import { isActiveAdultMember } from "@/lib/care-requests/eligibility";
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
  icon: ComponentType<{ className?: string }>;
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
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
          isSettingsRoute
            ? cn("font-medium", domainNavActive.settings)
            : "font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        aria-expanded={open}
      >
        <Settings
          className={cn(
            "size-4 shrink-0",
            isSettingsRoute ? "opacity-90" : "opacity-65",
          )}
          aria-hidden
        />
        <span className="flex-1 truncate text-left">Configurações</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 opacity-60 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="ml-2 flex flex-col gap-0.5 border-l border-border/80 pl-2">
          {canAccessChurchSettings ? (
            <Link
              href={AUTH_ROUTES.settingsChurch}
              onClick={onNavigate}
              className={cn(
                "rounded-lg px-2.5 py-2 text-sm transition-colors",
                pathname.startsWith(AUTH_ROUTES.settingsChurch)
                  ? cn("font-medium", domainNavActive.settings)
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span className="block truncate">{userLabel}</span>
            <span className="block text-[11px] opacity-70">Usuário</span>
          </Link>
        </div>
      )}
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
        isOwner,
      }),
    );
  }, [permissions, isAdultMember, isOwner]);

  const pendingCount =
    canAccessSchedulesData && schedule
      ? schedule.summary.pendingAvailabilityCount
      : 0;
  const communicationUnreadCount = announcementsUnreadCount(
    unreadAnnouncements,
    hasCommunicationAccess,
  );
  const carePendingCount = canReceiveCare ? (carePending?.count ?? 0) : 0;

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
                    : item.href === AUTH_ROUTES.careRequests
                      ? carePendingCount
                      : undefined
              }
              onNavigate={onNavigate}
            />
          );
        })}

        <>
          <div className="my-3 border-t border-border/80" />
          <SettingsNavDropdown onNavigate={onNavigate} />
        </>
      </nav>
    </aside>
  );
}
