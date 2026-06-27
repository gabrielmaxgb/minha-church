"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { roleLabels } from "@/constants/dashboard-nav";
import { APP_ROUTES } from "@/lib/auth/constants";
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
  const { user, church, churches, logout, switchChurch } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [churchMenuOpen, setChurchMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
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

        <div className="flex items-center gap-2 sm:gap-3">
          {church && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setChurchMenuOpen((prev) => !prev)}
                className="inline-flex max-w-[220px] items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                aria-expanded={churchMenuOpen}
              >
                <span className="truncate font-medium">{church.name}</span>
                {churches.length > 1 && (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
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
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-border bg-background p-1 shadow-lg">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Trocar igreja
                    </p>
                    {churches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          void switchChurch(item.id);
                          setChurchMenuOpen(false);
                        }}
                        className={cn(
                          "flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-muted sm:px-3"
                aria-expanded={menuOpen}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {getInitials(user.name)}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="Fechar menu do usuário"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-background p-1 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {roleLabels[user.role]}
                      </p>
                    </div>
                    <Link
                      href={APP_ROUTES.settings}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="size-4" />
                      Configurações
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
