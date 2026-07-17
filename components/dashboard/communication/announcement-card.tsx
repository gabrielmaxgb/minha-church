"use client";

import {
  AlertTriangle,
  Clock,
  Globe,
  Layers,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
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
      "bg-attention-subtle text-attention-foreground border border-attention-border",
  },
  urgent: {
    label: "Urgente",
    className: "bg-destructive/10 text-destructive border border-destructive/25",
  },
};

const STATUS_META: Record<
  Announcement["status"],
  { label: string; className: string } | null
> = {
  published: null,
  scheduled: {
    label: "Agendado",
    className: "bg-muted text-muted-foreground",
  },
  expired: {
    label: "Expirado",
    className: "bg-muted text-muted-foreground",
  },
};

interface AnnouncementCardProps {
  announcement: Announcement;
  showManageActions?: boolean;
  manageActionsBlocked?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

export function AnnouncementCard({
  announcement,
  showManageActions = false,
  manageActionsBlocked = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const priority = PRIORITY_META[announcement.priority];
  const status = STATUS_META[announcement.status];

  const audienceLabel =
    announcement.audienceType === "church_wide"
      ? "Igreja inteira"
      : announcement.ministries.map((ministry) => ministry.name).join(", ") ||
        "Ministérios";

  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-card p-4 shadow-xs transition-colors sm:p-5",
        announcement.pinned
          ? "border-domain-communication/25 bg-domain-communication-subtle/40"
          : announcement.priority === "urgent"
            ? "border-destructive/25"
            : "border-border/80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-domain-communication-subtle px-2 py-0.5 text-[11px] font-medium text-domain-communication-foreground">
                <Pin className="size-3" aria-hidden />
                Fixado
              </span>
            ) : null}
            {announcement.priority !== "normal" ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  priority.className,
                )}
              >
                {announcement.priority === "urgent" ? (
                  <AlertTriangle className="size-3" aria-hidden />
                ) : null}
                {priority.label}
              </span>
            ) : null}
            {status ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  status.className,
                )}
              >
                {announcement.status === "scheduled" ? (
                  <Clock className="size-3" aria-hidden />
                ) : null}
                {status.label}
              </span>
            ) : null}
          </div>

          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {announcement.title}
          </h3>

          <p
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              announcement.audienceType === "church_wide"
                ? "bg-domain-communication-subtle text-domain-communication-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {announcement.audienceType === "church_wide" ? (
              <Globe className="size-3 shrink-0" aria-hidden />
            ) : (
              <Layers className="size-3 shrink-0" aria-hidden />
            )}
            <span className="truncate">{audienceLabel}</span>
          </p>
        </div>

        {showManageActions && (onEdit || onDelete) ? (
          <div className="flex shrink-0 items-center gap-0.5">
            {onEdit ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(announcement)}
                disabled={manageActionsBlocked}
                aria-label={`Editar ${announcement.title}`}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(announcement)}
                disabled={manageActionsBlocked}
                aria-label={`Excluir ${announcement.title}`}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {announcement.body}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {announcement.status === "scheduled" ? (
          <span>Publica em {formatDateTime(announcement.publishedAt)}</span>
        ) : (
          <span>{formatDateTime(announcement.publishedAt)}</span>
        )}
        {announcement.createdByName ? (
          <>
            <span aria-hidden>·</span>
            <span>{announcement.createdByName}</span>
          </>
        ) : null}
        {announcement.expiresAt ? (
          <>
            <span aria-hidden>·</span>
            <span>Expira {formatDateTime(announcement.expiresAt)}</span>
          </>
        ) : null}
        {showManageActions && typeof announcement.readCount === "number" ? (
          <>
            <span aria-hidden>·</span>
            <span>
              {announcement.readCount === 1
                ? "1 leitura"
                : `${announcement.readCount} leituras`}
            </span>
          </>
        ) : null}
      </div>
    </article>
  );
}
