export type PastoralNoteType =
  | "visit"
  | "conversation"
  | "call"
  | "follow_up"
  | "other";

export const PASTORAL_NOTE_TYPE_LABELS: Record<PastoralNoteType, string> = {
  visit: "Visita",
  conversation: "Conversa",
  call: "Ligação",
  follow_up: "Acompanhamento",
  other: "Outro",
};

export interface PastoralNote {
  id: string;
  memberId: string;
  memberName: string;
  memberStatus: string;
  type: PastoralNoteType;
  body: string;
  occurredOn: string;
  followUpOn: string | null;
  authorUserId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PastoralNoteList {
  items: PastoralNote[];
  page: number;
  limit: number;
  total: number;
}

export interface PastoralCareSummaryMember {
  memberId: string;
  memberName: string;
  memberStatus: string;
  lastNoteOn: string | null;
  daysSinceLastNote: number | null;
  openFollowUpOn: string | null;
}

export interface PastoralCareSummary {
  followUpsDue: PastoralCareSummaryMember[];
  withoutRecentContact: PastoralCareSummaryMember[];
  recentNotes: PastoralNote[];
  thresholds: {
    withoutContactDays: number;
  };
}

export interface CreatePastoralNotePayload {
  memberId: string;
  type: PastoralNoteType;
  body: string;
  occurredOn: string;
  followUpOn?: string | null;
}

export interface UpdatePastoralNotePayload {
  type?: PastoralNoteType;
  body?: string;
  occurredOn?: string;
  followUpOn?: string | null;
}
