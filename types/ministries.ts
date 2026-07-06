import type { EventRecurrence, EventRecurrenceInput } from "@/lib/events/recurrence";
import type {
  EventAvailabilityStatus,
  RosterAvailabilityPeriod,
} from "@/lib/ministries/roster";

export interface RosterAvailabilityWindow {
  active: boolean;
  periodType: RosterAvailabilityPeriod | null;
  periodStart: string | null;
  periodEnd: string | null;
  label: string | null;
  eventsInPeriod: number;
  openEventsInPeriod: number;
  teamPendingCount: number;
}

export interface MinistryRole {
  id: string;
  ministryId: string;
  name: string;
  sortOrder: number;
  canManageEvents: boolean;
  canManageRoster: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  description: string | null;
  hasRoster: boolean;
  isActive: boolean;
  availabilityWindow: RosterAvailabilityWindow | null;
  roles: MinistryRole[];
  createdAt: string;
  updatedAt: string;
}

export interface MinistryEvent {
  id: string;
  churchId: string;
  ministryId: string | null;
  ministryName: string | null;
  isChurchWide: boolean;
  name: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  createdByUserId: string | null;
  recurrenceSeriesId: string | null;
  recurrence: EventRecurrence | null;
  usesRoster: boolean;
  rosterOpen: boolean;
  visibleToChurch: boolean;
  rosterSlots?: EventRosterSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface EventRosterSlot {
  id: string;
  eventId: string;
  label: string;
  sortOrder: number;
  assignedMemberId: string | null;
  assignedMemberName: string | null;
}

export interface MinistryMemberRole {
  id: string;
  name: string;
  canManageEvents: boolean;
}

export interface MinistryMember {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string | null;
  memberPhone: string | null;
  /** Funções na escala cadastradas pelo membro (campo legado `instruments` na API). */
  instruments: string[];
  roles: MinistryMemberRole[];
  canManageEvents: boolean;
  startedAt: string | null;
}

export interface CreateMinistryEventPayload {
  name: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  recurrence?: EventRecurrenceInput;
  usesRoster?: boolean;
  rosterOpen?: boolean;
  rosterRoles?: string[];
  visibleToChurch?: boolean;
}

export interface RosterAvailabilityEvent {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  recurrenceSeriesId: string | null;
  isRecurring: boolean;
  rosterOpen: boolean;
  myStatus: EventAvailabilityStatus | null;
  availableCount: number;
  unavailableCount: number;
  pendingCount: number;
}

export interface RosterSeriesGroup {
  key: string;
  name: string;
  isRecurring: boolean;
  openCount: number;
  myAvailableCount: number;
  myUnavailableCount: number;
  myPendingCount: number;
  occurrences: RosterAvailabilityEvent[];
}

export interface RosterProfile {
  ministryId: string;
  ministryName: string;
  hasRoster: true;
  memberId: string;
  availabilityWindow: RosterAvailabilityWindow;
  series: RosterSeriesGroup[];
  summary: {
    totalOpen: number;
    available: number;
    unavailable: number;
    pending: number;
  };
}

export interface EventRosterAssignment {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  rosterSlotId: string;
  roleLabel: string;
  availabilityStatus: EventAvailabilityStatus | null;
}

export interface EventRosterCandidate {
  memberId: string;
  memberName: string;
  availabilityStatus: EventAvailabilityStatus | null;
}

export interface MyScheduleAssignment {
  eventId: string;
  ministryId: string;
  ministryName: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  roleLabel: string;
}

export interface MyScheduleRosterEntry {
  memberId: string;
  memberName: string;
  roleLabel: string;
}

export interface MyScheduleEvent {
  eventId: string;
  ministryId: string;
  ministryName: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  rosterOpen: boolean;
  myAvailabilityStatus: EventAvailabilityStatus | null;
  myRoleLabel: string | null;
  roster: MyScheduleRosterEntry[];
}

export interface MySchedulePending {
  eventId: string;
  ministryId: string;
  ministryName: string;
  name: string;
  startsAt: string;
  location: string | null;
}

export interface MyMinistrySchedule {
  ministryId: string;
  ministryName: string;
  availabilityWindow: {
    active: boolean;
    periodType: RosterAvailabilityPeriod | null;
    periodStart: string | null;
    periodEnd: string | null;
    label: string | null;
  };
  pendingAvailability: MySchedulePending[];
  upcomingAssignments: MyScheduleAssignment[];
  events: MyScheduleEvent[];
}

export interface MySchedules {
  hasRosterMinistries: boolean;
  summary: {
    pendingAvailabilityCount: number;
    upcomingAssignmentsCount: number;
    nextAssignment: MyScheduleAssignment | null;
  };
  ministries: MyMinistrySchedule[];
}

/** @deprecated Use RosterAvailabilityWindow */
export type WorshipAvailabilityWindow = RosterAvailabilityWindow;

/** @deprecated Use RosterProfile */
export type WorshipProfile = RosterProfile;

/** @deprecated Use MySchedules */
export type MyWorshipSchedule = MySchedules;

/** @deprecated Use MyScheduleAssignment */
export type MyWorshipScheduleAssignment = MyScheduleAssignment;

/** @deprecated Use RosterAvailabilityEvent */
export type WorshipAvailabilityEvent = RosterAvailabilityEvent;

/** @deprecated Use RosterSeriesGroup */
export type WorshipSeriesGroup = RosterSeriesGroup;
