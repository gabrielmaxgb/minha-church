import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  ChurchRole,
  CreateChurchRolePayload,
  UpdateChurchRolePayload,
} from "@/types/church-roles";

async function fetchChurchRoles(churchId: string): Promise<ChurchRole[]> {
  return apiClient<ChurchRole[]>(buildTenantPath(churchId, "/roles"), {
    churchId,
  });
}

async function createChurchRole(
  churchId: string,
  payload: CreateChurchRolePayload,
): Promise<ChurchRole> {
  return apiClient<ChurchRole>(buildTenantPath(churchId, "/roles"), {
    churchId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateChurchRole(
  churchId: string,
  roleId: string,
  payload: UpdateChurchRolePayload,
): Promise<ChurchRole> {
  return apiClient<ChurchRole>(
    buildTenantPath(churchId, `/roles/${roleId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteChurchRole(
  churchId: string,
  roleId: string,
): Promise<void> {
  await apiClient<void>(buildTenantPath(churchId, `/roles/${roleId}`), {
    churchId,
    method: "DELETE",
  });
}

export const churchRolesKeys = createQueryKeys("churchRoles", {
  list: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchChurchRoles(churchId),
  }),
});

export {
  createChurchRole,
  deleteChurchRole,
  fetchChurchRoles,
  updateChurchRole,
};
