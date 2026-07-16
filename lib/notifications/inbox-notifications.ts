import type {
  InboxNotificationItem,
  InboxNotificationType,
} from "@/types/notifications";

const TYPE_LABELS: Record<InboxNotificationType, string> = {
  registration_open: "Inscrições",
  schedule_roster_assigned: "Escala",
  account_linked: "Acesso",
  pending_access: "Acesso pendente",
};

export function inboxNotificationTypeLabel(
  type: InboxNotificationType,
): string {
  return TYPE_LABELS[type] ?? "Notificação";
}

export function inboxUnreadCount(
  response: { unreadCount: number } | undefined,
): number {
  return response?.unreadCount ?? 0;
}

export function inboxUnreadItems(
  items: InboxNotificationItem[] | undefined,
): InboxNotificationItem[] {
  return (items ?? []).filter((item) => !item.read);
}
