"use client";

import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { AUTH_ROUTES } from "@/constants/routes";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import type { Announcement } from "@/types/announcements";

interface DashboardAnnouncementsPanelProps {
  announcements: Announcement[];
  canPublish: boolean;
}

export function DashboardAnnouncementsPanel({
  announcements,
  canPublish,
}: DashboardAnnouncementsPanelProps) {
  const { writesBlocked } = useTrialWriteGuard();
  const recent = announcements.slice(0, 4);

  return (
    <section className="rounded-xl border border-domain-communication/30 bg-gradient-to-br from-domain-communication-subtle via-card to-card">
      <div className="flex flex-col gap-3 border-b border-domain-communication/20 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-medium text-domain-communication-foreground">
            Comunicados
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Publicados para a igreja
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          asChild
        >
          <Link href={AUTH_ROUTES.communication}>Ver tudo</Link>
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhum comunicado recente
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Publique um comunicado para a igreja ficar alinhada.
          </p>
          {canPublish ? (
            <div className="mt-4 flex flex-col items-center gap-1.5">
              {writesBlocked ? (
                <>
                  <Button size="sm" disabled>
                    <Plus className="size-4" />
                    Publicar comunicado
                  </Button>
                  <LockedFeatureHint action="publicar comunicados" />
                </>
              ) : (
                <Button size="sm" asChild>
                  <Link href={AUTH_ROUTES.communication}>
                    <Plus className="size-4" />
                    Publicar comunicado
                  </Link>
                </Button>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {recent.map((item) => (
            <li key={item.id}>
              <Link
                href={AUTH_ROUTES.communication}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-domain-communication-subtle/40"
              >
                <Megaphone
                  className="mt-0.5 size-4 shrink-0 text-domain-communication-foreground"
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
