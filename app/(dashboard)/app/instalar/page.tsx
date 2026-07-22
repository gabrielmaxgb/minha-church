"use client";

import Link from "next/link";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { PwaInstallGuide } from "@/components/pwa/pwa-install-guide";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";

export default function InstalarAppDashboardPage() {
  return (
    <DashboardPage
      title="Instalar app"
      subtitle="Atalho no celular ou no computador"
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
  );
}
