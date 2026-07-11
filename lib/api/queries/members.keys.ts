import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type { MyMinistryNotifications } from "@/types/member-notifications";
import type {
  CreateMemberPayload,
  UpdateMemberPayload,
} from "@/lib/members/form";
import type {
  CreateMemberResponse,
  Family,
  FamilyGraph,
  ListMembersParams,
  Member,
  MemberRelation,
  MemberRelationType,
  MembersListResponse,
  ReceiveMemberResponse,
  UpdateMemberResponse,
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

  if (params.familyId) {
    searchParams.set("familyId", params.familyId);
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

async function fetchMyMember(churchId: string): Promise<Member> {
  return apiClient<Member>(buildTenantPath(churchId, "/members/me"), {
    churchId,
  });
}

async function fetchMyMinistryNotifications(
  churchId: string,
): Promise<MyMinistryNotifications> {
  return apiClient(
    buildTenantPath(churchId, "/members/me/ministry-notifications"),
    { churchId },
  );
}

async function ackMinistryCatalogNotifications(
  churchId: string,
  ministryIds: string[],
): Promise<MyMinistryNotifications> {
  return apiClient(
    buildTenantPath(churchId, "/members/me/ministry-notifications/ack-catalog"),
    {
      churchId,
      method: "POST",
      body: JSON.stringify({ ministryIds }),
    },
  );
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
): Promise<UpdateMemberResponse> {
  return apiClient<UpdateMemberResponse>(buildTenantPath(churchId, `/members/${memberId}`), {
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
): Promise<ReceiveMemberResponse> {
  return apiClient<ReceiveMemberResponse>(
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

async function fetchFamilies(churchId: string): Promise<Family[]> {
  return apiClient<Family[]>(buildTenantPath(churchId, "/families"), {
    churchId,
  });
}

async function createFamily(
  churchId: string,
  name: string,
): Promise<Family> {
  return apiClient<Family>(buildTenantPath(churchId, "/families"), {
    churchId,
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

async function fetchFamilyGraph(
  churchId: string,
  familyId: string,
): Promise<FamilyGraph> {
  return apiClient<FamilyGraph>(
    buildTenantPath(churchId, `/families/${familyId}/graph`),
    { churchId },
  );
}

async function createMemberRelation(
  churchId: string,
  familyId: string,
  payload: {
    fromMemberId: string;
    toMemberId: string;
    type: MemberRelationType;
  },
): Promise<MemberRelation> {
  return apiClient<MemberRelation>(
    buildTenantPath(churchId, `/families/${familyId}/relations`),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteMemberRelation(
  churchId: string,
  familyId: string,
  relationId: string,
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(churchId, `/families/${familyId}/relations/${relationId}`),
    { churchId, method: "DELETE" },
  );
}

export const membersKeys = createQueryKeys("members", {
  list: (churchId: string, params: ListMembersParams = {}) => ({
    queryKey: [churchId, params],
    queryFn: () => fetchMembers(churchId, params),
  }),
  families: (churchId: string) => ({
    queryKey: [churchId, "families"],
    queryFn: () => fetchFamilies(churchId),
  }),
  familyGraph: (churchId: string, familyId: string) => ({
    queryKey: [churchId, "families", familyId, "graph"],
    queryFn: () => fetchFamilyGraph(churchId, familyId),
  }),
  me: (churchId: string) => ({
    queryKey: [churchId, "me"],
    queryFn: () => fetchMyMember(churchId),
  }),
  ministryNotifications: (churchId: string) => ({
    queryKey: [churchId, "me", "ministry-notifications"],
    queryFn: () => fetchMyMinistryNotifications(churchId),
  }),
  detail: (churchId: string, memberId: string) => ({
    queryKey: [churchId, memberId],
    queryFn: () => fetchMember(churchId, memberId),
  }),
});

export {
  ackMinistryCatalogNotifications,
  assignMemberMinistry,
  createFamily,
  createMember,
  createMemberRelation,
  deleteMember,
  deleteMemberRelation,
  fetchFamilies,
  fetchFamilyGraph,
  fetchMember,
  fetchMembers,
  fetchMyMember,
  fetchMyMinistryNotifications,
  receiveMember,
  removeMemberMinistry,
  updateMember,
};

export type { CreateMemberPayload, UpdateMemberPayload };
