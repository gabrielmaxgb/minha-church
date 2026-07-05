export interface UserRoleSummary {
  id: string;
  name: string;
  color?: string;
}

export interface UserPermissions {
  dashboard: { access: boolean };
  members: { access: boolean; manage: boolean };
  ministries: { access: boolean; manage: boolean; rosterMinistryIds: string[] };
  activities: {
    access: boolean;
    createChurchWide: boolean;
    ministryIds: string[];
  };
  schedules: { access: boolean };
  finances: { access: boolean };
  communication: { access: boolean };
  reports: { access: boolean };
  settings: { access: boolean };
  roles: { manage: boolean };
  memberships: { manage: boolean };
}

export interface Church {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string | null;
  isOwner: boolean;
  roles: UserRoleSummary[];
  avatarUrl?: string;
  mustChangePassword?: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  churchId: string;
  exp: number;
  iat: number;
}

export interface AuthTokens {
  /** Ausente quando tokens estão em cookies httpOnly */
  accessToken?: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  church: Church;
  churches: Church[];
  permissions: UserPermissions;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  user: User;
  church: Church;
  churches: Church[];
  permissions: UserPermissions;
  tokens: AuthTokens;
}

export type ChurchPermissionKey =
  | "dashboard_access"
  | "members_access"
  | "ministries_access"
  | "activities_access"
  | "schedules_access"
  | "members_manage"
  | "ministries_manage"
  | "events_create_church_wide"
  | "finances_access"
  | "communication_access"
  | "reports_access"
  | "settings_access"
  | "roles_manage"
  | "memberships_manage";
