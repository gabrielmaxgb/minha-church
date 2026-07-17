"use client";

import { use } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { GivingThanksPanel } from "@/components/giving/giving-thanks-panel";
import { AUTH_ROUTES, settingsSectionPath } from "@/constants/routes";

import "@/app/doar/giving.css";

type PageProps = {
  searchParams: Promise<{ donationId?: string; rt?: string }>;
};

export default function TithesOfferingsThanksPage({ searchParams }: PageProps) {
  const { donationId, rt } = use(searchParams);

  return (
    <DashboardPage title="Contribuição" className="max-w-lg">
      <div className="giving-root">
        <GivingThanksPanel
          donationId={donationId}
          receiptToken={rt}
          backHref={AUTH_ROUTES.tithesOfferings}
          backLabel="Voltar aos fundos"
          retryHref={AUTH_ROUTES.tithesOfferings}
          retryLabel="Tentar novamente"
          primaryHref={settingsSectionPath("my-contributions")}
          primaryLabel="Ver minhas contribuições"
        />
      </div>
    </DashboardPage>
  );
}
