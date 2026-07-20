import { clearAuthSession } from "@/lib/auth/cookies";

function getLogoutUrl(): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  // Dev costuma usar `/api/v1` via rewrite do Next — nunca pular o logout.
  return `${baseURL || "/api/v1"}/auth/logout`;
}

/** Encerra a sessão no servidor (limpa cookies httpOnly) e no cliente. */
export async function terminateSession(): Promise<void> {
  try {
    await fetch(getLogoutUrl(), {
      method: "POST",
      credentials: "include",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Mesmo se a API falhar, limpa o que for possível no cliente.
  }

  clearAuthSession();
}
