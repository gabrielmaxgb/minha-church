import { clearAuthSession, getStoredChurchId } from "@/lib/auth/cookies";

export interface ApiRequestOptions extends RequestInit {
	churchId?: string | null;
	skipAuth?: boolean;
}

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string,
		public email?: string,
		public details?: unknown,
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

async function parseErrorBody(response: Response): Promise<{
	message: string;
	code?: string;
	email?: string;
	details?: unknown;
}> {
	let raw = `API error: ${response.status}`;
	let code: string | undefined;
	let email: string | undefined;
	let details: unknown;

	try {
		const body = (await response.json()) as {
			message?: string | string[];
			code?: string;
			email?: string;
		};

		details = body;

		if (Array.isArray(body.message)) {
			raw = body.message.join(", ");
		} else if (typeof body.message === "string") {
			raw = body.message;
		}

		if (typeof body.code === "string") {
			code = body.code;
		}

		if (typeof body.email === "string") {
			email = body.email;
		}
	} catch {
		// Ignora corpo inválido.
	}

	if (
		response.status === 429 ||
		/throttlerexception/i.test(raw) ||
		/too many requests/i.test(raw)
	) {
		return {
			message:
				"Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.",
			code,
			email,
			details,
		};
	}

	return { message: raw, code, email, details };
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
		!endpoint.startsWith("/auth/register-church") &&
		!endpoint.startsWith("/auth/verify-email") &&
		!endpoint.startsWith("/auth/resend-verification") &&
		!endpoint.startsWith("/auth/refresh");

	if (canRefresh) {
		const { tryRefreshSession } = await import("@/lib/api/session-refresh");
		const refreshed = await tryRefreshSession();

		if (refreshed) {
			response = await fetch(url, fetchOptions);
		}
	}

	if (!response.ok) {
		const error = await parseErrorBody(response);
		throw new ApiError(
			error.message,
			response.status,
			error.code,
			error.email,
			error.details,
		);
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
