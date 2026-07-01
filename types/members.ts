export type MemberStatus = "visitor" | "active" | "inactive";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

export interface MemberMinistryLink {
  id: string;
  ministryId: string;
  ministryName: string;
  ministryRoleId: string | null;
  ministryRoleName: string | null;
  canManageEvents: boolean;
  startedAt: string | null;
  endedAt: string | null;
}

export interface Member {
  id: string;
  churchId: string;
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
  page?: number;
  limit?: number;
}

export interface MemberAccountCredentials {
  login: string;
  temporaryPassword: string;
  mustChangePassword: true;
}

export interface CreateMemberResponse extends Member {
  account: MemberAccountCredentials;
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  visitor: "Visitante",
  active: "Ativo",
  inactive: "Inativo",
};
