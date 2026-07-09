"use client";

import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useAssignableRoles,
  useChurchMemberships,
  useTransferChurchOwnership,
  useUpdateChurchMembership,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchMembership } from "@/types/church-memberships";

import {
  SettingsAlert,
  SettingsEmptyState,
  SettingsExpandableRow,
  SettingsFilterPill,
  SettingsFilterPills,
  SettingsListFilters,
  SettingsPanel,
  SettingsSectionHeader,
  SettingsSidebarToolbar,
  SettingsToggleRow,
} from "./settings-shared";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";

type RoleFilter = "all" | "owner" | "none" | string;

function roleIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((id, index) => id === sortedB[index]);
}

function formatMembershipLabel(membership: ChurchMembership) {
  if (membership.isOwner) {
    return "Proprietário";
  }

  if (membership.roles.length === 0) {
    return "Sem cargo";
  }

  return membership.roles.map((role) => role.name).join(", ");
}

function matchesSearch(membership: ChurchMembership, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    membership.user.name.toLowerCase().includes(normalized) ||
    membership.user.email.toLowerCase().includes(normalized) ||
    membership.memberName?.toLowerCase().includes(normalized)
  );
}

function matchesRoleFilter(
  membership: ChurchMembership,
  roleFilter: RoleFilter,
) {
  if (roleFilter === "all") {
    return true;
  }

  if (roleFilter === "owner") {
    return membership.isOwner;
  }

  if (roleFilter === "none") {
    return !membership.isOwner && membership.roles.length === 0;
  }

  return membership.roles.some((role) => role.id === roleFilter);
}

