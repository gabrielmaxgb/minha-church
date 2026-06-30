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

export async function getSessionRequest(): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/me");
}

export async function switchChurchRequest(
  churchId: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/switch-church", {
    method: "POST",
    body: JSON.stringify({ churchId }),
  });
}

export async function logoutRequest(): Promise<void> {
  await apiClient<void>("/auth/logout", { method: "POST" });
}

export { refreshSessionRequest, refreshSessionDeduped } from "@/lib/api/session-refresh";
