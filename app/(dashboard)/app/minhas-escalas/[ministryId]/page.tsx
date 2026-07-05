"use client";

import { useParams } from "next/navigation";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MyScheduleMinistryContent } from "@/components/dashboard/my-schedule/my-schedule-ministry-content";
import { useMySchedules } from "@/lib/api/queries";

export default function MyScheduleMinistryPage() {
  const params = useParams();
  const ministryId = params.ministryId as string;
  const { data } = useMySchedules();
  const ministry = data?.ministries.find((item) => item.ministryId === ministryId);

  return (
    <RequirePermission permission="schedules">
      <DashboardPage
        title={ministry?.ministryName ?? "Minhas escalas"}
        subtitle="Calendário, disponibilidade e escalas confirmadas"
        className="max-w-5xl"
      >
        <MyScheduleMinistryContent ministryId={ministryId} />
      </DashboardPage>
    </RequirePermission>
  );
}
