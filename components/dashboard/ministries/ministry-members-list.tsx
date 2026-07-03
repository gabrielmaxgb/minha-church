"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, Trash2 } from "lucide-react";

import { MinistryRoleToggles } from "@/components/dashboard/ministries/ministry-role-toggles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { MinistryMember, MinistryRole } from "@/types/ministries";

type RoleFilter = "all" | "none" | string;

interface MinistryMembersListProps {
  members: MinistryMember[];
  roles: MinistryRole[];
  canManage: boolean;
  isRemoving?: boolean;
  isUpdatingRoles?: boolean;
  onRemove: (memberId: string) => void;
  onToggleRoles: (
    memberId: string,
    ministryRoleIds: string[],
  ) => void;
}

function matchesSearch(member: MinistryMember, query: string): boolean {
  const normalized = query.toLowerCase();

  return (
    member.memberName.toLowerCase().includes(normalized) ||
    (member.memberEmail?.toLowerCase().includes(normalized) ?? false) ||
    (member.memberPhone?.includes(query) ?? false) ||
    member.roles.some((role) => role.name.toLowerCase().includes(normalized))
  );
}

function matchesRoleFilter(member: MinistryMember, roleFilter: RoleFilter): boolean {
  if (roleFilter === "all") {
    return true;
  }

  if (roleFilter === "none") {
    return member.roles.length === 0;
  }

  return member.roles.some((role) => role.id === roleFilter);
}

export function MinistryMembersList({
  members,
  roles,
  canManage,
  isRemoving = false,
  isUpdatingRoles = false,
  onRemove,
  onToggleRoles,
}: MinistryMembersListProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebouncedValue(search.trim(), 200);

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          matchesSearch(member, debouncedSearch) &&
          matchesRoleFilter(member, roleFilter),
      ),
    [members, debouncedSearch, roleFilter],
  );

  function toggleExpanded(memberId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }

      return next;
    });
  }

  const hasActiveFilters =
    debouncedSearch.length > 0 || roleFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou cargo..."
            className="pl-9"
            aria-label="Buscar membros do ministério"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtrar por cargo
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={roleFilter === "all"}
              onClick={() => setRoleFilter("all")}
            >
              Todos
            </FilterPill>
            <FilterPill
              active={roleFilter === "none"}
              onClick={() => setRoleFilter("none")}
            >
              Sem cargo
            </FilterPill>
            {roles.map((role) => (
              <FilterPill
                key={role.id}
                active={roleFilter === role.id}
                onClick={() => setRoleFilter(role.id)}
              >
                {role.name}
              </FilterPill>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-muted-foreground">
            {filteredMembers.length} de {members.length} membro
            {members.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Nenhum membro encontrado com os filtros atuais."
              : "Nenhum membro vinculado."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredMembers.map((member) => {
            const isExpanded = expandedIds.has(member.id);

            return (
              <li
                key={member.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="flex items-start gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(member.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-md text-left transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">
                        {member.memberName}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                        {member.memberEmail ||
                          member.memberPhone ||
                          "Sem contato"}
                      </span>
                      {!isExpanded && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {member.roles.length > 0 ? (
                            member.roles.map((role) => (
                              <Badge
                                key={role.id}
                                variant="secondary"
                                className="text-[11px] font-normal"
                              >
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal"
                            >
                              Sem cargo
                            </Badge>
                          )}
                        </span>
                      )}
                    </span>
                  </button>

                  {canManage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={isRemoving}
                      onClick={() => onRemove(member.memberId)}
                      aria-label={`Remover ${member.memberName} do ministério`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border/60 px-3 pb-3 pt-2">
                    {canManage ? (
                      <MinistryRoleToggles
                        roles={roles}
                        selectedRoleIds={member.roles.map((role) => role.id)}
                        isUpdating={isUpdatingRoles}
                        onToggle={(roleId, checked) => {
                          const currentIds = member.roles.map((role) => role.id);
                          const next = checked
                            ? [...currentIds, roleId]
                            : currentIds.filter((id) => id !== roleId);

                          onToggleRoles(member.memberId, next);
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {member.roles.length > 0 ? (
                          member.roles.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sem cargo neste ministério
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? "border-primary/20 bg-primary text-primary-foreground shadow-soft"
          : "border-border/80 bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
