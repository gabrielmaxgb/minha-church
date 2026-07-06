"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { CreateMinistryModal } from "@/components/dashboard/ministries/create-ministry-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ministryDetailPath } from "@/constants/routes";
import { useMinistries } from "@/lib/api/queries";
import { canManageMinistries } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

export function MinistriesListContent() {
  const { permissions } = useAuth();
  const { data: ministries, isLoading, isError } = useMinistries();
  const [modalOpen, setModalOpen] = useState(false);
  const canManage = permissions ? canManageMinistries(permissions) : false;

  const sortedMinistries = [...(ministries ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {canManage
              ? "Gerencie todas as áreas de serviço — cargos, permissões e eventos."
              : "Ministérios em que você serve na igreja."}
          </p>

          {canManage && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Novo ministério
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="overflow-hidden rounded-xl border border-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-none border-b border-border" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Não foi possível carregar os ministérios.
          </div>
        )}

        {!isLoading && !isError && sortedMinistries.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {canManage
                ? "Nenhum ministério cadastrado ainda."
                : "Você ainda não faz parte de nenhum ministério."}
            </p>
            {canManage && (
              <Button className="mt-4" size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="size-4" />
                Criar primeiro ministério
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && sortedMinistries.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {sortedMinistries.map((ministry) => (
              <Link
                key={ministry.id}
                href={ministryDetailPath(ministry.id)}
                className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{ministry.name}</span>
                    {!ministry.isActive && (
                      <Badge variant="outline" className="text-[11px]">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {ministry.description ||
                      `${ministry.roles.length} ${ministry.roles.length === 1 ? "cargo" : "cargos"}`}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateMinistryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
