"use client";

import {
  TithesOfferingsContent,
  TithesOfferingsGate,
} from "@/components/dashboard/tithes/tithes-offerings-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function TithesOfferingsPage() {
  return (
    <DashboardPage
      title="Dízimos e ofertas"
      subtitle="Contribua com os fundos da igreja, com registro na sua ficha"
      className="max-w-3xl"
    >
      <TithesOfferingsGate>
        <TithesOfferingsContent />
      </TithesOfferingsGate>
    </DashboardPage>
  );
}
