"use client";

import { RequireActiveAdultMember } from "@/components/auth/require-active-adult-member";
import { CareRequestsContent } from "@/components/dashboard/care-requests/care-requests-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function CareRequestsPage() {
  return (
    <DashboardPage
      title="Aconselhamentos e visitas"
      subtitle="Peça apoio pastoral e acompanhe suas solicitações"
      className="max-w-3xl"
    >
      <RequireActiveAdultMember>
        <CareRequestsContent />
      </RequireActiveAdultMember>
    </DashboardPage>
  );
}
