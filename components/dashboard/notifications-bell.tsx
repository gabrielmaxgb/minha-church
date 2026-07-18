"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ClipboardList,
  CreditCard,
  HeartHandshake,
  KeyRound,
  Mail,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";

import { openTierUpgradeApprovalModal } from "@/components/billing/tier-crossing-owner-host";
import { Button } from "@/components/ui/button";
import {
  AUTH_ROUTES,
  settingsSectionPath,
} from "@/constants/routes";
import { markTierCrossingStaffNoticeRead } from "@/lib/api/billing";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import {
  useAckCareViewedMine,
  useMarkNotificationRead,
  useMyMinistryNotifications,
  useMySchedules,
  useNotificationInbox,
  usePasswordResetRequests,
  useAnnouncementsUnreadCount,
  useCareInboxPendingCount,
  useCareViewedMineCount,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import {
  announcementsNotificationDescription,
  announcementsNotificationLabel,
  announcementsNotificationsHref,
  announcementsUnreadCount,
} from "@/lib/communication/announcement-notifications";
import {
  ministryNotificationDescription,
  ministryNotificationLabel,
  ministryNotificationsCount,
  ministryNotificationsSettingsHref,
} from "@/lib/ministries/ministry-notifications";
import {
  firstPendingScheduleHref,
  schedulePendingCount,
} from "@/lib/my-schedule/schedule-notifications";
import {
  inboxNotificationTypeLabel,
  inboxUnreadCount,
  inboxUnreadItems,
  resolveInboxNotificationBody,
} from "@/lib/notifications/inbox-notifications";
import { canManageMembers } from "@/lib/permissions";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth, useTenant } from "@/providers/auth-provider";
import type { InboxNotificationType } from "@/types/notifications";

function inboxTypeIcon(type: InboxNotificationType) {
  switch (type) {
    case "registration_open":
      return Ticket;
    case "schedule_roster_assigned":
      return ClipboardList;
    case "pending_access":
      return Users;
    case "giving_donation_refunded":
      return CreditCard;
    case "account_linked":
    default:
      return UserCheck;
  }
}
function useNotificationCount(): number {
  const { permissions, user } = useAuth();
  const { churchId } = useTenant();
  const canManage = canManageChurchMemberships(permissions);
  const canMembers = permissions ? canManageMembers(permissions) : false;
  const isOwner = Boolean(user?.isOwner);
  const hasSchedulesAccess = Boolean(permissions?.schedules.access);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const canReceiveCare =
    isOwner || Boolean(permissions?.counseling?.receive);

  const { data: passwordResetRequests } = usePasswordResetRequests({
    poll: canManage,
  });
  const { data: schedules } = useMySchedules();
  const { data: ministryNotifications } = useMyMinistryNotifications();
  const { data: unreadAnnouncements } = useAnnouncementsUnreadCount({
    enabled: hasCommunicationAccess,
  });
  const { data: carePending } = useCareInboxPendingCount({
    enabled: canReceiveCare,
  });
  const { data: careViewed } = useCareViewedMineCount({ poll: true });
  const { data: inbox } = useNotificationInbox({ poll: true });
  const { data: pendingTier } = useQuery({
    ...billingKeys.tierCrossingPending(churchId ?? "unknown"),
    enabled: Boolean(churchId) && isOwner,
    refetchInterval: isOwner ? 60_000 : false,
  });
  const { data: staffNotices } = useQuery({
    ...billingKeys.tierCrossingNotices(churchId ?? "unknown"),
    enabled: Boolean(churchId) && canMembers,
    refetchInterval: canMembers ? 60_000 : false,
  });

  const passwordResetCount = canManage ? (passwordResetRequests?.length ?? 0) : 0;
  const pendingScheduleCount = schedulePendingCount(
    schedules,
    hasSchedulesAccess,
  );
  const ministryCount = ministryNotificationsCount(ministryNotifications);
  const announcementCount = announcementsUnreadCount(
    unreadAnnouncements,
    hasCommunicationAccess,
  );
  const carePendingCount = canReceiveCare ? (carePending?.count ?? 0) : 0;
  const careViewedCount = careViewed?.count ?? 0;
  const tierPendingCount = isOwner && pendingTier ? 1 : 0;
  const tierNoticeCount = canMembers ? (staffNotices?.length ?? 0) : 0;
  const inboxCount = inboxUnreadCount(inbox);

  return (
    passwordResetCount +
    pendingScheduleCount +
    ministryCount +
    announcementCount +
    carePendingCount +
    careViewedCount +
    tierPendingCount +
    tierNoticeCount +
    inboxCount
  );
}

