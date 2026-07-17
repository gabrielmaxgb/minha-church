"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";

import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import { MinistryRoleToggles } from "@/components/dashboard/ministries/ministry-role-toggles";
import {
  MinistryCargoBadge,
  MinistryFunctionBadge,
  MinistryTagSection,
} from "@/components/dashboard/ministries/ministry-member-tags";
import { TransferSingleHolderRoleDialog } from "@/components/dashboard/settings/transfer-single-holder-role-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { MinistryMember, MinistryRole } from "@/types/ministries";

type RoleFilter = "all" | "none" | string;

type PendingSingleHolderTransfer = {
  member: MinistryMember;
  roleId: string;
  roleName: string;
  currentHolderName: string;
  nextRoleIds: string[];
};

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
  const [pendingTransfer, setPendingTransfer] =
    useState<PendingSingleHolderTransfer | null>(null);
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

  const holdersByRoleId = useMemo(() => {
    const holders: Record<
      string,
      { memberId: string; name: string } | undefined
    > = {};

    for (const member of members) {
      for (const role of member.roles) {
        if (!holders[role.id]) {
          holders[role.id] = {
            memberId: member.memberId,
            name: member.memberName,
          };
        }
      }
    }

    return holders;
  }, [members]);

  const hasActiveFilters =
    debouncedSearch.length > 0 || roleFilter !== "all";

  function findSingleHolderOfRole(
    roleId: string,
    excludeMemberId: string,
  ): MinistryMember | null {
    for (const other of members) {
      if (other.memberId === excludeMemberId) {
        continue;
      }

      if (other.roles.some((role) => role.id === roleId)) {
        return other;
      }
    }

    return null;
  }

  function handleToggleRole(
    member: MinistryMember,
    roleId: string,
    checked: boolean,
  ) {
    const selectedRoleIds = member.roles.map((role) => role.id);
    const next = checked
      ? [...selectedRoleIds, roleId]
      : selectedRoleIds.filter((id) => id !== roleId);

    if (checked) {
      const role = roles.find((item) => item.id === roleId);

      if (role?.singleHolder) {
        const currentHolder = findSingleHolderOfRole(roleId, member.memberId);

        if (currentHolder) {
          setPendingTransfer({
            member,
            roleId,
            roleName: role.name,
            currentHolderName: currentHolder.memberName,
            nextRoleIds: next,
          });
          return;
        }
      }
    }

    onToggleRoles(member.memberId, next);
  }

  function confirmSingleHolderTransfer() {
    if (!pendingTransfer) {
      return;
    }

    onToggleRoles(pendingTransfer.member.memberId, pendingTransfer.nextRoleIds);
    setPendingTransfer(null);
  }

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
        <ul className="space-y-3">
          {filteredMembers.map((member) => {
            const selectedRoleIds = member.roles.map((role) => role.id);
            const hasNoCargo = selectedRoleIds.length === 0;
            const hasFunctions = (member.instruments?.length ?? 0) > 0;

            return (
              <li
                key={member.id}
                className={cn(
                  "overflow-hidden rounded-lg border bg-card p-3 sm:p-4",
                  canManage && hasNoCargo
                    ? "border-attention-border"
                    : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {member.memberName}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {member.memberEmail ||
                        member.memberPhone ||
                        "Sem contato"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <MemberDetailButton
                      memberId={member.memberId}
                      memberName={member.memberName}
                    />
                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={isRemoving}
                        onClick={() => onRemove(member.memberId)}
                        aria-label={`Remover ${member.memberName} do ministério`}
                        title="Remover do ministério"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {canManage ? (
                    <MinistryRoleToggles
                      roles={roles}
                      selectedRoleIds={selectedRoleIds}
                      isUpdating={isUpdatingRoles}
                      emphasizeEmpty={hasNoCargo}
                      holdersByRoleId={holdersByRoleId}
                      currentMemberId={member.memberId}
                      onToggle={(roleId, checked) =>
                        handleToggleRole(member, roleId, checked)
                      }
                    />
                  ) : (
                    <MinistryTagSection title="Cargos">
                      {member.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.roles.map((role) => (
                            <MinistryCargoBadge key={role.id} size="md">
                              {role.name}
                            </MinistryCargoBadge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Sem cargo neste ministério
                        </p>
                      )}
                    </MinistryTagSection>
                  )}

                  {hasFunctions ? (
                    <MinistryTagSection
                      title="Funções de serviço"
                      hint={
                        canManage
                          ? "O membro define as funções no perfil, em Ministérios e Grupos de serviço."
                          : undefined
                      }
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {member.instruments.map((instrument) => (
                          <MinistryFunctionBadge
                            key={instrument}
                            label={instrument}
                            size="md"
                          />
                        ))}
                      </div>
                    </MinistryTagSection>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <TransferSingleHolderRoleDialog
        open={Boolean(pendingTransfer)}
        roleName={pendingTransfer?.roleName ?? ""}
        currentHolderName={pendingTransfer?.currentHolderName ?? ""}
        newHolderName={pendingTransfer?.member.memberName ?? ""}
        onCancel={() => setPendingTransfer(null)}
        onConfirm={confirmSingleHolderTransfer}
      />
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
          ? "border-primary/20 bg-primary text-primary-foreground"
          : "border-border/80 bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
