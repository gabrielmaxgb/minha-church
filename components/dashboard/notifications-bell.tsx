"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, ClipboardList, KeyRound, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AUTH_ROUTES,
  settingsSectionPath,
} from "@/constants/routes";
import { useMyMinistryNotifications, useMySchedules, usePasswordResetRequests } from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
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
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function useNotificationCount(): number {
  const { permissions } = useAuth();
  const canManage = canManageChurchMemberships(permissions);
  const hasSchedulesAccess = Boolean(permissions?.schedules.access);

  const { data: passwordResetRequests } = usePasswordResetRequests({
    poll: canManage,
  });
  const { data: schedules } = useMySchedules();
  const { data: ministryNotifications } = useMyMinistryNotifications();

  const passwordResetCount = canManage ? (passwordResetRequests?.length ?? 0) : 0;
  const pendingScheduleCount = schedulePendingCount(
    schedules,
    hasSchedulesAccess,
  );
  const ministryCount = ministryNotificationsCount(ministryNotifications);

  return passwordResetCount + pendingScheduleCount + ministryCount;
}

function NotificationsPanel({
  open,
  onClose,
  titleId,
  anchorRect,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  anchorRect: DOMRect | null;
}) {
  const { permissions } = useAuth();
  const canManage = canManageChurchMemberships(permissions);
  const hasSchedulesAccess = Boolean(permissions?.schedules.access);

  const {
    data: passwordResetRequests,
    isLoading: passwordResetLoading,
    isError: passwordResetError,
  } = usePasswordResetRequests({ poll: open && canManage });
  const {
    data: schedules,
    isLoading: schedulesLoading,
    isError: schedulesError,
  } = useMySchedules();
  const {
    data: ministryNotifications,
    isLoading: ministryNotificationsLoading,
    isError: ministryNotificationsError,
  } = useMyMinistryNotifications();

  const passwordResetCount = canManage ? (passwordResetRequests?.length ?? 0) : 0;
  const pendingScheduleCount = schedulePendingCount(
    schedules,
    hasSchedulesAccess,
  );
  const ministryCount = ministryNotificationsCount(ministryNotifications);
  const count = passwordResetCount + pendingScheduleCount + ministryCount;

  const respondHref = schedules
    ? firstPendingScheduleHref(schedules)
    : AUTH_ROUTES.mySchedules;

  const isLoading =
    (canManage && passwordResetLoading) ||
    (hasSchedulesAccess && schedulesLoading) ||
    ministryNotificationsLoading;
  const isError =
    (canManage && passwordResetError) ||
    (hasSchedulesAccess && schedulesError) ||
    ministryNotificationsError;

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

  if (!open || !anchorRect) {
    return null;
  }

  const panelStyle = {
    top: anchorRect.bottom + 8,
    right: Math.max(16, window.innerWidth - anchorRect.right),
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
          "fixed z-50 flex w-[min(calc(100vw-2rem),22rem)] flex-col",
          "rounded-xl border border-border/80 bg-surface-elevated shadow-elevated",
          "max-h-[min(70dvh,28rem)]",
        )}
      >
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

          {isError && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Não foi possível carregar as notificações.
            </p>
          )}

          {!isLoading && !isError && count === 0 && (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto size-7 text-muted-foreground/40" aria-hidden />
              <p className="mt-2 text-sm font-medium">Tudo em dia</p>
            </div>
          )}

          {!isLoading &&
            !isError &&
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
                      Precisamos da sua disponibilidade
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pendingScheduleCount} evento
                      {pendingScheduleCount === 1 ? "" : "s"} sem sua resposta.
                      Sem isso, o líder não consegue fechar a escala.
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
            !isError &&
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
            !isError &&
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
  const { permissions } = useAuth();
  const canManage = canManageChurchMemberships(permissions);
  const hasSchedulesAccess = Boolean(permissions?.schedules.access);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const count = useNotificationCount();
  const hasNotifications = count > 0;
  const { data: ministryNotifications } = useMyMinistryNotifications();
  const hasMinistryNotifications =
    ministryNotificationsCount(ministryNotifications) > 0;

  useEffect(() => {
    if (!open) {
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
  }, [open]);

  if (!canManage && !hasSchedulesAccess && !hasMinistryNotifications) {
    return null;
  }

  function handleToggle() {
    if (!open && buttonRef.current) {
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
      />
    </>
  );
}
