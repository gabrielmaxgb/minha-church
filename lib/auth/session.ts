import { clearAuthSession } from "@/lib/auth/cookies";

function getApiBaseUrl(): string | null {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();
  return baseURL || null;
}

/** Encerra a sessão no servidor (limpa cookies httpOnly) e no cliente. */
export async function terminateSession(): Promise<void> {
  const baseURL = getApiBaseUrl();

  if (baseURL) {
    try {
      await fetch(`${baseURL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Mesmo se a API falhar, limpa o que for possível no cliente.
    }
  }

  clearAuthSession();
}
