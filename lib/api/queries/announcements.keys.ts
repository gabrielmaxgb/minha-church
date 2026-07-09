import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "@/types/announcements";

async function fetchAnnouncements(churchId: string): Promise<Announcement[]> {
  return apiClient<Announcement[]>(
    buildTenantPath(churchId, "/announcements"),
    { churchId },
  );
}

async function fetchManagedAnnouncements(
  churchId: string,
): Promise<Announcement[]> {
  return apiClient<Announcement[]>(
    buildTenantPath(churchId, "/announcements/manage"),
    { churchId },
  );
}

async function fetchUnreadCount(churchId: string): Promise<number> {
  const result = await apiClient<{ count: number }>(
    buildTenantPath(churchId, "/announcements/unread-count"),
    { churchId },
  );

  return result.count;
}

async function createAnnouncement(
  churchId: string,
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  return apiClient<Announcement>(
    buildTenantPath(churchId, "/announcements"),
    {
      churchId,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function updateAnnouncement(
  churchId: string,
  announcementId: string,
  payload: UpdateAnnouncementPayload,
): Promise<Announcement> {
  return apiClient<Announcement>(
    buildTenantPath(churchId, `/announcements/${announcementId}`),
    {
      churchId,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

async function deleteAnnouncement(
  churchId: string,
  announcementId: string,
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(churchId, `/announcements/${announcementId}`),
    {
      churchId,
      method: "DELETE",
    },
  );
}

async function markAnnouncementRead(
  churchId: string,
  announcementId: string,
): Promise<void> {
  await apiClient<void>(
    buildTenantPath(churchId, `/announcements/${announcementId}/read`),
    {
      churchId,
      method: "POST",
    },
  );
}

async function markAllAnnouncementsRead(churchId: string): Promise<void> {
  await apiClient<void>(buildTenantPath(churchId, "/announcements/read-all"), {
    churchId,
    method: "POST",
  });
}

export const announcementsKeys = createQueryKeys("announcements", {
  feed: (churchId: string) => ({
    queryKey: [churchId, "feed"],
    queryFn: () => fetchAnnouncements(churchId),
  }),
  manage: (churchId: string) => ({
    queryKey: [churchId, "manage"],
    queryFn: () => fetchManagedAnnouncements(churchId),
  }),
  unreadCount: (churchId: string) => ({
    queryKey: [churchId, "unread-count"],
    queryFn: () => fetchUnreadCount(churchId),
  }),
});

export {
  createAnnouncement,
  deleteAnnouncement,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  updateAnnouncement,
};
