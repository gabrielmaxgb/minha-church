"use client";

import { useMemo, useState } from "react";
import { HelpCircle, Inbox, Megaphone, Plus } from "lucide-react";

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

  const activeQuery = tab === "manage" ? manageQuery : feedQuery;
  const announcements = activeQuery.data ?? [];

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
    if (announcement.isRead === false && !markRead.isPending) {
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="size-4" />
            Quando usar?
          </Button>
          {canManage && (
            <Button type="button" size="sm" onClick={openCompose}>
              <Plus className="size-4" />
              Novo comunicado
            </Button>
          )}
        </div>
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
        <div className="space-y-3">
          {markRead.isPending && (
            <span className="sr-only" role="status">
              Marcando como lido
            </span>
          )}
          {announcements.map((announcement) => (
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
      )}

      <AnnouncementDecisionGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

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
