import type { AuthResponse, LoginCredentials } from "@/types/auth";
import { apiClient } from "@/lib/api/client";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function getSessionRequest(
  accessToken: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function logoutRequest(): Promise<void> {
  await apiClient<void>("/auth/logout", { method: "POST" });
}

export async function refreshTokenRequest(
  refreshToken: string,
): Promise<AuthResponse["tokens"]> {
  return apiClient<AuthResponse["tokens"]>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuth: true,
  });
}
