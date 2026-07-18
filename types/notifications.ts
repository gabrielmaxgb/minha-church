export type InboxNotificationType =
  | "registration_open"
  | "schedule_roster_assigned"
  | "account_linked"
  | "pending_access"
  | "giving_donation_refunded"
  | "care_request_received"
  | "care_request_viewed";

export interface InboxNotificationItem {
  id: string;
  type: InboxNotificationType;
  title: string;
  body: string | null;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  payload: unknown;
  createdAt: string;
  expiresAt: string | null;
  read: boolean;
}

export interface InboxNotificationResponse {
  items: InboxNotificationItem[];
  unreadCount: number;
}