export function ChurchMembershipsSettings() {
  const { user, permissions } = useAuth();
  const { data: memberships, isLoading, isError } = useChurchMemberships();
  const { data: assignableRoles } = useAssignableRoles();
  const updateMembership = useUpdateChurchMembership();
  const transferOwnership = useTransferChurchOwnership();

  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<ChurchMembership | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    () => new Set(),
  );

  const canManage = canManageChurchMemberships(permissions);

  const sortedMemberships = useMemo(
    () =>
      [...(memberships ?? [])].sort((a, b) => {
        if (a.isOwner !== b.isOwner) {
          return a.isOwner ? -1 : 1;
        }

        return a.user.name.localeCompare(b.user.name, "pt-BR");
      }),
    [memberships],
  );

  const sortedRoles = useMemo(
    () =>
      [...(assignableRoles ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      ),
    [assignableRoles],
  );

  const filteredMemberships = useMemo(
    () =>
      sortedMemberships.filter(
        (membership) =>
          matchesSearch(membership, search) &&
          matchesRoleFilter(membership, roleFilter),
      ),
    [roleFilter, search, sortedMemberships],
  );

  useEffect(() => {
    if (!memberships) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };

      for (const membership of memberships) {
        const draft = current[membership.userId];
        const serverIds = membership.roles.map((role) => role.id);

        if (draft && roleIdsEqual(draft, serverIds)) {
          delete next[membership.userId];
        }
      }

      return next;
    });
  }, [memberships]);

  useEffect(() => {
    setExpandedUserIds((current) => {
      const visibleIds = new Set(filteredMemberships.map((item) => item.userId));
      const next = new Set<string>();

      for (const userId of current) {
        if (visibleIds.has(userId)) {
          next.add(userId);
        }
      }

      return next;
    });
  }, [filteredMemberships]);

  if (!canManage) {
    return null;
  }

  function getDraftRoleIds(membership: ChurchMembership): string[] {
    return drafts[membership.userId] ?? membership.roles.map((role) => role.id);
  }

  function isMembershipDirty(membership: ChurchMembership): boolean {
    const draft = drafts[membership.userId];

    if (!draft) {
      return false;
    }

    return !roleIdsEqual(
      draft,
      membership.roles.map((role) => role.id),
    );
  }

  function toggleExpanded(userId: string) {
    setExpandedUserIds((current) => {
      const next = new Set(current);

      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }

      return next;
    });
  }

  function toggleRole(membership: ChurchMembership, roleId: string) {
    const current = getDraftRoleIds(membership);
    const next = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];

    setDrafts((currentDrafts) => {
      const serverIds = membership.roles.map((role) => role.id);

      if (roleIdsEqual(next, serverIds)) {
        const updated = { ...currentDrafts };
        delete updated[membership.userId];
        return updated;
      }

      return { ...currentDrafts, [membership.userId]: next };
    });
  }

  function discardChanges(membership: ChurchMembership) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[membership.userId];
      return next;
    });
    setErrorMessage(null);
  }

  async function saveChanges(membership: ChurchMembership) {
    const draft = drafts[membership.userId];

    if (!draft) {
      return;
    }

    setErrorMessage(null);
    setSavingUserId(membership.userId);

    try {
      await updateMembership.mutateAsync({
        userId: membership.userId,
        payload: { roleIds: draft },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleConfirmTransfer() {
    if (!transferTarget) {
      return;
    }

    setErrorMessage(null);

    try {
      await transferOwnership.mutateAsync(transferTarget.userId);
      setTransferTarget(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível transferir a propriedade.",
      );
    }
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Usuários"
        description="Defina os cargos de cada pessoa. O proprietário pode transferir a propriedade da igreja para outro usuário."
      />

      {errorMessage && <SettingsAlert message={errorMessage} />}

      {isLoading ? (
        <Skeleton className="h-112 w-full rounded-xl" />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os usuários da igreja.
        </p>
      ) : sortedMemberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum usuário com acesso a esta igreja.
        </p>
      ) : (
        <SettingsPanel>
          <SettingsListFilters>
            <SettingsSidebarToolbar
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar nome ou e-mail..."
              resultCount={filteredMemberships.length}
              totalCount={sortedMemberships.length}
            />
            <SettingsFilterPills>
              <SettingsFilterPill
                active={roleFilter === "all"}
                onClick={() => setRoleFilter("all")}
              >
                Todos
              </SettingsFilterPill>
              <SettingsFilterPill
                active={roleFilter === "owner"}
                onClick={() => setRoleFilter("owner")}
              >
                Proprietário
              </SettingsFilterPill>
              <SettingsFilterPill
                active={roleFilter === "none"}
                onClick={() => setRoleFilter("none")}
              >
                Sem cargo
              </SettingsFilterPill>
              {sortedRoles.map((role) => (
                <SettingsFilterPill
                  key={role.id}
                  active={roleFilter === role.id}
                  onClick={() => setRoleFilter(role.id)}
                >
                  {role.name}
                </SettingsFilterPill>
              ))}
            </SettingsFilterPills>
          </SettingsListFilters>

          <div className="max-h-[min(62vh,560px)] space-y-2 overflow-y-auto p-3 sm:p-4">
            {filteredMemberships.length === 0 ? (
              <SettingsEmptyState message="Nenhum usuário encontrado com os filtros atuais." />
            ) : (
              filteredMemberships.map((membership) => {
                const expanded = expandedUserIds.has(membership.userId);
                const dirty = isMembershipDirty(membership);
                const canEdit = canEditMembership(
                  membership,
                  user?.id,
                  user?.isOwner,
                );
                const isSaving = savingUserId === membership.userId;

                return (
                  <SettingsExpandableRow
                    key={membership.id}
                    title={membership.user.name}
                    subtitle={membership.user.email}
                    badge={formatMembershipLabel(membership)}
                    expanded={expanded}
                    dirty={dirty}
                    onToggle={() => toggleExpanded(membership.userId)}
                  >
                    {membership.memberName && (
                      <p className="mb-3 text-xs text-muted-foreground">
                        Membro vinculado: {membership.memberName}
                      </p>
                    )}

                    {membership.userId === user?.id && user?.isOwner && (
                      <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-muted-foreground">
                        Você é o proprietário desta igreja. Para transferir a
                        propriedade, escolha outra pessoa na lista abaixo.
                      </p>
                    )}

                    {membership.isOwner && membership.userId !== user?.id && (
                      <p className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        Proprietário da igreja — cargos adicionais são opcionais.
                      </p>
                    )}

                    {!canEdit ? (
                      membership.userId === user?.id && user?.isOwner ? null : (
                        <p className="text-sm text-muted-foreground">
                          {membership.userId === user?.id
                            ? "Você não pode alterar o próprio acesso."
                            : "Você não pode alterar o acesso deste usuário."}
                        </p>
                      )
                    ) : assignableRoles && assignableRoles.length > 0 ? (
                      <>
                      {assignableRoles.length > 1 && (
                        <p className="mb-2 text-xs text-muted-foreground">
                          Pode marcar mais de um cargo. As permissões se somam:
                          a pessoa recebe tudo o que qualquer um dos cargos
                          liberar.
                        </p>
                      )}
                      <div className="divide-y divide-border/50 rounded-lg border border-border/60 bg-card px-2">
                        {assignableRoles.map((role) => (
                          <SettingsToggleRow
                            key={role.id}
                            label={role.name}
                            checked={getDraftRoleIds(membership).includes(
                              role.id,
                            )}
                            disabled={isSaving}
                            onChange={() => toggleRole(membership, role.id)}
                          />
                        ))}
                      </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum cargo disponível para atribuir.
                      </p>
                    )}

                    {canEdit && dirty && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => discardChanges(membership)}
                        >
                          Descartar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => void saveChanges(membership)}
                        >
                          {isSaving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </div>
                    )}

                    {user?.isOwner &&
                      !membership.isOwner &&
                      membership.userId !== user.id && (
                        <div className="mt-4 border-t border-border/60 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              transferOwnership.isPending ||
                              isSaving ||
                              Boolean(savingUserId)
                            }
                            onClick={() => setTransferTarget(membership)}
                          >
                            Transferir propriedade
                          </Button>
                        </div>
                      )}
                  </SettingsExpandableRow>
                );
              })
            )}
          </div>
        </SettingsPanel>
      )}

      <TransferOwnershipDialog
        membership={transferTarget}
        pending={transferOwnership.isPending}
        onCancel={() => setTransferTarget(null)}
        onConfirm={() => void handleConfirmTransfer()}
      />
    </div>
  );
}

function canEditMembership(
  membership: ChurchMembership,
  actorUserId: string | undefined,
  actorIsOwner: boolean | undefined,
) {
  if (!actorUserId || membership.userId === actorUserId) {
    return false;
  }

  if (actorIsOwner) {
    return true;
  }

  return !membership.isOwner;
}
