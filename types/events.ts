import type {
  EventRecurrence,
  EventRecurrenceInput,
} from "@/lib/events/recurrence";
import type {
  EventRosterAssignment,
  EventRosterCandidate,
  EventRosterSlot,
  RosterSlotPlanItem,
} from "@/types/ministries";

export interface ChurchEvent {
  id: string;
  churchId: string;
  ministryId: string | null;
  ministryName: string | null;
  ministryIsActive: boolean;
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
  /** Quando true, membros podem se inscrever. */
  registrationOpen: boolean;
  /** Centavos; null = inscrição gratuita (quando registrationOpen). */
  priceCents: number | null;
  rosterSlots?: EventRosterSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface ChurchEventDetail extends ChurchEvent {
  roster: EventRosterAssignment[];
  rosterCandidates: EventRosterCandidate[];
  /** @deprecated Use GET /events/series/:seriesId/occurrences */
  isRosterMinistry: boolean;
  usesRoster: boolean;
  myAvailabilityStatus?: "available" | "unavailable" | null;
  myRoleLabels?: string[];
  needsRosterFunctions?: boolean;
  /** Pode marcar disponibilidade (membro do ministério ou evento da igreja). */
  canRespondToAvailability?: boolean;
  /** Status da inscrição do membro logado (`succeeded` / `pending` / null). */
  myTicketStatus?: "pending" | "succeeded" | "failed" | "canceled" | "refunded" | null;
}

/** Resumo leve de uma ocorrência na série — para navegação lateral */
export interface EventSeriesOccurrence {
  id: string;
  startsAt: string;
  endsAt: string | null;
  rosterOpen: boolean;
  usesRoster: boolean;
}

/** Inscritos na taxa do evento — só para quem gerencia. */
export interface EventTicketRegistration {
  id: string;
  memberId: string | null;
  name: string;
  email: string | null;
  amountCents: number;
  status: "pending" | "succeeded" | "failed" | "canceled" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface EventTicketRegistrationsResponse {
  confirmedCount: number;
  pendingCount: number;
  confirmedAmountCents: number;
  registrations: EventTicketRegistration[];
}

export interface CreateChurchEventPayload {
  name: string;
  ministryId?: string;
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
  registrationOpen?: boolean;
  priceCents?: number | null;
}

export interface CreateChurchEventResponse extends ChurchEvent {
  occurrencesCreated: number;
}

export type EventMutationScope = "this" | "this_and_following" | "all";

export interface UpdateChurchEventPayload {
  name?: string;
  description?: string | null;
  highlightNote?: string | null;
  availabilityMessage?: string | null;
  location?: string | null;
  startsAt?: string;
  endsAt?: string | null;
  usesRoster?: boolean;
  rosterOpen?: boolean;
  rosterRoles?: string[];
  rosterSlotPlan?: RosterSlotPlanItem[];
  visibleToChurch?: boolean;
  registrationOpen?: boolean;
  priceCents?: number | null;
  /** Atualiza a regra; `null` remove a repetição no escopo. */
  recurrence?: EventRecurrenceInput | null;
  scope?: EventMutationScope;
}

export type EventNoteVisibility = "public" | "private";

export interface EventNoteRoleOption {
  id: string;
  name: string;
  color: string | null;
}

export interface EventNote {
  id: string;
  eventId: string;
  body: string;
  visibility: EventNoteVisibility;
  authorUserId: string;
  authorName: string;
  roles: EventNoteRoleOption[];
  canEdit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventNotesList {
  notes: EventNote[];
  canCreate: boolean;
  roleOptions: EventNoteRoleOption[];
}

export interface CreateEventNotePayload {
  body: string;
  visibility: EventNoteVisibility;
  roleIds?: string[];
}

export interface UpdateEventNotePayload {
  body?: string;
  visibility?: EventNoteVisibility;
  roleIds?: string[];
}
