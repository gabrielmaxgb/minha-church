"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CheckoutReturnHandler } from "@/components/billing/checkout-return-handler";
import { ChurchSwitchOverlay } from "@/components/dashboard/church-switch-overlay";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { OnboardingChecklistProvider } from "@/components/dashboard/onboarding/onboarding-checklist-context";
import { TrialStatusBanner } from "@/components/dashboard/trial-status-banner";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardContentMotion } from "@/components/motion/dashboard-motion";
import { AUTH_ROUTES } from "@/constants/routes";
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
  const router = useRouter();
  const pathname = usePathname();
  const {
    isLoading,
    isAuthenticated,
    isSwitchingChurch,
    switchingToChurchName,
    church,
    user,
  } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mustChangePassword =
    Boolean(user?.mustChangePassword) && pathname !== AUTH_ROUTES.changePassword;

  useEffect(() => {
    if (!isLoading && mustChangePassword) {
      router.replace(AUTH_ROUTES.changePassword);
    }
  }, [isLoading, mustChangePassword, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="animate-pulse text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  if (!isAuthenticated || !church || mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  return (
    <OnboardingChecklistProvider>
      <div className="relative flex h-screen overflow-hidden bg-surface">
      {isSwitchingChurch && switchingToChurchName && (
        <ChurchSwitchOverlay churchName={switchingToChurchName} />
      )}

      <div
        className={cn(
          "hidden h-screen shrink-0 lg:block",
          isSwitchingChurch && "pointer-events-none select-none",
        )}
      >
        <DashboardSidebar className="h-full" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 h-full w-full lg:hidden">
          <DashboardSidebar
            onNavigate={() => setSidebarOpen(false)}
            onClose={() => setSidebarOpen(false)}
            className="h-full w-full border-r-0"
          />
        </div>
      )}

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          isSwitchingChurch && "pointer-events-none select-none",
        )}
        aria-busy={isSwitchingChurch}
      >
        <DashboardTopbar
          title={title}
          subtitle={subtitle ?? church?.name}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main
          className={cn(
            "dashboard-canvas min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8",
            isSwitchingChurch && "opacity-60",
          )}
        >
          <EmailVerificationBanner />
          <TrialStatusBanner />
          <DashboardContentMotion>{children}</DashboardContentMotion>
        </main>
      </div>
      </div>

      <Suspense fallback={null}>
        <CheckoutReturnHandler />
      </Suspense>
    </OnboardingChecklistProvider>
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
