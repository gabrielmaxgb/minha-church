"use client";

import Link from "next/link";
import { ChevronDown, Church, LogOut, User } from "lucide-react";
import { useState } from "react";

import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { OnboardingHeaderButton } from "@/components/dashboard/onboarding/onboarding-header-button";
import { TrialStatusHeaderChip } from "@/components/dashboard/trial-status-header-chip";
import { formatUserAccessLabel } from "@/lib/user-display";
import { getUserLoginLabel } from "@/lib/user-profile";
import { formatMemberCountLabel } from "@/lib/pricing";
import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface DashboardTopbarProps {
  title: string;
  subtitle?: string;
  /** @deprecated Mobile usa bottom nav "Mais"; mantido por compat. */
  onOpenSidebar?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardTopbar({
  title,
  subtitle,
}: DashboardTopbarProps) {
  const {
    user,
    church,
    churches,
    permissions,
    logout,
    switchChurch,
    isSwitchingChurch,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [churchMenuOpen, setChurchMenuOpen] = useState(false);
  const canAccessChurchSettings =
    Boolean(user?.isOwner) || Boolean(permissions?.settings.access);

  const churchLabel =
    church?.memberCount != null
      ? `${church.name} · ${formatMemberCountLabel(church.memberCount)}`
      : church?.name;

  const canSwitchChurch = churches.length > 1;

  return (
    <header
      className="z-20 shrink-0 border-b border-border bg-background"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-9 shrink-0 items-center gap-1.5 sm:gap-2">
          <TrialStatusHeaderChip />
          <NotificationsBell />
          <OnboardingHeaderButton />

          {church && (
            <div className="relative h-9 min-w-0">
              <button
                type="button"
                onClick={() => setChurchMenuOpen((prev) => !prev)}
                disabled={isSwitchingChurch || !canSwitchChurch}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card text-left transition-colors duration-150",
                  "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
                  "max-w-38 px-2 sm:max-w-60 sm:px-2.5 lg:max-w-68",
                  !canSwitchChurch && "pointer-events-none",
                )}
                aria-expanded={churchMenuOpen}
                aria-label={
                  canSwitchChurch
                    ? `Igreja ativa: ${church.name}. Trocar igreja`
                    : `Igreja ativa: ${church.name}`
                }
              >
                <Church className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {churchLabel}
                </span>
                {canSwitchChurch && (
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {churchMenuOpen && canSwitchChurch && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="Fechar seleção de igreja"
                    onClick={() => setChurchMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1.5 w-[min(calc(100vw-2rem),16rem)] rounded-lg border border-border bg-popover p-1 shadow-popover">
                    <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Trocar igreja
                    </p>
                    {churches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isSwitchingChurch || item.id === church.id}
                        onClick={() => {
                          setChurchMenuOpen(false);
                          void switchChurch(item.id);
                        }}
                        className={cn(
                          "flex min-h-11 w-full rounded-md px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
                          item.id === church.id && "bg-muted font-medium",
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {user && (
            <div className="relative h-9">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-2 transition-colors duration-150 hover:bg-muted sm:px-2.5"
                aria-expanded={menuOpen}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold leading-none text-foreground">
                  {getInitials(user.name)}
                </span>
                <span className="hidden text-sm font-medium leading-none sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground sm:inline" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="Fechar menu do usuário"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1.5 w-56 rounded-lg border border-border bg-popover p-1 shadow-popover">
                    <div className="min-w-0 border-b border-border px-2.5 py-2">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {getUserLoginLabel(user)}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {formatUserAccessLabel(user)}
                      </p>
                    </div>
                    {canAccessChurchSettings ? (
                      <Link
                        href={AUTH_ROUTES.settingsChurch}
                        className="flex min-h-11 items-center gap-2 rounded-md px-2.5 py-2.5 text-sm transition-colors hover:bg-muted"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Church className="size-4" />
                        Configurações da igreja
                      </Link>
                    ) : null}
                    <Link
                      href={AUTH_ROUTES.settingsUser}
                      className="flex min-h-11 items-center gap-2 rounded-md px-2.5 py-2.5 text-sm transition-colors hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="size-4" />
                      Configurações de perfil
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void logout();
                      }}
                      className="flex min-h-11 w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
