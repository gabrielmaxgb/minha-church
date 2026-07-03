export interface MinistryRole {
  id: string;
  ministryId: string;
  name: string;
  sortOrder: number;
  canManageEvents: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  description: string | null;
  isActive: boolean;
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
  createdAt: string;
  updatedAt: string;
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
}
