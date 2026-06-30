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
  createdAt: string;
  updatedAt: string;
}

export interface CreateChurchEventPayload {
  name: string;
  ministryId?: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
}

export interface UpdateChurchEventPayload {
  name?: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string;
  endsAt?: string | null;
}
