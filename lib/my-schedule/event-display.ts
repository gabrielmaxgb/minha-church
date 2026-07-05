import type { MyScheduleEvent } from "@/types/ministries";

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
    return event.myRoleLabel ?? event.name;
  }

  return event.name;
}

import { pendingNotificationStyles } from "@/lib/ui/notification-styles";

export function scheduleEventStyle(kind: ScheduleEventDisplayKind): string {
  switch (kind) {
    case "assigned":
      return "bg-emerald-500/12 text-emerald-900 dark:text-emerald-100";
    case "pending":
      return `${pendingNotificationStyles.schedule.pill}`;
    case "available":
      return "bg-sky-500/12 text-sky-900 dark:text-sky-100";
    case "unavailable":
      return "bg-muted text-muted-foreground";
  }
}

export function scheduleEventBorderStyle(kind: ScheduleEventDisplayKind): string {
  switch (kind) {
    case "assigned":
      return "border-emerald-500/20 bg-emerald-500/5";
    case "pending":
      return "border-attention-border bg-attention-subtle";
    case "available":
      return "border-sky-500/20 bg-sky-500/5";
    case "unavailable":
      return "border-border bg-muted/20";
  }
}

export type ScheduleAvailabilityAction =
  | "available"
  | "unavailable"
  | "clear";
