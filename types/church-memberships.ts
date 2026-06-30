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
