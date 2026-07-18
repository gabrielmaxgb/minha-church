"use client";

import Link from "next/link";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MobileOnlyGate } from "@/components/pwa/mobile-only-gate";
import { PwaInstallGuide } from "@/components/pwa/pwa-install-guide";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";

export default function InstalarAppDashboardPage() {
  return (
    <MobileOnlyGate
      desktopHref={AUTH_ROUTES.dashboard}
      fallback={
        <DashboardPage title="Instalar app">
          <p className="text-sm text-muted-foreground">Carregando…</p>
        </DashboardPage>
      }
    >
      <DashboardPage
        title="Instalar app"
        subtitle="Atalho na tela inicial do celular"
      >
        <div className="mx-auto max-w-md">
          <PwaInstallGuide />
          <div className="mt-8">
            <Button asChild variant="outline" className="w-full">
              <Link href={AUTH_ROUTES.dashboard}>Continuar no painel</Link>
            </Button>
          </div>
        </div>
      </DashboardPage>
    </MobileOnlyGate>
  );
}
