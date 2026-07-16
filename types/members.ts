export type MemberStatus = "visitor" | "active" | "inactive";

export type Gender = "male" | "female";

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
  /** Contribuições mensais abertas; preenchido no detalhe do membro. */
  activeGivingSubscriptionsCount?: number;
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

export type MemberRelationType =
  | "spouse"
  | "parent"
  | "sibling"
  | "grandparent"
  | "step_parent"
  | "parent_in_law"
  | "uncle";

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
  sibling: "Irmãos(ãs)",
  grandparent: "Avô/avó → neto(a)",
  step_parent: "Padrasto/madrasta → enteado(a)",
  parent_in_law: "Sogro/sogra → genro/nora",
  uncle: "Tio/tia → sobrinho(a)",
};

/** Undirected bonds are stored in canonical order on the backend. */
export const UNDIRECTED_RELATION_TYPES: ReadonlySet<MemberRelationType> =
  new Set(["spouse", "sibling"]);

/** Ascendant edges place `from` above `to` in the auto-layout. */
export const ASCENDANT_RELATION_TYPES: ReadonlySet<MemberRelationType> =
  new Set(["parent", "grandparent", "step_parent", "parent_in_law", "uncle"]);

export function relationChoiceLabel(
  type: MemberRelationType,
  fromName: string,
  toName: string,
): string {
  const a = fromName.trim().split(/\s+/)[0] ?? fromName;
  const b = toName.trim().split(/\s+/)[0] ?? toName;

  switch (type) {
    case "spouse":
      return "São cônjuges";
    case "sibling":
      return "São irmãos(ãs)";
    case "parent":
      return `${a} é pai/mãe de ${b}`;
    case "grandparent":
      return `${a} é avô/avó de ${b}`;
    case "step_parent":
      return `${a} é padrasto/madrasta de ${b}`;
    case "parent_in_law":
      return `${a} é sogro/sogra de ${b}`;
    case "uncle":
      return `${a} é tio/tia de ${b}`;
  }
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
      userId?: string;
    }
  | {
      kind: "linked";
      login: string;
      linkedExistingAccount: true;
      userId?: string;
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
