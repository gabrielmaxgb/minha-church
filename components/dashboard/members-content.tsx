"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Network, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  familyGraphPath,
  memberDetailPath,
  MEMBER_CREATE_ROUTE,
} from "@/constants/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMembersInfinite, useFamilies } from "@/lib/api/queries";
import { canManageMembers } from "@/lib/permissions";
import { memberStatusBadgeClass } from "@/lib/members/status-badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  MEMBER_STATUS_LABELS,
  type Member,
  type MemberStatus,
} from "@/types/members";

const STATUS_FILTERS: Array<{ value: MemberStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "visitor", label: "Visitantes" },
  { value: "inactive", label: "Inativos" },
];

function memberSubtitle(member: Member): string | null {
  const parts: string[] = [];

  if (member.family?.name) {
    parts.push(member.family.name);
  }

  if (member.email) {
    parts.push(member.email);
  } else if (member.phone) {
    parts.push(member.phone);
  } else if (member.ministries.length > 0) {
    parts.push(member.ministries.map((link) => link.ministryName).join(" · "));
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function MemberListItem({ member }: { member: Member }) {
  const subtitle = memberSubtitle(member);

  return (
    <Link
      href={memberDetailPath(member.id)}
      className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{member.name}</span>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium",
              memberStatusBadgeClass(member.status),
            )}
          >
            {MEMBER_STATUS_LABELS[member.status]}
          </span>
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function MembersContent() {
  const { permissions } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [familyId, setFamilyId] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const canManage = permissions ? canManageMembers(permissions) : false;
  const { data: families = [] } = useFamilies();

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
      familyId: familyId === "all" ? undefined : familyId,
    }),
    [debouncedSearch, status, familyId],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMembersInfinite(params);

  const members = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const total = data?.pages[0]?.meta.total ?? 0;
  const isSearching =
    search.trim() !== debouncedSearch || (isFetching && !isLoading && !isFetchingNextPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone"
            className="pl-9 pr-9"
            aria-busy={isSearching}
          />
          {isSearching && (
            <Loader2
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  status === filter.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <SelectField
            aria-label="Filtrar por família"
            value={familyId}
            onChange={(event) => setFamilyId(event.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">Todas as famílias</option>
            <option value="none">Sem família</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </SelectField>

          {familyId !== "all" && familyId !== "none" && (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <Link href={familyGraphPath(familyId)}>
                <Network className="size-4" />
                Ver grafo
              </Link>
            </Button>
          )}

          {canManage && (
            <Button size="sm" asChild className="shrink-0">
              <Link href={MEMBER_CREATE_ROUTE}>
                <Plus className="size-4" />
                Adicionar membro
              </Link>
            </Button>
          )}
        </div>
      </div>

      {!canManage && (
        <p className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Você pode visualizar os cadastros. Pastores, secretários e administradores
          podem adicionar e editar membros.
        </p>
      )}

      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-none border-b border-border" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar os membros."}
        </div>
      )}

      {!isLoading && !isError && members.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum membro encontrado com os filtros atuais.
          </p>
          {canManage && (
            <Button className="mt-4" size="sm" asChild>
              <Link href={MEMBER_CREATE_ROUTE}>
                <Plus className="size-4" />
                Adicionar primeiro membro
              </Link>
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {members.length} de {total}{" "}
            {total === 1 ? "pessoa" : "pessoas"}
          </p>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {members.map((member) => (
              <MemberListItem key={member.id} member={member} />
            ))}

            {hasNextPage && (
              <div className="border-t border-border/60 p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    `Carregar mais (${total - members.length} restantes)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
