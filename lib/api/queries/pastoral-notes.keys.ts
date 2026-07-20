import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreatePastoralNotePayload,
  PastoralCareSummary,
  PastoralNote,
  PastoralNoteList,
  UpdatePastoralNotePayload,
} from "@/types/pastoral-notes";

export async function fetchPastoralCareSummary(
  churchId: string,
): Promise<PastoralCareSummary> {
  return apiClient<PastoralCareSummary>(
    buildTenantPath(churchId, "/pastoral-notes/summary"),
    { churchId },
  );
}

export async function fetchMemberPastoralNotes(
  churchId: string,
  memberId: string,
  params?: { page?: number; limit?: number },
): Promise<PastoralNoteList> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiClient<PastoralNoteList>(
    buildTenantPath(
      churchId,
      `/pastoral-notes/members/${memberId}${qs ? `?${qs}` : ""}`,
    ),
    { churchId },
  );
}

export async function createPastoralNote(
  churchId: string,
  payload: CreatePastoralNotePayload,
): Promise<PastoralNote> {
  return apiClient<PastoralNote>(
    buildTenantPath(churchId, "/pastoral-notes"),
    {
      method: "POST",
      body: JSON.stringify(payload),
      churchId,
    },
  );
}

export async function updatePastoralNote(
  churchId: string,
  noteId: string,
  payload: UpdatePastoralNotePayload,
): Promise<PastoralNote> {
  return apiClient<PastoralNote>(
    buildTenantPath(churchId, `/pastoral-notes/${noteId}`),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      churchId,
    },
  );
}

export async function deletePastoralNote(
  churchId: string,
  noteId: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    buildTenantPath(churchId, `/pastoral-notes/${noteId}`),
    {
      method: "DELETE",
      churchId,
    },
  );
}

export const pastoralNotesKeys = createQueryKeys("pastoral-notes", {
  summary: (churchId: string) => ({
    queryKey: [churchId, "summary"],
    queryFn: () => fetchPastoralCareSummary(churchId),
  }),
  memberNotes: (
    churchId: string,
    memberId: string,
    params: { page?: number; limit?: number } = {},
  ) => ({
    queryKey: [churchId, "member", memberId, params],
    queryFn: () => fetchMemberPastoralNotes(churchId, memberId, params),
  }),
});
