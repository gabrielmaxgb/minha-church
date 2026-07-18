import { formatRosterRole } from "@/lib/ministries/roster";
import type {
  InboxNotificationItem,
  InboxNotificationType,
} from "@/types/notifications";

const TYPE_LABELS: Record<InboxNotificationType, string> = {
  registration_open: "Inscrições",
  schedule_roster_assigned: "Escala",
  account_linked: "Acesso",
  pending_access: "Acesso pendente",
  giving_donation_refunded: "Estorno",
  care_request_received: "Cuidado",
  care_request_viewed: "Cuidado",
};

export function inboxNotificationTypeLabel(
  type: InboxNotificationType,
): string {
  return TYPE_LABELS[type] ?? "Notificação";
}

export function resolveInboxNotificationBody(
  item: InboxNotificationItem,
): string | null {
  if (item.type === "schedule_roster_assigned") {
    const roleKey = extractRoleLabel(item.payload);
    if (roleKey) {
      return `Você está na escala como ${formatRosterRole(roleKey)}.`;
    }
  }

  return item.body;
}

function extractRoleLabel(payload: unknown): string | null {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    typeof (payload as { roleLabel?: unknown }).roleLabel === "string"
  ) {
    return (payload as { roleLabel: string }).roleLabel;
  }

  return null;
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
