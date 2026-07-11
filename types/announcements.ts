export type AnnouncementPriority = "normal" | "important" | "urgent";

export type AnnouncementAudienceType = "church_wide" | "ministries";

export type AnnouncementStatus = "scheduled" | "published" | "expired";

export interface AnnouncementMinistryTarget {
  id: string;
  name: string;
}

export interface Announcement {
  id: string;
  churchId: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audienceType: AnnouncementAudienceType;
  ministries: AnnouncementMinistryTarget[];
  pinned: boolean;
  status: AnnouncementStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  createdByUserId: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  /** Presente no feed do usuário. */
  isRead?: boolean;
  /** Presente na visão de gestão. */
  readCount?: number;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  priority?: AnnouncementPriority;
  audienceType: AnnouncementAudienceType;
  ministryIds?: string[];
  pinned?: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;
