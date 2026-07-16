"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Users, X } from "lucide-react";

import { FamilyGraphCanvas } from "@/components/dashboard/members/family-graph-canvas";
import { FamilyMembersManager } from "@/components/dashboard/members/family-members-manager";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useCreateMemberRelation,
  useDeleteMemberRelation,
  useFamilyGraph,
} from "@/lib/api/queries";
import { canManageMembers } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface FamilyGraphContentProps {
  familyId: string;
}

export function FamilyGraphContent({ familyId }: FamilyGraphContentProps) {
  const { permissions } = useAuth();
  const canEdit = permissions ? canManageMembers(permissions) : false;
  const { data, isLoading, isError, error } = useFamilyGraph(familyId);
  const createRelation = useCreateMemberRelation(familyId);
  const deleteRelation = useDeleteMemberRelation(familyId);
  const [panelOpen, setPanelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar o grafo desta família."}
        </p>
        <Button type="button" variant="outline" asChild>
          <Link href={AUTH_ROUTES.members}>Voltar para membros</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <FamilyGraphCanvas
        familyId={familyId}
        members={data.members}
        relations={data.relations}
        canEdit={canEdit}
        isBusy={createRelation.isPending || deleteRelation.isPending}
        onCreateRelation={async (payload) => {
          await createRelation.mutateAsync(payload);
        }}
        onDeleteRelation={async (relationId) => {
          await deleteRelation.mutateAsync(relationId);
        }}
      />

      {/* Floating chrome — Miro-style overlays on top of the canvas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-2xl border border-border/60 bg-white/92 p-1.5 shadow-popover backdrop-blur-md">
          <Link
            href={AUTH_ROUTES.members}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Membros</span>
          </Link>
          <div className="mx-1 h-6 w-px shrink-0 bg-border/70" aria-hidden />
          <div className="min-w-0 pr-2">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {data.family.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {data.members.length} pessoa
              {data.members.length === 1 ? "" : "s"}
              {data.relations.length > 0 && (
                <>
                  <span className="mx-1 text-border">·</span>
                  {data.relations.length} vínculo
                  {data.relations.length === 1 ? "" : "s"}
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant={panelOpen ? "default" : "outline"}
          onClick={() => setPanelOpen((open) => !open)}
          className="pointer-events-auto shrink-0 shadow-popover backdrop-blur-md"
        >
          <Users className="size-4" />
          Pessoas
          <span
            className={cn(
              "ml-0.5 rounded-full px-1.5 text-xs font-semibold",
              panelOpen
                ? "bg-white/20 text-primary-foreground"
                : "bg-domain-members-subtle text-domain-members-foreground",
            )}
          >
            {data.members.length}
          </span>
        </Button>
      </div>

      {panelOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-30 bg-foreground/10 sm:bg-transparent"
            aria-label="Fechar painel"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute inset-x-3 bottom-3 z-40 max-h-[min(70dvh,560px)] overflow-y-auto rounded-2xl shadow-popover sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-20 sm:max-h-none sm:w-[380px]">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              aria-label="Fechar painel de pessoas"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <FamilyMembersManager
              familyId={familyId}
              familyName={data.family.name}
              members={data.members}
              canEdit={canEdit}
            />
          </div>
        </>
      )}
    </div>
  );
}
