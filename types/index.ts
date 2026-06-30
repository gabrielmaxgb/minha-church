export type {
  AuthResponse,
  AuthSession,
  AuthTokens,
  Church,
  ChurchPermissionKey,
  JwtPayload,
  LoginCredentials,
  User,
  UserRoleSummary,
} from "@/types/auth";

export type {
  ListMembersParams,
  Member,
  MemberStatus,
  MembersListResponse,
  MEMBER_STATUS_LABELS,
} from "@/types/members";

export type { Ministry, MinistryEvent, MinistryRole } from "@/types/ministries";

export type BillingPeriod = "monthly" | "yearly";

export interface PricingTier {
  id: string;
  name: string;
  memberRange: string;
  memberCountForPricePerMember: number;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted?: boolean;
}

export interface Pricing {
  name: string;
  description: string;
  benefits: string[];
  valueAnchor: {
    headline: string;
    example: string;
  };
  cta: string;
  tiers: PricingTier[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface Value {
  title: string;
  description: string;
}
