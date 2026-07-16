"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FloatingSaveBar } from "@/components/ui/floating-save-bar";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AUTH_ROUTES } from "@/constants/routes";
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

const MEMBERSHIPS_REFRESH_COOLDOWN_MS = 5_000;

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
  const router = useRouter();
  const { user, permissions, church, reloadSession } = useAuth();
  const {
    data: memberships,
    isLoading,
    isError,
    isFetching: isMembershipsFetching,
    refetch: refetchMemberships,
  } = useChurchMemberships();
  const {
    data: assignableRoles,
    isFetching: isAssignableRolesFetching,
    refetch: refetchAssignableRoles,
  } = useAssignableRoles();
  const updateMembership = useUpdateChurchMembership();
  const transferOwnership = useTransferChurchOwnership();

  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<ChurchMembership | null>(
    null,
  );
  const [transferError, setTransferError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [refreshCooldownEndsAt, setRefreshCooldownEndsAt] = useState(0);
  const [refreshTick, setRefreshTick] = useState(() => Date.now());

  const canManage = canManageChurchMemberships(permissions);
  const isRefreshing = isMembershipsFetching || isAssignableRolesFetching;
  const refreshCooldownRemainingMs = Math.max(
    0,
    refreshCooldownEndsAt - refreshTick,
  );
  const refreshOnCooldown = refreshCooldownRemainingMs > 0;

  useEffect(() => {
    if (!refreshOnCooldown) {
      return;
    }

    const timer = window.setInterval(() => {
      setRefreshTick(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [refreshOnCooldown, refreshCooldownEndsAt]);

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
    const base =
      drafts[membership.userId] ?? membership.roles.map((role) => role.id);
    const memberRoleId = assignableRoles?.find(
      (role) => role.systemKey === "member",
    )?.id;

    if (memberRoleId && !base.includes(memberRoleId)) {
      return [...base, memberRoleId];
    }

    return base;
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
    const role = assignableRoles?.find((item) => item.id === roleId);

    if (role?.systemKey === "member") {
      return;
    }

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

  async function handleConfirmTransfer(password: string) {
    if (!transferTarget) {
      return;
    }

    setTransferError(null);
    setErrorMessage(null);

    try {
      await transferOwnership.mutateAsync({
        userId: transferTarget.userId,
        password,
      });
      setTransferTarget(null);
      router.replace(`${AUTH_ROUTES.settings}?section=profile`);
    } catch (error) {
      setTransferError(
        error instanceof Error
          ? error.message
          : "Não foi possível transferir a propriedade.",
      );
    }
  }

  async function handleRefreshMemberships() {
    if (isRefreshing || refreshOnCooldown) {
      return;
    }

    setRefreshCooldownEndsAt(Date.now() + MEMBERSHIPS_REFRESH_COOLDOWN_MS);

    try {
      await Promise.all([
        refetchMemberships(),
        refetchAssignableRoles(),
        reloadSession(),
      ]);
    } catch {
      // Erros já aparecem no estado da query ou via toast global.
    }
  }

  const refreshHint = refreshOnCooldown
    ? `Aguarde ${Math.ceil(refreshCooldownRemainingMs / 1000)}s para atualizar de novo`
    : "Atualizar lista";

  const dirtyMembership = useMemo(() => {
    if (!filteredMemberships.length) {
      return null;
    }

    const editableDirty = filteredMemberships.filter(
      (membership) =>
        canEditMembership(membership, user?.id, user?.isOwner) &&
        isMembershipDirty(membership),
    );

    if (editableDirty.length === 0) {
      return null;
    }

    return (
      editableDirty.find((membership) =>
        expandedUserIds.has(membership.userId),
      ) ?? editableDirty[0]
    );
  }, [drafts, expandedUserIds, filteredMemberships, user?.id, user?.isOwner]);

  return (
    <div>
      <SettingsSectionHeader
        title="Usuários"
        description={
          church?.memberCount != null
            ? `Pessoas com login no painel (cargos e permissões). A lista de membros cadastrados tem ${church.memberCount} pessoa${church.memberCount === 1 ? "" : "s"} — veja em Membros no menu lateral.`
            : "Pessoas com login no painel. Defina cargos e permissões; o proprietário pode transferir a propriedade da igreja."
        }
      />

      {errorMessage && <SettingsAlert message={errorMessage} />}

      {isLoading ? (
        <Skeleton className="h-112 w-full rounded-xl" />
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os usuários da igreja.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleRefreshMemberships()}
            disabled={refreshOnCooldown || isRefreshing}
            title={refreshHint}
          >
            <RefreshCw
              className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden
            />
            Atualizar lista
          </Button>
        </div>
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
              countLabel="usuário com acesso"
              countLabelPlural="usuários com acesso"
              onRefresh={() => void handleRefreshMemberships()}
              isRefreshing={isRefreshing}
              refreshDisabled={refreshOnCooldown}
              refreshHint={refreshHint}
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
                      <p className="mb-3 rounded-lg border border-attention-border bg-attention-subtle px-3 py-2 text-xs text-muted-foreground">
                        Você é o proprietário desta igreja. Para transferir a
                        propriedade, escolha outra pessoa na lista abaixo.
                      </p>
                    )}

                    {membership.isOwner && membership.userId !== user?.id && (
                      <p className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        Proprietário da igreja — cargos adicionais são opcionais.
                      </p>
                    )}

                    {user?.isOwner &&
                      !membership.isOwner &&
                      membership.userId !== user.id && (
                        <div className="mb-4 rounded-lg border border-attention-border bg-attention-subtle p-3">
                          {membership.canReceiveOwnership ? (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-attention-foreground">
                                  Transferir propriedade
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  Você deixa de ser o dono desta igreja. Ação
                                  irreversível sem nova transferência.
                                </p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                disabled={
                                  transferOwnership.isPending ||
                                  isSaving ||
                                  Boolean(savingUserId)
                                }
                                onClick={() => {
                                setTransferError(null);
                                setTransferTarget(membership);
                              }}
                                className="shrink-0 border border-attention-border bg-attention-mark text-attention-foreground hover:bg-attention-emphasis/40"
                              >
                                <AlertTriangle className="size-3.5" />
                                Transferir propriedade
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Para receber a propriedade, cadastre um e-mail no
                              perfil do membro vinculado a este acesso.
                            </p>
                          )}
                        </div>
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
                        {assignableRoles.map((role) => {
                          const isBaselineMember = role.systemKey === "member";

                          return (
                            <SettingsToggleRow
                              key={role.id}
                              label={role.name}
                              description={
                                isBaselineMember
                                  ? "Atribuído automaticamente a quem tem login (Membro/todos)."
                                  : undefined
                              }
                              checked={getDraftRoleIds(membership).includes(
                                role.id,
                              )}
                              disabled={isSaving || isBaselineMember}
                              onChange={() => toggleRole(membership, role.id)}
                            />
                          );
                        })}
                      </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum cargo disponível para atribuir.
                      </p>
                    )}

                  </SettingsExpandableRow>
                );
              })
            )}
          </div>
        </SettingsPanel>
      )}

      <FloatingSaveBar
        visible={Boolean(dirtyMembership)}
        saving={
          dirtyMembership
            ? savingUserId === dirtyMembership.userId
            : false
        }
        message={
          dirtyMembership
            ? `Alterações em ${dirtyMembership.user.name}`
            : undefined
        }
        onDiscard={() => {
          if (dirtyMembership) {
            discardChanges(dirtyMembership);
          }
        }}
        onSave={() => {
          if (dirtyMembership) {
            void saveChanges(dirtyMembership);
          }
        }}
      />

      <TransferOwnershipDialog
        membership={transferTarget}
        pending={transferOwnership.isPending}
        error={transferError}
        onCancel={() => {
          setTransferTarget(null);
          setTransferError(null);
        }}
        onConfirm={(password) => void handleConfirmTransfer(password)}
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
