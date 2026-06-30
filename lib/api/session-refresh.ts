import type { AuthResponse } from "@/types/auth";

import { ApiError } from "@/lib/api/client";

function getApiBaseUrl(): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!baseURL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL não configurada. Aponte para o backend Nest.",
      0,
    );
  }

  return baseURL;
}

let refreshInFlight: Promise<AuthResponse> | null = null;

export async function refreshSessionRequest(): Promise<AuthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Sessão expirada. Faça login novamente.";

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignora corpo inválido.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<AuthResponse>;
}

/** Evita múltiplos refresh em paralelo (várias APIs falhando com 401 ao mesmo tempo). */
export function refreshSessionDeduped(): Promise<AuthResponse> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSessionRequest().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function tryRefreshSession(): Promise<boolean> {
  try {
    await refreshSessionDeduped();
    return true;
  } catch {
    return false;
  }
}
