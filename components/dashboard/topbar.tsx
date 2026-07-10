"use client";

import Link from "next/link";
import { ChevronDown, Church, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { OnboardingHeaderButton } from "@/components/dashboard/onboarding/onboarding-header-button";
import { formatUserAccessLabel } from "@/lib/user-display";
import { getUserLoginLabel } from "@/lib/user-profile";
import { formatMemberCountLabel } from "@/lib/pricing";
import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface DashboardTopbarProps {
  title: string;
  subtitle?: string;
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
  onOpenSidebar,
}: DashboardTopbarProps) {
  const {
    user,
    church,
    churches,
    logout,
    switchChurch,
    isSwitchingChurch,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [churchMenuOpen, setChurchMenuOpen] = useState(false);

  const churchLabel =
    church?.memberCount != null
      ? `${church.name} · ${formatMemberCountLabel(church.memberCount)}`
      : church?.name;

  return (
    <header className="z-20 shrink-0 border-b border-border/70 bg-surface-elevated/90 shadow-soft backdrop-blur-md">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
          >
            <Menu className="size-4" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex h-10 items-center gap-1.5 sm:gap-2">
          <NotificationsBell />
          <OnboardingHeaderButton />

          {church && (
            <div className="relative hidden h-10 min-w-0 sm:block">
              <button
                type="button"
                onClick={() => setChurchMenuOpen((prev) => !prev)}
                disabled={isSwitchingChurch}
                className="inline-flex h-10 max-w-[15rem] items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.07] px-2.5 text-left shadow-soft transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.11] hover:shadow-elevated disabled:cursor-not-allowed disabled:opacity-60 lg:max-w-[17rem] lg:px-3"
                aria-expanded={churchMenuOpen}
                aria-label={
                  churches.length > 1
                    ? `Igreja ativa: ${church.name}. Trocar igreja`
                    : `Igreja ativa: ${church.name}`
                }
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Church className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold leading-tight tracking-tight text-foreground">
                  {churchLabel}
                </span>
                {churches.length > 1 && (
                  <ChevronDown className="size-4 shrink-0 text-primary/70" />
                )}
              </button>

              {churchMenuOpen && churches.length > 1 && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="Fechar seleção de igreja"
                    onClick={() => setChurchMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border/80 bg-surface-elevated p-1.5 shadow-elevated">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                          "flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
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
            <div className="relative h-10">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-background/60 px-2 shadow-soft transition-all duration-200 hover:bg-background hover:shadow-elevated sm:px-3"
                aria-expanded={menuOpen}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold leading-none text-foreground">
                  {getInitials(user.name)}
                </span>
                <span className="hidden text-sm font-medium leading-none sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground sm:inline" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="Fechar menu do usuário"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border/80 bg-surface-elevated p-1.5 shadow-elevated">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getUserLoginLabel(user)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatUserAccessLabel(user)}
                      </p>
                    </div>
                    <Link
                      href={AUTH_ROUTES.settings}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
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
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
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
