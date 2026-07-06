import { clearAuthSession, getStoredChurchId } from "@/lib/auth/cookies";

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

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
    };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    if (typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // Ignora corpo inválido.
  }

  return `API error: ${response.status}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const tenantId = options.churchId ?? getStoredChurchId();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (tenantId) {
    headers.set("X-Church-Id", tenantId);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(url, fetchOptions);

  const canRefresh =
    response.status === 401 &&
    !options.skipAuth &&
    !endpoint.startsWith("/auth/login") &&
    !endpoint.startsWith("/auth/refresh");

  if (canRefresh) {
    const { tryRefreshSession } = await import("@/lib/api/session-refresh");
    const refreshed = await tryRefreshSession();

    if (refreshed) {
      response = await fetch(url, fetchOptions);
    }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  if (!raw.trim()) {
    return undefined as T;
  }

  return JSON.parse(raw) as T;
}

export function buildTenantPath(churchId: string, path: string): string {
  return `/churches/${churchId}${path}`;
}

export { clearAuthSession };
