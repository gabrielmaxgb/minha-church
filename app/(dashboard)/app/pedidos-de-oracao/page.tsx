"use client";

import { RequireActiveMember } from "@/components/auth/require-active-member";
import { PrayerRequestsContent } from "@/components/dashboard/prayer-requests/prayer-requests-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function PrayerRequestsPage() {
  return (
    <DashboardPage
      title="Pedidos de oração"
      subtitle="Compartilhe e una a igreja em intercessão"
      className="max-w-3xl"
    >
      <RequireActiveMember>
        <PrayerRequestsContent />
      </RequireActiveMember>
    </DashboardPage>
  );
}
