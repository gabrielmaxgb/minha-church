"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MyScheduleContent } from "@/components/dashboard/my-schedule/my-schedule-content";

export default function MySchedulesPage() {
  return (
    <RequirePermission permission="schedules">
      <DashboardPage
        title="Minhas escalas"
        subtitle="Escolha um ministério para ver calendário e escalas"
        className="max-w-5xl"
      >
        <MyScheduleContent />
      </DashboardPage>
    </RequirePermission>
  );
}
