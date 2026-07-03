"use client";

import { DashboardHomeContent } from "@/components/dashboard/home/dashboard-home-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function DashboardHomePage() {
  return (
    <DashboardPage title="Dashboard" className="max-w-7xl">
      <DashboardHomeContent />
    </DashboardPage>
  );
}
