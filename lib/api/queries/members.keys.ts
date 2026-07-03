import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  CreateMemberPayload,
  UpdateMemberPayload,
} from "@/lib/members/form";
import type {
  CreateMemberResponse,
  ListMembersParams,
  Member,
  MembersListResponse,
} from "@/types/members";

async function fetchMembers(
  churchId: string,
  params: ListMembersParams = {},
): Promise<MembersListResponse> {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const path = buildTenantPath(churchId, `/members${query ? `?${query}` : ""}`);

  return apiClient<MembersListResponse>(path, { churchId });
}

async function fetchMember(
  churchId: string,
  memberId: string,
): Promise<Member> {
  return apiClient<Member>(buildTenantPath(churchId, `/members/${memberId}`), {
    churchId,
  });
}

async function createMember(
  churchId: string,
  payload: CreateMemberPayload,
): Promise<CreateMemberResponse> {
  return apiClient<CreateMemberResponse>(buildTenantPath(churchId, "/members"), {
    churchId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateMember(
  churchId: string,
  memberId: string,
  payload: UpdateMemberPayload,
): Promise<Member> {
  return apiClient<Member>(buildTenantPath(churchId, `/members/${memberId}`), {
    churchId,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

async function deleteMember(
  churchId: string,
  memberId: string,
): Promise<void> {
  await apiClient<void>(buildTenantPath(churchId, `/members/${memberId}`), {
    churchId,
    method: "DELETE",
  });
}

async function receiveMember(
  churchId: string,
  memberId: string,
): Promise<Member> {
  return apiClient<Member>(
    buildTenantPath(churchId, `/members/${memberId}/receive`),
    { churchId, method: "POST" },
  );
}

export interface AssignMemberMinistryPayload {
  ministryId: string;
  ministryRoleIds?: string[];
  startedAt?: string;
}

async function assignMemberMinistry(
  churchId: string,
  memberId: string,
  payload: AssignMemberMinistryPayload,
): Promise<Member> {
  return apiClient<Member>(
    buildTenantPath(churchId, `/members/${memberId}/ministries`),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function removeMemberMinistry(
  churchId: string,
  memberId: string,
  ministryId: string,
): Promise<Member> {
  return apiClient<Member>(
    buildTenantPath(churchId, `/members/${memberId}/ministries/${ministryId}`),
    { churchId, method: "DELETE" },
  );
}

export const membersKeys = createQueryKeys("members", {
  list: (churchId: string, params: ListMembersParams = {}) => ({
    queryKey: [churchId, params],
    queryFn: () => fetchMembers(churchId, params),
  }),
  detail: (churchId: string, memberId: string) => ({
    queryKey: [churchId, memberId],
    queryFn: () => fetchMember(churchId, memberId),
  }),
});

export {
  assignMemberMinistry,
  createMember,
  deleteMember,
  fetchMember,
  fetchMembers,
  receiveMember,
  removeMemberMinistry,
  updateMember,
};

export type { CreateMemberPayload, UpdateMemberPayload };
