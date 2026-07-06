import type {
  EventRecurrence,
  EventRecurrenceInput,
} from "@/lib/events/recurrence";
import type {
  EventRosterAssignment,
  EventRosterCandidate,
  EventRosterSlot,
} from "@/types/ministries";

export interface ChurchEvent {
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

export interface ChurchEventDetail extends ChurchEvent {
  seriesOccurrences: ChurchEvent[];
  roster: EventRosterAssignment[];
  rosterCandidates: EventRosterCandidate[];
  /** @deprecated Use usesRoster */
  isRosterMinistry: boolean;
  usesRoster: boolean;
}

export interface CreateChurchEventPayload {
  name: string;
  ministryId?: string;
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

export interface CreateChurchEventResponse extends ChurchEvent {
  occurrencesCreated: number;
}

export type EventMutationScope = "this" | "this_and_following" | "all";

export interface UpdateChurchEventPayload {
  name?: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string;
  endsAt?: string | null;
  usesRoster?: boolean;
  rosterOpen?: boolean;
  rosterRoles?: string[];
  visibleToChurch?: boolean;
  scope?: EventMutationScope;
}
