"use client";

import { useCallback } from "react";
import {
  AlertTriangle,
  Clock,
  Globe,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMarkWhenVisible } from "@/lib/communication/use-mark-when-visible";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type {
  Announcement,
  AnnouncementPriority,
} from "@/types/announcements";

const PRIORITY_META: Record<
  AnnouncementPriority,
  { label: string; className: string }
> = {
  normal: {
    label: "Normal",
    className: "bg-muted text-muted-foreground",
  },
  important: {
    label: "Importante",
    className:
      "bg-amber-500/12 text-amber-800 dark:text-amber-300 border border-amber-500/25",
  },
  urgent: {
    label: "Urgente",
    className:
      "bg-destructive/10 text-destructive border border-destructive/25",
  },
};

const STATUS_META: Record<
  Announcement["status"],
  { label: string; className: string } | null
> = {
  published: null,
  scheduled: {
    label: "Agendado",
    className: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
  expired: {
    label: "Expirado",
    className: "bg-muted text-muted-foreground",
  },
};

interface AnnouncementCardProps {
  announcement: Announcement;
  /** Modo gestão exibe status/estatísticas e ações de edição. */
  manageMode?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  onVisible?: (announcement: Announcement) => void;
}

export function AnnouncementCard({
  announcement,
  manageMode = false,
  onEdit,
  onDelete,
  onVisible,
}: AnnouncementCardProps) {
  const priority = PRIORITY_META[announcement.priority];
  const status = STATUS_META[announcement.status];
  const unread = !manageMode && announcement.isRead === false;

  const audienceLabel =
    announcement.audienceType === "church_wide"
      ? "Igreja inteira"
      : announcement.ministries.map((ministry) => ministry.name).join(", ") ||
        "Ministérios";

  const tryMarkRead = useCallback(() => {
    if (unread) {
      onVisible?.(announcement);
    }
  }, [announcement, onVisible, unread]);

  const visibilityRef = useMarkWhenVisible(unread, tryMarkRead);

  function handleReveal() {
    tryMarkRead();
  }

  return (
    <article
      ref={visibilityRef}
      onMouseEnter={handleReveal}
      onClick={handleReveal}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-4 shadow-soft transition-colors sm:p-5",
        announcement.pinned
          ? "border-primary/25 border-l-[3px] border-l-primary bg-background/95 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)]"
          : announcement.priority === "urgent"
            ? "border-destructive/25"
            : "border-border/70",
        unread && !announcement.pinned && "ring-1 ring-primary/20",
        unread && announcement.pinned && "ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {unread && (
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                aria-label="Não lido"
              />
            )}
            <h3 className="font-display text-base font-semibold leading-tight">
              {announcement.title}
            </h3>
          </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  announcement.audienceType === "church_wide"
                    ? "bg-primary/10 text-primary"
                    : "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                )}
              >
                {announcement.audienceType === "church_wide" ? (
                  <Globe className="size-3" aria-hidden />
                ) : (
                  <Layers className="size-3" aria-hidden />
                )}
                {audienceLabel}
              </span>
              {announcement.priority !== "normal" && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    priority.className,
                  )}
                >
                  {announcement.priority === "urgent" && (
                    <AlertTriangle className="size-3" aria-hidden />
                  )}
                  {priority.label}
                </span>
              )}
              {status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    status.className,
                  )}
                >
                  {announcement.status === "scheduled" && (
                    <Clock className="size-3" aria-hidden />
                  )}
                  {status.label}
                </span>
              )}
            </div>
        </div>

        {manageMode && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(announcement);
                }}
                aria-label={`Editar ${announcement.title}`}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(announcement);
                }}
                aria-label={`Excluir ${announcement.title}`}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {announcement.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {announcement.status === "scheduled" ? (
          <span>Publica em {formatDateTime(announcement.publishedAt)}</span>
        ) : (
          <span>{formatDateTime(announcement.publishedAt)}</span>
        )}
        {announcement.createdByName && (
          <span>· por {announcement.createdByName}</span>
        )}
        {announcement.expiresAt && (
          <span>· expira em {formatDateTime(announcement.expiresAt)}</span>
        )}
        {manageMode && typeof announcement.readCount === "number" && (
          <span>· {announcement.readCount} leram</span>
        )}
      </div>
    </article>
  );
}