function NotificationsPanel({
  open,
  onClose,
  titleId,
  anchorRect,
  sheet,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  anchorRect: DOMRect | null;
  /** Bottom sheet on small screens (PWA / phone). */
  sheet: boolean;
}) {
  const { permissions, user } = useAuth();
  const { churchId } = useTenant();
  const queryClient = useQueryClient();
  const canManage = canManageChurchMemberships(permissions);
  const canMembers = permissions ? canManageMembers(permissions) : false;
  const isOwner = Boolean(user?.isOwner);
  const hasSchedulesAccess = Boolean(permissions?.schedules.access);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const canReceiveCare =
    isOwner || Boolean(permissions?.counseling?.receive);

  const {
    data: passwordResetRequests,
    isLoading: passwordResetLoading,
  } = usePasswordResetRequests({ poll: open && canManage });
  const {
    data: schedules,
    isLoading: schedulesLoading,
  } = useMySchedules();
  const {
    data: ministryNotifications,
    isLoading: ministryNotificationsLoading,
  } = useMyMinistryNotifications();
  const {
    data: unreadAnnouncements,
    isLoading: announcementsLoading,
  } = useAnnouncementsUnreadCount({
    enabled: open && hasCommunicationAccess,
  });
  const {
    data: carePending,
    isLoading: carePendingLoading,
  } = useCareInboxPendingCount({
    enabled: open && canReceiveCare,
  });
  const {
    data: careViewed,
    isLoading: careViewedLoading,
  } = useCareViewedMineCount({
    enabled: open,
  });
  const {
    data: inbox,
    isLoading: inboxLoading,
    isError: inboxError,
    refetch: refetchInbox,
  } = useNotificationInbox({
    enabled: open,
    poll: open,
  });
  const { data: pendingTier } = useQuery({
    ...billingKeys.tierCrossingPending(churchId ?? "unknown"),
    enabled: open && Boolean(churchId) && isOwner,
  });
  const { data: staffNotices } = useQuery({
    ...billingKeys.tierCrossingNotices(churchId ?? "unknown"),
    enabled: open && Boolean(churchId) && canMembers,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    void refetchInbox();
  }, [open, refetchInbox]);

  const markNoticeRead = useMutation({
    mutationFn: async (noticeId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return markTierCrossingStaffNoticeRead(churchId, noticeId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: billingKeys.tierCrossingNotices(churchId ?? "unknown").queryKey,
      });
    },
  });
  const ackCareViewed = useAckCareViewedMine();
  const markInboxRead = useMarkNotificationRead();

  const passwordResetCount = canManage ? (passwordResetRequests?.length ?? 0) : 0;
  const pendingScheduleCount = schedulePendingCount(
    schedules,
    hasSchedulesAccess,
  );
  const ministryCount = ministryNotificationsCount(ministryNotifications);
  const announcementCount = announcementsUnreadCount(
    unreadAnnouncements,
    hasCommunicationAccess,
  );
  const carePendingCount = canReceiveCare ? (carePending?.count ?? 0) : 0;
  const careViewedCount = careViewed?.count ?? 0;
  const tierPendingCount = isOwner && pendingTier ? 1 : 0;
  const tierNoticeCount = canMembers ? (staffNotices?.length ?? 0) : 0;
  const unreadInboxItems = inboxUnreadItems(inbox?.items);
  const inboxCount = inboxUnreadCount(inbox);
  const count =
    passwordResetCount +
    pendingScheduleCount +
    ministryCount +
    announcementCount +
    carePendingCount +
    careViewedCount +
    tierPendingCount +
    tierNoticeCount +
    inboxCount;

  const respondHref = schedules
    ? firstPendingScheduleHref(schedules)
    : AUTH_ROUTES.mySchedules;

  const isLoading =
    (canManage && passwordResetLoading) ||
    (hasSchedulesAccess && schedulesLoading) ||
    ministryNotificationsLoading ||
    (hasCommunicationAccess && announcementsLoading) ||
    (canReceiveCare && carePendingLoading) ||
    careViewedLoading ||
    inboxLoading;
  // Não misturar falha de outras fontes com o inbox — senão o sino some
  // mesmo com registration_open gravado no banco.
  const showInboxError = inboxError && unreadInboxItems.length === 0;
  const showEmpty =
    !isLoading &&
    !showInboxError &&
    count === 0 &&
    unreadInboxItems.length === 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || (!sheet && !anchorRect)) {
    return null;
  }

  const panelStyle = sheet
    ? undefined
    : {
        top: (anchorRect?.bottom ?? 0) + 8,
        right: Math.max(16, window.innerWidth - (anchorRect?.right ?? 0)),
      };

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/20"
        aria-label="Fechar notificações"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={panelStyle}
        className={cn(
          "fixed z-50 flex flex-col border border-border/80 bg-surface-elevated shadow-elevated",
          sheet
            ? "inset-x-0 bottom-0 max-h-[min(88dvh,36rem)] rounded-t-2xl pb-[env(safe-area-inset-bottom,0px)]"
            : "w-[min(calc(100vw-2rem),22rem)] max-h-[min(70dvh,28rem)] rounded-xl",
        )}
      >
        {sheet ? (
          <div className="flex justify-center pt-2.5" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-border" />
          </div>
        ) : null}
        <header className="shrink-0 border-b border-border/70 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold">
            Notificações
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {count === 0
              ? "Nenhuma pendência no momento"
              : `${count} pendente${count === 1 ? "" : "s"}`}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Carregando...
            </p>
          )}

          {showInboxError && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Não foi possível carregar as notificações.
            </p>
          )}

          {showEmpty && (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto size-7 text-muted-foreground/40" aria-hidden />
              <p className="mt-2 text-sm font-medium">Tudo em dia</p>
            </div>
          )}

          {!isLoading &&
            unreadInboxItems.map((item) => {
              const Icon = inboxTypeIcon(item.type);
              const body = resolveInboxNotificationBody(item);
              return (
                <div
                  key={item.id}
                  className="border-b border-border/70 px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={pendingNotificationStyles.icon.sm}>
                      <Icon
                        className={cn(
                          "size-3.5",
                          pendingNotificationStyles.iconText,
                        )}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={pendingNotificationStyles.label}>
                        {inboxNotificationTypeLabel(item.type)}
                      </p>
                      <p className="mt-1 text-sm font-medium leading-snug">
                        {item.title}
                      </p>
                      {body ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {body}
                        </p>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        asChild={Boolean(item.href)}
                        onClick={() => {
                          void markInboxRead.mutateAsync(item.id);
                          onClose();
                        }}
                      >
                        {item.href ? (
                          <Link href={item.href}>Ver</Link>
                        ) : (
                          "Entendi"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          {!isLoading &&
            announcementCount > 0 && (
              <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className={pendingNotificationStyles.icon.sm}>
                    <Mail
                      className={cn("size-3.5", pendingNotificationStyles.iconText)}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={pendingNotificationStyles.label}>
                      Comunicados
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug">
                      {announcementsNotificationLabel(announcementCount)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {announcementsNotificationDescription(announcementCount)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      asChild
                      onClick={onClose}
                    >
                      <Link href={announcementsNotificationsHref()}>
                        Ver comunicados
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {!isLoading && carePendingCount > 0 && (
            <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className={pendingNotificationStyles.icon.sm}>
                  <HeartHandshake
                    className={cn("size-3.5", pendingNotificationStyles.iconText)}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={pendingNotificationStyles.label}>
                    Aconselhamentos e visitas
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    {carePendingCount === 1
                      ? "1 pedido esperando sua leitura"
                      : `${carePendingCount} pedidos esperando sua leitura`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Confirmar a leitura tranquiliza quem pediu.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    asChild
                    onClick={onClose}
                  >
                    <Link href={AUTH_ROUTES.careRequests}>Ver pedidos</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && careViewedCount > 0 && (
            <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className={pendingNotificationStyles.icon.sm}>
                  <HeartHandshake
                    className={cn("size-3.5", pendingNotificationStyles.iconText)}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={pendingNotificationStyles.label}>
                    Aconselhamentos e visitas
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    {careViewedCount === 1
                      ? "Seu pedido foi lido"
                      : `${careViewedCount} pedidos foram lidos`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Alguém confirma a leitura — e em breve entra em contato.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    asChild
                    onClick={() => {
                      void ackCareViewed.mutateAsync();
                      onClose();
                    }}
                  >
                    <Link href={AUTH_ROUTES.careRequests}>Ver meus pedidos</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && tierPendingCount > 0 && pendingTier && (
            <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className={pendingNotificationStyles.icon.sm}>
                  <CreditCard
                    className={cn("size-3.5", pendingNotificationStyles.iconText)}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={pendingNotificationStyles.label}>Assinatura</p>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    Autorizar nova faixa de cobrança
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pendingTier.requestedByName
                      ? `${pendingTier.requestedByName} pediu liberar ${pendingTier.projectedTierName}.`
                      : `Pedido para liberar ${pendingTier.projectedTierName}.`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={() => {
                      onClose();
                      openTierUpgradeApprovalModal();
                    }}
                  >
                    Revisar pedido
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading &&
            tierNoticeCount > 0 &&
            staffNotices?.map((notice) => (
              <div
                key={notice.id}
                className="border-b border-border/70 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className={pendingNotificationStyles.icon.sm}>
                    <CreditCard
                      className={cn(
                        "size-3.5",
                        pendingNotificationStyles.iconText,
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={pendingNotificationStyles.label}>Assinatura</p>
                    <p className="mt-1 text-sm font-medium leading-snug">
                      Faixa {notice.tierName} liberada
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      O proprietário autorizou. Você já pode adicionar membros
                      ativos.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      disabled={markNoticeRead.isPending}
                      onClick={() => {
                        markNoticeRead.mutate(notice.id);
                        onClose();
                      }}
                    >
                      Entendi
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          {!isLoading &&
            pendingScheduleCount > 0 && (
              <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className={pendingNotificationStyles.icon.sm}>
                    <ClipboardList
                      className={cn("size-3.5", pendingNotificationStyles.iconText)}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={pendingNotificationStyles.label}>
                      Escalas aguardando resposta
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug">
                      Diga se pode servir na escala
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pendingScheduleCount} evento
                      {pendingScheduleCount === 1 ? "" : "s"} aguardando sua
                      resposta sobre servir na equipe.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      asChild
                      onClick={onClose}
                    >
                      <Link href={respondHref}>Responder agora</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {!isLoading &&
            passwordResetRequests?.map((request) => (
              <div
                key={request.id}
                className="border-b border-border/70 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className={pendingNotificationStyles.icon.sm}>
                    <KeyRound
                      className={cn("size-3.5", pendingNotificationStyles.iconText)}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {request.name} pediu recuperação de senha
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Login: <span className="font-mono">{request.login}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(request.createdAt)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      asChild
                      onClick={onClose}
                    >
                      <Link href={settingsSectionPath("password-reset-requests")}>
                        Gerar nova senha
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          {!isLoading &&
            ministryCount > 0 &&
            ministryNotifications && (
              <div className="border-b border-border/70 px-4 py-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className={pendingNotificationStyles.icon.sm}>
                    <UserCheck
                      className={cn("size-3.5", pendingNotificationStyles.iconText)}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={pendingNotificationStyles.label}>
                      {ministryNotifications.summary.needsFunctionsCount > 0
                        ? "Ação necessária"
                        : "Atualização"}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug">
                      {ministryNotificationLabel(ministryNotifications)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ministryNotificationDescription(ministryNotifications)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      asChild
                      onClick={onClose}
                    >
                      <Link href={ministryNotificationsSettingsHref()}>
                        {ministryNotifications.summary.needsFunctionsCount > 0
                          ? "Escolher funções"
                          : "Ver ministérios"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function NotificationsBell() {
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { churchId } = useTenant();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const count = useNotificationCount();
  const hasNotifications = count > 0;
  const useSheet = isMobile;

  useEffect(() => {
    if (!open || useSheet) {
      return;
    }

    function updatePosition() {
      if (buttonRef.current) {
        setAnchorRect(buttonRef.current.getBoundingClientRect());
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, useSheet]);

  // Todo membro com igreja selecionada vê o sininho (comunicação da igreja).
  if (!churchId) {
    return null;
  }

  function handleToggle() {
    if (!open && !useSheet && buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }

    setOpen((prev) => !prev);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/60 shadow-soft transition-all duration-200",
          open || hasNotifications
            ? "text-foreground hover:bg-background hover:shadow-elevated"
            : "cursor-default text-muted-foreground/50 hover:bg-background/60",
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? titleId : undefined}
        aria-label={
          hasNotifications
            ? `${count} notificação${count === 1 ? "" : "ões"} pendente${count === 1 ? "" : "s"}`
            : "Notificações — nenhuma pendência"
        }
      >
        <Bell className="size-4" aria-hidden />
        {hasNotifications && (
          <span className={pendingNotificationStyles.bellBadge}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <NotificationsPanel
        open={open}
        onClose={() => setOpen(false)}
        titleId={titleId}
        anchorRect={anchorRect}
        sheet={useSheet}
      />
    </>
  );
}
