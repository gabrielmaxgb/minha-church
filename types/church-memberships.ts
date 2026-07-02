export interface ChurchMembershipRole {
  id: string;
  name: string;
  color?: string;
  isSystem: boolean;
}

export interface ChurchMembership {
  id: string;
  userId: string;
  churchId: string;
  isOwner: boolean;
  roles: ChurchMembershipRole[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  memberId?: string;
  memberName?: string;
}

export interface UpdateMembershipPayload {
  roleIds?: string[];
  isOwner?: boolean;
}

export interface PendingAccessUser {
  userId: string;
  name: string;
  login: string;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  temporaryPassword: string;
  createdAt: string;
}
