import { AUTH_ROUTES } from "@/constants/routes";
import type { MyMinistryNotifications } from "@/types/member-notifications";

export function ministryNotificationsCount(
  notifications: MyMinistryNotifications | undefined,
): number {
  return notifications?.summary.totalCount ?? 0;
}

export function ministryNotificationsSettingsHref(): string {
  return `${AUTH_ROUTES.settings}?section=ministries`;
}

export function ministryNotificationLabel(
  notifications: MyMinistryNotifications,
): string {
  const { needsFunctionsCount, catalogUpdatesCount } = notifications.summary;

  if (needsFunctionsCount > 0 && catalogUpdatesCount > 0) {
    return "Ministérios precisam da sua atenção";
  }

  if (needsFunctionsCount > 0) {
    return needsFunctionsCount === 1
      ? "Informe sua função no ministério"
      : "Informe suas funções nos ministérios";
  }

  return catalogUpdatesCount === 1
    ? "Funções de serviço atualizadas"
    : "Funções de serviço atualizadas em ministérios";
}

export function ministryNotificationDescription(
  notifications: MyMinistryNotifications,
): string {
  const { needsFunctionsCount } = notifications.summary;

  if (needsFunctionsCount > 0) {
    const names = notifications.needsFunctions
      .map((item) => item.ministryName)
      .join(", ");

    return `Escolha pelo menos uma função em ${names}.`;
  }

  const names = notifications.catalogUpdates
    .map((item) => item.ministryName)
    .join(", ");

  return `O líder atualizou as funções em ${names}. Confira quando puder.`;
}
