import type {
  Announcement,
  AnnouncementPriority,
  AnnouncementStatus,
} from "@/types/announcements";

export type AnnouncementReadFilter = "all" | "unread" | "read";

export type AnnouncementPriorityFilter = "all" | AnnouncementPriority;

export type AnnouncementStatusFilter = "all" | AnnouncementStatus;

export type AnnouncementAudienceFilter = "all" | "church_wide" | string;

export interface AnnouncementFiltersState {
  search: string;
  read: AnnouncementReadFilter;
  priority: AnnouncementPriorityFilter;
  audience: AnnouncementAudienceFilter;
  status: AnnouncementStatusFilter;
}

export const DEFAULT_ANNOUNCEMENT_FILTERS: AnnouncementFiltersState = {
  search: "",
  read: "all",
  priority: "all",
  audience: "all",
  status: "all",
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function countActiveAnnouncementFilters(
  filters: AnnouncementFiltersState,
  options?: { canManage?: boolean },
) {
  let count = 0;

  if (filters.search.trim()) {
    count += 1;
  }

  if (filters.read !== "all") {
    count += 1;
  }

  if (filters.priority !== "all") {
    count += 1;
  }

  if (filters.audience !== "all") {
    count += 1;
  }

  if (options?.canManage && filters.status !== "all") {
    count += 1;
  }

  return count;
}

export function extractAnnouncementMinistries(
  announcements: Announcement[],
  allowedMinistryIds?: ReadonlySet<string> | null,
) {
  const ministries = new Map<string, string>();

  for (const announcement of announcements) {
    for (const ministry of announcement.ministries) {
      if (allowedMinistryIds && !allowedMinistryIds.has(ministry.id)) {
        continue;
      }

      ministries.set(ministry.id, ministry.name);
    }
  }

  return [...ministries.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function filterAnnouncements(
  announcements: Announcement[],
  filters: AnnouncementFiltersState,
  options?: {
    canManage?: boolean;
    /** Congela os não lidos ao ativar o filtro até sair dele. */
    unreadSessionIds?: ReadonlySet<string> | null;
  },
) {
  const query = normalizeSearch(filters.search);

  return announcements.filter((announcement) => {
    if (query) {
      const haystack =
        `${announcement.title} ${announcement.body}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (!options?.canManage && filters.read === "unread") {
      if (options?.unreadSessionIds) {
        if (!options.unreadSessionIds.has(announcement.id)) {
          return false;
        }
      } else if (announcement.isRead !== false) {
        return false;
      }
    }

    if (!options?.canManage && filters.read === "read") {
      if (announcement.isRead === false) {
        return false;
      }
    }

    if (filters.priority !== "all" && announcement.priority !== filters.priority) {
      return false;
    }

    if (filters.audience === "church_wide") {
      if (announcement.audienceType !== "church_wide") {
        return false;
      }
    } else if (filters.audience !== "all") {
      const matchesMinistry = announcement.ministries.some(
        (ministry) => ministry.id === filters.audience,
      );
      if (!matchesMinistry) {
        return false;
      }
    }

    if (options?.canManage && filters.status !== "all") {
      if (announcement.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}
