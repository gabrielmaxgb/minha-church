"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Inbox, Megaphone, Pin, Plus, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useManagedAnnouncements,
  useMarkAllAnnouncementsRead,
  useMyMember,
} from "@/lib/api/queries";
import {
  countActiveAnnouncementFilters,
  DEFAULT_ANNOUNCEMENT_FILTERS,
  filterAnnouncements,
  type AnnouncementFiltersState,
} from "@/lib/communication/announcement-filters";
import { canManageCommunication } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Announcement } from "@/types/announcements";

import { AnnouncementCard } from "./announcement-card";
import { AnnouncementComposerModal } from "./announcement-composer-modal";
import { AnnouncementDecisionGuide } from "./announcement-decision-guide";
import { AnnouncementFiltersBar } from "./announcement-filters";
import { ConfirmDeleteAnnouncementDialog } from "./confirm-delete-announcement-dialog";

export function CommunicationContent() {
  const { permissions, user } = useAuth();
  const canManage = canManageCommunication(permissions, user?.isOwner);

  const [filters, setFilters] = useState<AnnouncementFiltersState>(
    DEFAULT_ANNOUNCEMENT_FILTERS,
  );
  const [guideOpen, setGuideOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const feedQuery = useAnnouncements({ enabled: !canManage });
  const manageQuery = useManagedAnnouncements({ enabled: canManage });
  const activeQuery = canManage ? manageQuery : feedQuery;
  const { data: myMember } = useMyMember({ enabled: !canManage });
  const markAllRead = useMarkAllAnnouncementsRead();
  const deleteMutation = useDeleteAnnouncement();

  const announcements = activeQuery.data ?? [];

  const viewerMinistryIds = useMemo(() => {
    if (canManage || !myMember) {
      return new Set<string>();
    }

    return new Set(
      myMember.ministries
        .filter((link) => !link.endedAt)
        .map((link) => link.ministryId),
    );
  }, [canManage, myMember]);

  useEffect(() => {
    if (
      canManage ||
      filters.audience === "all" ||
      filters.audience === "church_wide"
    ) {
      return;
    }

    if (!viewerMinistryIds.has(filters.audience)) {
      setFilters((current) => ({ ...current, audience: "all" }));
    }
  }, [filters.audience, canManage, viewerMinistryIds]);

  useEffect(() => {
    markAllRead.mutate();
    // Marca tudo como lido ao abrir a página de comunicados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAnnouncements = useMemo(
    () =>
      filterAnnouncements(announcements, filters, {
        canManage,
      }),
    [announcements, filters, canManage],
  );

  const activeFilterCount = countActiveAnnouncementFilters(filters, {
    canManage,
  });

  const { pinnedAnnouncements, regularAnnouncements } = useMemo(() => {
    const pinned: Announcement[] = [];
    const regular: Announcement[] = [];

    for (const announcement of filteredAnnouncements) {
      if (announcement.pinned) {
        pinned.push(announcement);
      } else {
        regular.push(announcement);
      }
    }

    return { pinnedAnnouncements: pinned, regularAnnouncements: regular };
  }, [filteredAnnouncements]);

  const emptyState = useMemo(
    () =>
      canManage
        ? {
            icon: Megaphone,
            title: "Nenhum comunicado ainda",
            description:
              "Crie o primeiro comunicado para avisar a igreja ou ministérios específicos.",
          }
        : {
            icon: Inbox,
            title: "Sem comunicados por enquanto",
            description: "Novos avisos da liderança aparecerão aqui.",
          },
    [canManage],
  );

  function openCompose() {
    setEditing(null);
    setComposerOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setComposerOpen(true);
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
      <div
        className={cn(
          "flex flex-wrap items-center gap-3",
          canManage ? "justify-end" : "justify-between",
        )}
      >
        {!canManage && (
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
          {canManage && (
            <Button type="button" size="sm" variant="outline" onClick={openCompose}>
              <Plus className="size-4" />
              Criar comunicado
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnnouncementFiltersBar
            announcements={announcements}
            filters={filters}
            canManage={canManage}
            allowedMinistryIds={viewerMinistryIds}
            onChange={setFilters}
          />

          {activeFilterCount > 0 && (
            <p className="px-0.5 text-xs text-muted-foreground">
              {filteredAnnouncements.length === announcements.length
                ? `${announcements.length} comunicado${announcements.length === 1 ? "" : "s"}`
                : `${filteredAnnouncements.length} de ${announcements.length} comunicado${announcements.length === 1 ? "" : "s"}`}
              {pinnedAnnouncements.length > 0 &&
                ` · ${pinnedAnnouncements.length} fixado${pinnedAnnouncements.length === 1 ? "" : "s"}`}
            </p>
          )}

          {filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <SearchX className="size-5" aria-hidden />
              </div>
              <div>
                <p className="font-medium">Nenhum comunicado encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste os filtros ou limpe a busca para ver mais resultados.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFilters(DEFAULT_ANNOUNCEMENT_FILTERS)}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
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
                        showManageActions={canManage}
                        onEdit={canManage ? openEdit : undefined}
                        onDelete={canManage ? setToDelete : undefined}
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
                        showManageActions={canManage}
                        onEdit={canManage ? openEdit : undefined}
                        onDelete={canManage ? setToDelete : undefined}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
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
