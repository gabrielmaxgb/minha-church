"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CheckoutReturnHandler } from "@/components/billing/checkout-return-handler";
import { TierCrossingOwnerHost } from "@/components/billing/tier-crossing-owner-host";
import { ChurchSwitchOverlay } from "@/components/dashboard/church-switch-overlay";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { OnboardingChecklistProvider } from "@/components/dashboard/onboarding/onboarding-checklist-context";
import { RolePreviewBanner } from "@/components/dashboard/role-preview-banner";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SystemBannersHost } from "@/components/dashboard/system-banners-host";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardContentMotion } from "@/components/motion/dashboard-motion";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";
import { AUTH_ROUTES } from "@/constants/routes";
import { useRequireAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** `full` removes the content padding/scroll so a page can own the viewport. */
  variant?: "default" | "full";
}

export function DashboardShell({
  title,
  subtitle,
  children,
  variant = "default",
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
        <p className="animate-pulse text-sm text-muted-foreground">Carregando...</p>
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
      <div className="relative flex h-dvh min-w-0 overflow-hidden overscroll-none bg-background">
      {isSwitchingChurch && switchingToChurchName && (
        <ChurchSwitchOverlay churchName={switchingToChurchName} />
      )}

      <div
        className={cn(
          "hidden h-dvh shrink-0 lg:block",
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
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-none",
          isSwitchingChurch && "pointer-events-none select-none",
        )}
        aria-busy={isSwitchingChurch}
      >
        <DashboardTopbar
          title={title}
          subtitle={subtitle ?? church?.name}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        {variant === "full" ? (
          <main
            className={cn(
              "dashboard-canvas flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden overscroll-y-contain pb-(--mobile-nav-offset) lg:pb-0",
              isSwitchingChurch && "opacity-60",
            )}
          >
            <div className="px-4 pt-4 empty:hidden sm:px-6">
              <SystemBannersHost />
            </div>
            <DashboardContentMotion className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
              {children}
            </DashboardContentMotion>
          </main>
        ) : (
          <main
            className={cn(
              "dashboard-canvas min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-6 pb-[calc(1.5rem+var(--mobile-nav-offset))] sm:px-6 sm:py-8 lg:pb-8",
              isSwitchingChurch && "opacity-60",
            )}
          >
            <SystemBannersHost />
            <DashboardContentMotion className="min-w-0">
              {children}
            </DashboardContentMotion>
          </main>
        )}
      </div>

      <MobileBottomNav
        onOpenMore={() => setSidebarOpen(true)}
        moreOpen={sidebarOpen}
      />
      <PwaInstallPrompt />
      </div>

      <Suspense fallback={null}>
        <CheckoutReturnHandler />
      </Suspense>
      <TierCrossingOwnerHost />
      <RolePreviewBanner />
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
      <div className={cn("mx-auto w-full min-w-0 max-w-6xl", className)}>
        {children}
      </div>
    </DashboardShell>
  );
}

/**
 * Full-bleed page: content fills the viewport below the topbar with no
 * max-width or page scroll — for canvas-style experiences (e.g. family graph).
 */
export function DashboardCanvasPage({
  title,
  subtitle,
  children,
  className,
}: DashboardPageProps) {
  return (
    <DashboardShell title={title} subtitle={subtitle} variant="full">
      <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
        {children}
      </div>
    </DashboardShell>
  );
}
