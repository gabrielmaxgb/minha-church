import type { MyScheduleEvent } from "@/types/ministries";
import { formatRosterRole } from "@/lib/ministries/roster";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";

export type ScheduleEventDisplayKind =
  | "assigned"
  | "pending"
  | "available"
  | "unavailable";

export function getScheduleEventDisplayKind(
  event: MyScheduleEvent,
): ScheduleEventDisplayKind {
  if (event.myRoleLabel) {
    return "assigned";
  }

  if (event.rosterOpen && !event.myAvailabilityStatus) {
    return "pending";
  }

  if (event.myAvailabilityStatus === "available") {
    return "available";
  }

  return "unavailable";
}

export function scheduleEventCalendarLabel(event: MyScheduleEvent): string {
  const kind = getScheduleEventDisplayKind(event);

  if (kind === "assigned") {
    return event.myRoleLabel
      ? formatRosterRole(event.myRoleLabel)
      : event.name;
  }

  return event.name;
}

export function scheduleEventStyle(kind: ScheduleEventDisplayKind): string {
  switch (kind) {
    case "assigned":
      return "bg-success-subtle text-success-foreground";
    case "pending":
      return `${pendingNotificationStyles.schedule.pill}`;
    case "available":
      return "bg-muted text-foreground";
    case "unavailable":
      return "bg-muted/60 text-muted-foreground";
  }
}

export function scheduleEventBorderStyle(kind: ScheduleEventDisplayKind): string {
  switch (kind) {
    case "assigned":
      return "border-success/20 bg-success-subtle";
    case "pending":
      return "border-attention-border bg-attention-subtle";
    case "available":
      return "border-border bg-muted/30";
    case "unavailable":
      return "border-border bg-muted/20";
  }
}

export type ScheduleAvailabilityAction =
  | "available"
  | "unavailable"
  | "clear";
