export type MemberStatus = "visitor" | "active" | "inactive";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

export interface MemberMinistryRoleSummary {
  id: string;
  name: string;
  canManageEvents: boolean;
}

export interface MemberMinistryLink {
  id: string;
  ministryId: string;
  ministryName: string;
  instruments: string[];
  roles: MemberMinistryRoleSummary[];
  canManageEvents: boolean;
  startedAt: string | null;
  endedAt: string | null;
}

export interface MemberFamilySummary {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  churchId: string;
  familyId: string | null;
  family: MemberFamilySummary | null;
  name: string;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  birthDate: string | null;
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  weddingAnniversary: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: MemberStatus;
  visitorSince: string | null;
  baptismDate: string | null;
  membershipDate: string | null;
  userId: string | null;
  ministries: MemberMinistryLink[];
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  churchId: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MemberRelationType = "spouse" | "parent";

export interface MemberRelation {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  type: MemberRelationType;
  createdAt: string;
}

export interface FamilyGraphMember {
  id: string;
  name: string;
  status: MemberStatus;
}

export interface FamilyGraph {
  family: {
    id: string;
    name: string;
  };
  members: FamilyGraphMember[];
  relations: MemberRelation[];
}

export const MEMBER_RELATION_LABELS: Record<MemberRelationType, string> = {
  spouse: "Cônjuges",
  parent: "Pai/mãe → filho(a)",
};

export interface MembersListResponse {
  data: Member[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ListMembersParams {
  status?: MemberStatus;
  search?: string;
  /** Use "none" for members without a family */
  familyId?: string;
  page?: number;
  limit?: number;
}

export type MemberAccountCredentials =
  | {
      kind: "created";
      login: string;
      temporaryPassword: string;
      mustChangePassword: true;
    }
  | {
      kind: "linked";
      login: string;
      linkedExistingAccount: true;
    };

export interface CreateMemberResponse extends Member {
  account?: MemberAccountCredentials;
}

export interface ReceiveMemberResponse extends Member {
  account?: MemberAccountCredentials;
}

export interface UpdateMemberResponse extends Member {
  account?: MemberAccountCredentials;
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  visitor: "Visitante",
  active: "Ativo",
  inactive: "Inativo",
};
