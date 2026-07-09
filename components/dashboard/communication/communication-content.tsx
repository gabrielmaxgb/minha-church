"use client";

import { useMemo, useRef, useState } from "react";
import { HelpCircle, Inbox, Megaphone, Pin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useManagedAnnouncements,
  useMarkAnnouncementRead,
} from "@/lib/api/queries";
import { canManageCommunication } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Announcement } from "@/types/announcements";

import { AnnouncementCard } from "./announcement-card";
import { AnnouncementComposerModal } from "./announcement-composer-modal";
import { AnnouncementDecisionGuide } from "./announcement-decision-guide";
import { ConfirmDeleteAnnouncementDialog } from "./confirm-delete-announcement-dialog";

type CommunicationTab = "feed" | "manage";

export function CommunicationContent() {
  const { permissions } = useAuth();
  const canManage = canManageCommunication(permissions);

  const [tab, setTab] = useState<CommunicationTab>("feed");
  const [guideOpen, setGuideOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const feedQuery = useAnnouncements({ enabled: tab === "feed" });
  const manageQuery = useManagedAnnouncements({
    enabled: canManage && tab === "manage",
  });
  const markRead = useMarkAnnouncementRead();
  const deleteMutation = useDeleteAnnouncement();
  const markedIdsRef = useRef(new Set<string>());

  const activeQuery = tab === "manage" ? manageQuery : feedQuery;
  const announcements = activeQuery.data ?? [];

  const { pinnedAnnouncements, regularAnnouncements } = useMemo(() => {
    const pinned: Announcement[] = [];
    const regular: Announcement[] = [];

    for (const announcement of announcements) {
      if (announcement.pinned) {
        pinned.push(announcement);
      } else {
        regular.push(announcement);
      }
    }

    return { pinnedAnnouncements: pinned, regularAnnouncements: regular };
  }, [announcements]);

  const emptyState = useMemo(() => {
    if (tab === "manage") {
      return {
        icon: Megaphone,
        title: "Nenhum comunicado ainda",
        description:
          "Crie o primeiro comunicado para avisar a igreja ou ministérios específicos.",
      };
    }

    return {
      icon: Inbox,
      title: "Sem comunicados por enquanto",
      description: "Novos avisos da liderança aparecerão aqui.",
    };
  }, [tab]);

  function openCompose() {
    setEditing(null);
    setComposerOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setComposerOpen(true);
  }

  function handleVisible(announcement: Announcement) {
    if (tab === "manage") {
      return;
    }

    if (
      announcement.isRead === false &&
      !markRead.isPending &&
      !markedIdsRef.current.has(announcement.id)
    ) {
      markedIdsRef.current.add(announcement.id);
      markRead.mutate(announcement.id);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) {
      return;
    }

    await deleteMutation.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  const EmptyIcon = emptyState.icon;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {canManage ? (
          <div className="inline-flex rounded-xl bg-muted/60 p-1">
            <TabButton
              active={tab === "feed"}
              onClick={() => setTab("feed")}
              label="Recebidos"
            />
            <TabButton
              active={tab === "manage"}
              onClick={() => setTab("manage")}
              label="Gerenciar"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Avisos da liderança para você.
          </p>
        )}

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="size-4" />
            </Button>
            <Button type="button" size="sm" onClick={openCompose}>
              <Plus className="size-4" />
              Novo comunicado
            </Button>
          </div>
        )}
      </div>

      {activeQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Não foi possível carregar os comunicados. Tente novamente.
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <EmptyIcon className="size-6" aria-hidden />
          </div>
          <div>
            <p className="font-medium">{emptyState.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
          {canManage && tab !== "manage" && (
            <Button type="button" size="sm" variant="outline" onClick={openCompose}>
              <Plus className="size-4" />
              Criar comunicado
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {markRead.isPending && (
            <span className="sr-only" role="status">
              Marcando como lido
            </span>
          )}

          {pinnedAnnouncements.length > 0 ? (
            <section
              aria-labelledby="pinned-announcements-heading"
              className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.07] to-primary/[0.02] p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] sm:p-4"
            >
              <header className="mb-3 flex items-center gap-2 px-0.5 sm:px-1">
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <Pin className="size-3.5" aria-hidden />
                </span>
                <h2
                  id="pinned-announcements-heading"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-primary"
                >
                  Fixados
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
                  {pinnedAnnouncements.length}
                </span>
              </header>

              <div className="space-y-2.5">
                {pinnedAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    manageMode={tab === "manage"}
                    onVisible={handleVisible}
                    onEdit={openEdit}
                    onDelete={setToDelete}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {regularAnnouncements.length > 0 ? (
            <section
              aria-labelledby={
                pinnedAnnouncements.length > 0
                  ? "recent-announcements-heading"
                  : undefined
              }
            >
              {pinnedAnnouncements.length > 0 ? (
                <header className="mb-3 flex items-center gap-3">
                  <h2
                    id="recent-announcements-heading"
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    Recentes
                  </h2>
                  <div className="h-px flex-1 bg-border/70" aria-hidden />
                </header>
              ) : null}

              <div className="space-y-3">
                {regularAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    manageMode={tab === "manage"}
                    onVisible={handleVisible}
                    onEdit={openEdit}
                    onDelete={setToDelete}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {canManage && (
        <AnnouncementDecisionGuide
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      )}

      {canManage && (
        <AnnouncementComposerModal
          open={composerOpen}
          announcement={editing}
          onClose={() => setComposerOpen(false)}
        />
      )}

      <ConfirmDeleteAnnouncementDialog
        announcement={toDelete}
        pending={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
