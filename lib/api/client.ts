import {
  clearAuthSession,
  getAccessToken,
  getStoredChurchId,
} from "@/lib/auth/cookies";

export interface ApiRequestOptions extends RequestInit {
  churchId?: string | null;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const token = getAccessToken();
  const tenantId = options.churchId ?? getStoredChurchId();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (tenantId) {
    headers.set("X-Church-Id", tenantId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError(`API error: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function buildTenantPath(churchId: string, path: string): string {
  return `/churches/${churchId}${path}`;
}
