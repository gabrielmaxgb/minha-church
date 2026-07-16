import { apiClient } from "@/lib/api/client";

export async function downloadMembersCsv(churchId: string): Promise<void> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada.");
  }

  const response = await fetch(
    `${baseURL}/churches/${churchId}/members/export`,
    {
      credentials: "include",
      headers: { "X-Church-Id": churchId },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível exportar os membros.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "membros.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadJsonFile(
  data: unknown,
  filename: string,
): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function exportChurchData(churchId: string): Promise<void> {
  const data = await apiClient<unknown>(`/churches/${churchId}/data-export`, {
    churchId,
  });
  await downloadJsonFile(data, "igreja-dados.json");
}

export async function exportMyMemberData(churchId: string): Promise<void> {
  const data = await apiClient<unknown>(
    `/churches/${churchId}/members/me/export`,
    { churchId },
  );
  await downloadJsonFile(data, "meus-dados-membro.json");
}

export async function exportMyAccountData(): Promise<void> {
  const data = await apiClient<unknown>("/auth/me/export");
  await downloadJsonFile(data, "minha-conta.json");
}

export async function acceptDpa(churchId: string): Promise<{
  dpaAcceptedAt: string;
  dpaVersion: string;
}> {
  return apiClient(`/churches/${churchId}/dpa/accept`, {
    method: "POST",
    churchId,
  });
}

export async function requestChurchClosure(
  churchId: string,
  confirmationSlug: string,
): Promise<{ deletedAt: string; purgeAfter: string }> {
  return apiClient(`/churches/${churchId}/closure-request`, {
    method: "POST",
    churchId,
    body: JSON.stringify({ confirmationSlug }),
  });
}

export async function cancelChurchClosure(
  churchId: string,
): Promise<{ cancelled: boolean }> {
  return apiClient(`/churches/${churchId}/closure-cancel`, {
    method: "POST",
    churchId,
  });
}

export async function deleteMyAccount(password: string): Promise<{
  deletedAt: string;
  message: string;
}> {
  return apiClient("/auth/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
