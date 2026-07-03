"use client";

import { useParams } from "next/navigation";

import { ActivityDetailContent } from "@/components/dashboard/activities/activity-detail-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { useChurchEvent } from "@/lib/api/queries";

export default function ActivityDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { data: event } = useChurchEvent(eventId);

  return (
    <DashboardPage
      title={event?.name ?? "Atividade"}
      subtitle={
        event?.isChurchWide
          ? "Atividade da igreja"
          : event?.ministryName ?? "Detalhes do evento"
      }
      className="max-w-3xl"
    >
      <ActivityDetailContent eventId={eventId} />
    </DashboardPage>
  );
}
