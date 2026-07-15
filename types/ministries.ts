import type { EventRecurrence, EventRecurrenceInput } from "@/lib/events/recurrence";
import type {
  EventAvailabilityStatus,
  RosterSlotPlanItem,
} from "@/lib/ministries/roster";

export type { RosterSlotPlanItem };

export interface MinistryRole {
  id: string;
  ministryId: string;
  name: string;
  sortOrder: number;
  canManageEvents: boolean;
  canManageRoster: boolean;
  canManageTeam: boolean;
  canManageRoles: boolean;
  singleHolder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MinistryServiceFunction {
  id: string;
  ministryId: string;
  label: string;
  sortOrder: number;
}

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  roles: MinistryRole[];
  serviceFunctions: MinistryServiceFunction[];
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
  highlightNote: string | null;
  availabilityMessage: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  createdByUserId: string | null;
  recurrenceSeriesId: string | null;
  recurrence: EventRecurrence | null;
  usesRoster: boolean;
  rosterOpen: boolean;
  visibleToChurch: boolean;
  registrationOpen: boolean;
  priceCents: number | null;
  rosterSlots?: EventRosterSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface EventRosterSlot {
  id: string;
  eventId: string;
  label: string;
  sortOrder: number;
  requiredCount: number;
  assignedCount: number;
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
  highlightNote?: string;
  availabilityMessage?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  recurrence?: EventRecurrenceInput;
  usesRoster?: boolean;
  rosterOpen?: boolean;
  rosterRoles?: string[];
  rosterSlotPlan?: RosterSlotPlanItem[];
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
  rosterRoles: string[];
  availabilityMessage: string | null;
  myStatus: EventAvailabilityStatus | null;
  myRoleLabels: string[];
  availableCount: number;
  unavailableCount: number;
  pendingCount: number;
}

export interface RosterSeriesGroup {
  key: string;
  name: string;
  isRecurring: boolean;
  rosterRoles: string[];
  myProfileRoleLabels: string[];
  openCount: number;
  myAvailableCount: number;
  myUnavailableCount: number;
  myPendingCount: number;
  occurrences: RosterAvailabilityEvent[];
}

export interface RosterProfile {
  ministryId: string;
  ministryName: string;
  memberId: string;
  /** Funções cadastradas pelo membro neste ministério. */
  instruments: string[];
  needsRosterFunctions: boolean;
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
  roleLabels: string[];
}

export interface MyScheduleAssignment {
  eventId: string;
  ministryId: string | null;
  ministryName: string | null;
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
  ministryId: string | null;
  ministryName: string | null;
  name: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  rosterOpen: boolean;
  rosterRoles: string[];
  availabilityMessage: string | null;
  profileKey: string;
  myProfileRoleLabels: string[];
  myAvailabilityStatus: EventAvailabilityStatus | null;
  myRoleLabels: string[];
  myRoleLabel: string | null;
  roster: MyScheduleRosterEntry[];
}

export interface MySchedulePending {
  eventId: string;
  ministryId: string | null;
  ministryName: string | null;
  name: string;
  startsAt: string;
  location: string | null;
}

export interface MyMinistrySchedule {
  ministryId: string;
  ministryName: string;
  pendingAvailability: MySchedulePending[];
  upcomingAssignments: MyScheduleAssignment[];
  events: MyScheduleEvent[];
  rosterFunctions: string[];
  needsRosterFunctions: boolean;
}

export interface MySchedules {
  hasSchedule: boolean;
  churchWide: MyMinistrySchedule | null;
  summary: {
    pendingAvailabilityCount: number;
    upcomingAssignmentsCount: number;
    missingRosterFunctionsCount: number;
    nextAssignment: MyScheduleAssignment | null;
  };
  ministries: MyMinistrySchedule[];
}

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
