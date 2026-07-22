"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Inbox, Megaphone, Pin, Plus, SearchX } from "lucide-react";

import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
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
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
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
  const { writesBlocked, subscriptionLocked, blockProps } = useTrialWriteGuard();

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
              "Crie o primeiro comunicado para a igreja ou para um ministério.",
          }
        : {
            icon: Inbox,
            title: "Sem comunicados por enquanto",
            description: "Quando a liderança publicar, aparece aqui.",
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
    <div className="space-y-7">
      <DashboardPageIntro
        eyebrow="Comunicados"
        title={canManage ? "O que a igreja precisa saber" : "Para você"}
        description={
          canManage
            ? "Publique e acompanhe mensagens oficiais da liderança."
            : "Comunicados da liderança para você."
        }
        domain="communication"
        action={
          canManage ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGuideOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="size-4" />
                  Ajuda
                </Button>
                <Button type="button" onClick={openCompose} {...blockProps}>
                  <Plus className="size-4" />
                  Novo comunicado
                </Button>
              </div>
              {subscriptionLocked ? (
                <LockedFeatureHint action="criar ou editar comunicados" />
              ) : null}
            </>
          ) : undefined
        }
      />

      {activeQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : activeQuery.isError ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Não foi possível carregar os comunicados. Tente novamente.
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-domain-communication-subtle text-domain-communication-foreground">
            <EmptyIcon className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">{emptyState.title}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
          {canManage ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={openCompose}
              {...blockProps}
            >
              <Plus className="size-4" />
              Criar comunicado
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          <AnnouncementFiltersBar
            announcements={announcements}
            filters={filters}
            canManage={canManage}
            allowedMinistryIds={viewerMinistryIds}
            onChange={setFilters}
          />

          {activeFilterCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {filteredAnnouncements.length === announcements.length
                ? `${announcements.length} comunicado${announcements.length === 1 ? "" : "s"}`
                : `${filteredAnnouncements.length} de ${announcements.length}`}
              {pinnedAnnouncements.length > 0
                ? ` · ${pinnedAnnouncements.length} fixado${pinnedAnnouncements.length === 1 ? "" : "s"}`
                : null}
            </p>
          ) : null}

          {filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-12 text-center">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <SearchX className="size-5" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Nenhum comunicado encontrado
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajuste a busca ou limpe os filtros.
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
            <div className="space-y-8">
              {pinnedAnnouncements.length > 0 ? (
                <section
                  aria-labelledby="pinned-announcements-heading"
                  className="space-y-3"
                >
                  <header className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-domain-communication-subtle text-domain-communication-foreground">
                      <Pin className="size-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2
                        id="pinned-announcements-heading"
                        className="text-sm font-semibold tracking-tight text-foreground"
                      >
                        Precisam da sua atenção
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {pinnedAnnouncements.length === 1
                          ? "1 comunicado fixado"
                          : `${pinnedAnnouncements.length} comunicados fixados`}
                      </p>
                    </div>
                  </header>

                  <div className="space-y-2.5">
                    {pinnedAnnouncements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        showManageActions={canManage}
                        manageActionsBlocked={writesBlocked}
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
                  className="space-y-3"
                >
                  {pinnedAnnouncements.length > 0 ? (
                    <header>
                      <h2
                        id="recent-announcements-heading"
                        className="text-sm font-semibold tracking-tight text-foreground"
                      >
                        Demais comunicados
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Mais recentes primeiro
                      </p>
                    </header>
                  ) : null}

                  <div className="space-y-2.5">
                    {regularAnnouncements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        showManageActions={canManage}
                        manageActionsBlocked={writesBlocked}
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

      {canManage ? (
        <AnnouncementDecisionGuide
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      ) : null}

      {canManage ? (
        <AnnouncementComposerModal
          open={composerOpen}
          announcement={editing}
          onClose={() => setComposerOpen(false)}
        />
      ) : null}

      <ConfirmDeleteAnnouncementDialog
        announcement={toDelete}
        pending={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
