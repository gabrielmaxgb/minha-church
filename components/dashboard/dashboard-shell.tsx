"use client";

import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { useRequireAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  const { isLoading, isAuthenticated, church } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  if (!isAuthenticated || !church) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden h-screen shrink-0 lg:block">
        <DashboardSidebar className="h-full" />
      </div>

      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 h-full w-64 shadow-2xl lg:hidden">
            <DashboardSidebar
              onNavigate={() => setSidebarOpen(false)}
              className="h-full bg-background"
            />
          </div>
        </>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar
          title={title}
          subtitle={subtitle ?? church?.name}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface DashboardPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPage({
  title,
  subtitle,
  children,
  className,
}: DashboardPageProps) {
  return (
    <DashboardShell title={title} subtitle={subtitle}>
      <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
    </DashboardShell>
  );
}
