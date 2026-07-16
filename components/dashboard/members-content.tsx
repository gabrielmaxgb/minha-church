"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Network,
  Plus,
  Search,
  Upload,
  UsersRound,
} from "lucide-react";

import { ImportMembersDialog } from "@/components/dashboard/members/import-members-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AUTH_ROUTES,
  familyGraphPath,
  memberDetailPath,
  MEMBER_CREATE_ROUTE,
} from "@/constants/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMembersInfinite, useFamilies } from "@/lib/api/queries";
import { downloadMembersCsv } from "@/lib/api/privacy";
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

type FamilyGroup = {
  id: string;
  name: string;
  members: Member[];
};

function memberSubtitle(
  member: Member,
  options?: { hideFamily?: boolean },
): string | null {
  const parts: string[] = [];

  if (!options?.hideFamily && member.family?.name) {
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

function MemberListItem({
  member,
  hideFamily,
}: {
  member: Member;
  hideFamily?: boolean;
}) {
  const subtitle = memberSubtitle(member, { hideFamily });

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

function groupMembersByFamily(members: Member[]): {
  familyGroups: FamilyGroup[];
  ungroupedMembers: Member[];
} {
  const groups = new Map<string, FamilyGroup>();
  const ungroupedMembers: Member[] = [];

  for (const member of members) {
    if (member.familyId && member.family) {
      const existing = groups.get(member.familyId);
      if (existing) {
        existing.members.push(member);
      } else {
        groups.set(member.familyId, {
          id: member.familyId,
          name: member.family.name,
          members: [member],
        });
      }
    } else {
      ungroupedMembers.push(member);
    }
  }

  const familyGroups = Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );

  return { familyGroups, ungroupedMembers };
}

function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  remaining,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  remaining: number;
  onLoadMore: () => void;
}) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="border-t border-border/60 p-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        disabled={isFetchingNextPage}
        onClick={onLoadMore}
      >
        {isFetchingNextPage ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Carregando...
          </>
        ) : (
          `Carregar mais (${remaining} restantes)`
        )}
      </Button>
    </div>
  );
}

function FamilyGroupItem({
  group,
  expanded,
  onToggle,
}: {
  group: FamilyGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const countLabel =
    group.members.length === 1
      ? "1 pessoa"
      : `${group.members.length} pessoas`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 pr-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              !expanded && "-rotate-90",
            )}
          />
          <div className="min-w-0 flex-1">
            <span className="truncate font-medium">{group.name}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {countLabel}
            </span>
          </div>
        </button>
        <Link
          href={familyGraphPath(group.id)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Network className="size-3.5" />
          Grafo
        </Link>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {group.members.map((member) => (
            <MemberListItem key={member.id} member={member} hideFamily />
          ))}
        </div>
      )}
    </div>
  );
}

export function MembersContent() {
  const { permissions, church } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [familyId, setFamilyId] = useState<string>("all");
  const [groupByFamily, setGroupByFamily] = useState(false);
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(
    () => new Set(),
  );
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const canManage = permissions ? canManageMembers(permissions) : false;
  const { data: families = [] } = useFamilies();

  async function handleExportMembers() {
    if (!church?.id) return;
    setExporting(true);
    try {
      await downloadMembersCsv(church.id);
    } finally {
      setExporting(false);
    }
  }

  // Abre o assistente automaticamente quando chega via onboarding (?importar=1).
  useEffect(() => {
    if (canManage && searchParams.get("importar") === "1") {
      setImportOpen(true);
      router.replace(AUTH_ROUTES.members);
    }
  }, [canManage, searchParams, router]);

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

  const { familyGroups, ungroupedMembers } = useMemo(
    () => groupMembersByFamily(members),
    [members],
  );

  const total = data?.pages[0]?.meta.total ?? 0;
  const isSearching =
    search.trim() !== debouncedSearch || (isFetching && !isLoading && !isFetchingNextPage);

  function toggleFamilyExpanded(id: string) {
    setExpandedFamilyIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          {canManage && (
            <div className="flex shrink-0 flex-wrap gap-2 self-start sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={exporting || !church?.id}
                onClick={() => void handleExportMembers()}
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Exportar CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="size-4" />
                Importar planilha
              </Button>
              <Button size="sm" asChild>
                <Link href={MEMBER_CREATE_ROUTE}>
                  <Plus className="size-4" />
                  Adicionar membro
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  status === filter.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              aria-label="Filtrar por família"
              value={familyId}
              onChange={(event) => setFamilyId(event.target.value)}
              className="w-full sm:w-48 [&_button]:h-8 [&_button]:rounded-full [&_button]:py-0"
            >
              <option value="all">Todas as famílias</option>
              <option value="none">Sem família</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </SelectField>

            <button
              type="button"
              onClick={() => setGroupByFamily((current) => !current)}
              aria-pressed={groupByFamily}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                groupByFamily
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <UsersRound className="size-3.5" />
              Agrupar Famílias
            </button>

            {familyId !== "all" && familyId !== "none" && (
              <Button size="sm" variant="outline" asChild className="h-8 shrink-0 rounded-full">
                <Link href={familyGraphPath(familyId)}>
                  <Network className="size-4" />
                  Ver grafo
                </Link>
              </Button>
            )}
          </div>
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" asChild>
                <Link href={MEMBER_CREATE_ROUTE}>
                  <Plus className="size-4" />
                  Adicionar primeiro membro
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="size-4" />
                Importar planilha
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {members.length} de {total}{" "}
            {total === 1 ? "pessoa" : "pessoas"}
          </p>

          {groupByFamily ? (
            <div className="space-y-3">
              {familyGroups.map((group) => (
                <FamilyGroupItem
                  key={group.id}
                  group={group}
                  expanded={expandedFamilyIds.has(group.id)}
                  onToggle={() => toggleFamilyExpanded(group.id)}
                />
              ))}

              {ungroupedMembers.length > 0 && (
                <div className="space-y-2">
                  {familyGroups.length > 0 && (
                    <p className="pt-1 text-sm font-medium text-muted-foreground">
                      Sem família
                    </p>
                  )}
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    {ungroupedMembers.map((member) => (
                      <MemberListItem key={member.id} member={member} />
                    ))}
                    <LoadMoreButton
                      hasNextPage={Boolean(hasNextPage)}
                      isFetchingNextPage={isFetchingNextPage}
                      remaining={total - members.length}
                      onLoadMore={() => void fetchNextPage()}
                    />
                  </div>
                </div>
              )}

              {ungroupedMembers.length === 0 && hasNextPage && (
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <LoadMoreButton
                    hasNextPage
                    isFetchingNextPage={isFetchingNextPage}
                    remaining={total - members.length}
                    onLoadMore={() => void fetchNextPage()}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {members.map((member) => (
                <MemberListItem key={member.id} member={member} />
              ))}

              <LoadMoreButton
                hasNextPage={Boolean(hasNextPage)}
                isFetchingNextPage={isFetchingNextPage}
                remaining={total - members.length}
                onLoadMore={() => void fetchNextPage()}
              />
            </div>
          )}
        </div>
      )}

      {canManage && (
        <ImportMembersDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}
