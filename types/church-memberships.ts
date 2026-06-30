import type { UserRole } from "@/types/auth";

export interface ChurchMembershipUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ChurchMembership {
  id: string;
  userId: string;
  churchId: string;
  role: UserRole;
  createdAt: string;
  user: ChurchMembershipUser;
  memberId?: string;
  memberName?: string;
}

export interface UpdateMembershipPayload {
  role: UserRole;
}
