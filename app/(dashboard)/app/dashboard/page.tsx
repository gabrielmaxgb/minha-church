"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardHomeContent } from "@/components/dashboard/home/dashboard-home-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function DashboardHomePage() {
  return (
    <RequirePermission permission="dashboard">
      <DashboardPage title="Dashboard">
        <DashboardHomeContent />
      </DashboardPage>
    </RequirePermission>
  );
}
