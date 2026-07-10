"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FamilyGraphCanvas } from "@/components/dashboard/members/family-graph-canvas";
import { FamilyMembersManager } from "@/components/dashboard/members/family-members-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useCreateMemberRelation,
  useDeleteMemberRelation,
  useFamilyGraph,
} from "@/lib/api/queries";
import { canManageMembers } from "@/lib/permissions";
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "Não foi possível carregar o grafo desta família."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Link
          href={AUTH_ROUTES.members}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Membros
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-domain-members-foreground">
              Família
            </p>
            <h1 className="mt-0.5 font-display text-3xl font-semibold tracking-tight text-foreground">
              {data.family.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.members.length} pessoa
            {data.members.length === 1 ? "" : "s"}
            {data.relations.length > 0 && (
              <>
                <span className="mx-1.5 text-border">·</span>
                {data.relations.length} vínculo
                {data.relations.length === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>
      </div>

      <FamilyMembersManager
        familyId={familyId}
        familyName={data.family.name}
        members={data.members}
        canEdit={canEdit}
      />

      <FamilyGraphCanvas
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
    </div>
  );
}
