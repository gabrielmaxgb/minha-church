import { AUTH_ROUTES } from "@/constants/routes";

export function announcementsUnreadCount(
  count: number | undefined,
  hasCommunicationAccess: boolean,
): number {
  if (!hasCommunicationAccess) {
    return 0;
  }

  return count ?? 0;
}

export function announcementsNotificationsHref(): string {
  return AUTH_ROUTES.communication;
}

export function announcementsNotificationLabel(count: number): string {
  if (count === 1) {
    return "1 comunicado não lido";
  }

  return `${count} comunicados não lidos`;
}

export function announcementsNotificationDescription(count: number): string {
  if (count === 1) {
    return "Há um aviso novo da liderança aguardando sua leitura.";
  }

  return `Há ${count} avisos novos da liderança aguardando sua leitura.`;
}
