"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Search } from "lucide-react";

import { MemberExpandedPanel } from "@/components/dashboard/members/member-expanded-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MEMBER_CREATE_ROUTE } from "@/constants/routes";
import { useMembers } from "@/lib/api/queries";
import { canManageMembers } from "@/lib/permissions";
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

function statusBadgeClass(status: MemberStatus) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "visitor":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "inactive":
      return "border-border bg-muted text-muted-foreground";
  }
}

function memberSubtitle(member: Member): string | null {
  if (member.email) {
    return member.email;
  }

  if (member.phone) {
    return member.phone;
  }

  if (member.ministries.length > 0) {
    return member.ministries.map((link) => link.ministryName).join(" · ");
  }

  return null;
}

function MemberListItem({
  member,
  canManage,
}: {
  member: Member;
  canManage: boolean;
}) {
  const subtitle = memberSubtitle(member);

  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{member.name}</span>
            <span
              className={cn(
                "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium",
                statusBadgeClass(member.status),
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

        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-border/60 bg-muted/15 px-4 py-4">
        <MemberExpandedPanel member={member} canManage={canManage} />
      </div>
    </details>
  );
}

export function MembersContent() {
  const { permissions } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const canManage = permissions ? canManageMembers(permissions) : false;

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
      limit: 50,
    }),
    [debouncedSearch, status],
  );

  const { data, isLoading, isError, error } = useMembers(params);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDebouncedSearch(search.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone"
            className="pl-9"
          />
        </form>

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

      {!isLoading && !isError && data?.data.length === 0 && (
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

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {data.meta.total} {data.meta.total === 1 ? "pessoa" : "pessoas"}
          </p>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {data.data.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                canManage={canManage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
