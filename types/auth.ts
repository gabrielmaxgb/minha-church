export type UserRole =
  | "owner"
  | "admin"
  | "pastor"
  | "secretary"
  | "treasurer"
  | "leader"
  | "member";

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
  role: UserRole;
  avatarUrl?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  churchId: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  church: Church;
  churches: Church[];
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  church: Church;
  churches: Church[];
  tokens: AuthTokens;
}
