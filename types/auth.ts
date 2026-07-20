export interface UserRoleSummary {
  id: string;
  name: string;
  color?: string;
}

export interface UserPermissions {
  dashboard: { access: boolean };
  members: { access: boolean; manage: boolean };
  ministries: {
    access: boolean;
    manage: boolean;
    rosterMinistryIds: string[];
    teamMinistryIds: string[];
    rolesMinistryIds: string[];
  };
  activities: {
    access: boolean;
    createChurchWide: boolean;
    ministryIds: string[];
  };
  schedules: { access: boolean };
  finances: { access: boolean; manage: boolean };
  communication: { access: boolean; manage: boolean };
  reports: { access: boolean };
  settings: { access: boolean };
  roles: { manage: boolean };
  memberships: { manage: boolean };
  counseling: { receive: boolean };
  pastoralCare: { access: boolean };
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

export type SubscriptionLockReason =
  | "trial_expired"
  | "past_due"
  | "canceled";

export interface Church {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
  subscriptionStatus?: SubscriptionStatus;
  /** ISO date em que o trial termina (null quando não há trial). */
  trialEndsAt?: string | null;
  /** Dias restantes do trial (null fora de trial). */
  trialDaysRemaining?: number | null;
  /** true quando o trial expirou e recursos de gestão estão bloqueados. */
  featuresLocked?: boolean;
  /** Motivo do bloqueio, para copy por status. */
  lockReason?: SubscriptionLockReason | null;
  dpaAcceptedAt?: string | null;
  dpaVersion?: string | null;
  /** Aceite do DPA na versão atual. */
  dpaAccepted?: boolean;
  deletedAt?: string | null;
  purgeAfter?: string | null;
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
  emailVerified?: boolean;
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

export interface RegisterChurchPayload {
  churchName: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterChurchPendingResponse {
  requiresEmailVerification: true;
  message: string;
  email: string;
}

export type RegisterChurchResult =
  | AuthResponse
  | RegisterChurchPendingResponse;

export function isRegisterChurchPending(
  response: RegisterChurchResult,
): response is RegisterChurchPendingResponse {
  return (
    "requiresEmailVerification" in response &&
    response.requiresEmailVerification === true
  );
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  birthDate?: string | null;
  gender?: "male" | "female" | null;
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | null;
  weddingAnniversary?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
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
  | "communication_manage"
  | "reports_access"
  | "settings_access"
  | "roles_manage"
  | "memberships_manage"
  | "counseling_receive"
  | "receivables_manage"
  | "pastoral_care";
