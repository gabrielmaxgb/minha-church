"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FloatingSaveBar } from "@/components/ui/floating-save-bar";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useAssignableRoles,
  useChurchMemberships,
  useTransferChurchOwnership,
  useUpdateChurchMembership,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { toastApiError } from "@/lib/ui/toast";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchMembership } from "@/types/church-memberships";

import {
  MembershipRoleBadges,
  MembershipRolePicker,
  MembershipUserAvatar,
  type RoleHolderInfo,
} from "./membership-role-picker";
import {
  SettingsEmptyState,
  SettingsExpandableRow,
  SettingsFilterPill,
  SettingsFilterPills,
  SettingsListFilters,
  SettingsPanel,
  SettingsSectionHeader,
  SettingsSidebarToolbar,
} from "./settings-shared";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";
import { TransferSingleHolderRoleDialog } from "./transfer-single-holder-role-dialog";

const MEMBERSHIPS_REFRESH_COOLDOWN_MS = 5_000;

type RoleFilter = "all" | "owner" | "none" | string;

type PendingSingleHolderTransfer = {
  membership: ChurchMembership;
  roleId: string;
  roleName: string;
  currentHolderName: string;
};

function roleIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((id, index) => id === sortedB[index]);
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
    return (
      !membership.isOwner &&
      membership.roles.every((role) => role.systemKey === "member")
    );
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
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<ChurchMembership | null>(
    null,
  );
  const [pendingSingleHolderTransfer, setPendingSingleHolderTransfer] =
    useState<PendingSingleHolderTransfer | null>(null);
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

  const holdersByRoleId = useMemo(() => {
    const map: Record<string, RoleHolderInfo | undefined> = {};

    for (const membership of sortedMemberships) {
      const roleIds =
        drafts[membership.userId] ??
        membership.roles.map((role) => role.id);

      for (const roleId of roleIds) {
        if (!map[roleId]) {
          map[roleId] = {
            userId: membership.userId,
            name: membership.user.name,
          };
        }
      }
    }

    return map;
  }, [drafts, sortedMemberships]);

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

  function findSingleHolderOfRole(
    roleId: string,
    excludeUserId: string,
  ): ChurchMembership | null {
    for (const other of sortedMemberships) {
      if (other.userId === excludeUserId) {
        continue;
      }

      if (getDraftRoleIds(other).includes(roleId)) {
        return other;
      }
    }

    return null;
  }

  function applyRoleDraft(membership: ChurchMembership, next: string[]) {
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

  function toggleRole(membership: ChurchMembership, roleId: string) {
    const role = assignableRoles?.find((item) => item.id === roleId);

    if (role?.systemKey === "member") {
      return;
    }

    const current = getDraftRoleIds(membership);
    const isRemoving = current.includes(roleId);

    if (!isRemoving && role?.singleHolder) {
      const currentHolder = findSingleHolderOfRole(roleId, membership.userId);

      if (currentHolder) {
        setPendingSingleHolderTransfer({
          membership,
          roleId,
          roleName: role.name,
          currentHolderName: currentHolder.user.name,
        });
        return;
      }
    }

    const next = isRemoving
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];

    applyRoleDraft(membership, next);
  }

  function confirmSingleHolderTransfer() {
    if (!pendingSingleHolderTransfer) {
      return;
    }

    const { membership, roleId } = pendingSingleHolderTransfer;
    const current = getDraftRoleIds(membership);

    if (!current.includes(roleId)) {
      applyRoleDraft(membership, [...current, roleId]);
    }

    setPendingSingleHolderTransfer(null);
  }

  function discardChanges(membership: ChurchMembership) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[membership.userId];
      return next;
    });
  }

  async function saveChanges(membership: ChurchMembership) {
    const draft = drafts[membership.userId];

    if (!draft) {
      return;
    }

    setSavingUserId(membership.userId);

    try {
      await updateMembership.mutateAsync({
        userId: membership.userId,
        payload: { roleIds: draft },
      });
    } catch (error) {
      toastApiError(error, "Não foi possível salvar as alterações.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleConfirmTransfer(password: string) {
    if (!transferTarget) {
      return;
    }

    try {
      await transferOwnership.mutateAsync({
        userId: transferTarget.userId,
        password,
      });
      setTransferTarget(null);
      router.replace(`${AUTH_ROUTES.settings}?section=profile`);
    } catch (error) {
      toastApiError(error, "Não foi possível transferir a propriedade.");
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
            ? `Quem tem login no painel. Atribua cargos e permissões. Há ${church.memberCount} membro${church.memberCount === 1 ? "" : "s"} cadastrado${church.memberCount === 1 ? "" : "s"} em Membros.`
            : "Quem tem login no painel. Atribua cargos; o dono pode transferir a propriedade."
        }
      />

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
              {sortedRoles
                .filter((role) => role.systemKey !== "member")
                .map((role) => (
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
                const draftRoleIds = getDraftRoleIds(membership);
                const draftRoles = (assignableRoles ?? []).filter((role) =>
                  draftRoleIds.includes(role.id),
                );
                const displayRoles = dirty ? draftRoles : membership.roles;

                return (
                  <SettingsExpandableRow
                    key={membership.id}
                    title={membership.user.name}
                    subtitle={membership.user.email}
                    leading={
                      <MembershipUserAvatar
                        name={membership.user.name}
                        isOwner={membership.isOwner}
                      />
                    }
                    meta={
                      <MembershipRoleBadges
                        roles={displayRoles}
                        isOwner={membership.isOwner}
                      />
                    }
                    expanded={expanded}
                    dirty={dirty}
                    onToggle={() => toggleExpanded(membership.userId)}
                  >
                    <div className="space-y-4">
                      {(membership.memberName ||
                        (membership.isOwner &&
                          membership.userId !== user?.id) ||
                        (membership.userId === user?.id &&
                          user?.isOwner)) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                          {membership.memberName && (
                            <span className="inline-flex items-center gap-1">
                              Membro: {membership.memberName}
                              <MemberDetailButton
                                memberId={membership.memberId}
                                memberName={membership.memberName}
                                className="size-6"
                              />
                            </span>
                          )}
                          {membership.userId === user?.id && user?.isOwner && (
                            <span>
                              Você é o dono — para transferir, abra outra
                              pessoa.
                            </span>
                          )}
                          {membership.isOwner &&
                            membership.userId !== user?.id && (
                              <span>
                                Dono da igreja · cargos extras são opcionais
                              </span>
                            )}
                        </div>
                      )}

                      {!canEdit ? (
                        membership.userId === user?.id &&
                        user?.isOwner ? null : (
                          <p className="text-sm text-muted-foreground">
                            {membership.userId === user?.id
                              ? "Você não pode alterar o próprio acesso."
                              : "Você não pode alterar o acesso deste usuário."}
                          </p>
                        )
                      ) : assignableRoles && assignableRoles.length > 0 ? (
                        <MembershipRolePicker
                          roles={assignableRoles}
                          selectedRoleIds={draftRoleIds}
                          disabled={isSaving}
                          holdersByRoleId={holdersByRoleId}
                          currentUserId={membership.userId}
                          onToggle={(roleId) =>
                            toggleRole(membership, roleId)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum cargo disponível para atribuir.
                        </p>
                      )}

                      {user?.isOwner &&
                        !membership.isOwner &&
                        membership.userId !== user.id && (
                          <div className="border-t border-border/50 pt-3">
                            {membership.canReceiveOwnership ? (
                              <button
                                type="button"
                                disabled={
                                  transferOwnership.isPending ||
                                  isSaving ||
                                  Boolean(savingUserId)
                                }
                                onClick={() => {
                                  setTransferTarget(membership);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-attention-foreground disabled:opacity-50"
                              >
                                <ArrowRightLeft
                                  className="size-3.5"
                                  aria-hidden
                                />
                                Transferir propriedade da igreja…
                              </button>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Para receber a propriedade, cadastre um e-mail
                                no perfil do membro vinculado.
                              </p>
                            )}
                          </div>
                        )}
                    </div>
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
        onCancel={() => {
          setTransferTarget(null);
        }}
        onConfirm={(password) => void handleConfirmTransfer(password)}
      />

      <TransferSingleHolderRoleDialog
        open={Boolean(pendingSingleHolderTransfer)}
        roleName={pendingSingleHolderTransfer?.roleName ?? ""}
        currentHolderName={
          pendingSingleHolderTransfer?.currentHolderName ?? ""
        }
        newHolderName={pendingSingleHolderTransfer?.membership.user.name ?? ""}
        onCancel={() => setPendingSingleHolderTransfer(null)}
        onConfirm={confirmSingleHolderTransfer}
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
