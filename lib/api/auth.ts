import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginCredentials,
  UpdateProfilePayload,
} from "@/types/auth";
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

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProfileRequest(
  payload: UpdateProfilePayload,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
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

export async function forgotPasswordRequest(identifier: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier }),
    skipAuth: true,
  });
}

export async function validateResetTokenRequest(
  token: string,
): Promise<{ valid: boolean }> {
  return apiClient<{ valid: boolean }>(
    `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
    { skipAuth: true },
  );
}

export async function resetPasswordRequest(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true,
  });
}

export { refreshSessionRequest, refreshSessionDeduped } from "@/lib/api/session-refresh";
