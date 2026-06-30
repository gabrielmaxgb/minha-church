"use client";

import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignableRoles,
  useChurchMemberships,
  useUpdateChurchMembership,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchMembership } from "@/types/church-memberships";

import {
  SettingsAlert,
  SettingsDetailHeader,
  SettingsEmptyState,
  SettingsPanel,
  SettingsSaveBar,
  SettingsSectionHeader,
  SettingsSidebar,
  SettingsSidebarItem,
  SettingsSplitLayout,
  SettingsToggleRow,
} from "./settings-shared";

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

export function ChurchMembershipsSettings() {
  const { user, permissions } = useAuth();
  const { data: memberships, isLoading, isError } = useChurchMemberships();
  const { data: assignableRoles } = useAssignableRoles();
  const updateMembership = useUpdateChurchMembership();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const selectedMembership =
    sortedMemberships.find((item) => item.userId === selectedUserId) ?? null;

  useEffect(() => {
    if (sortedMemberships.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (
      !selectedUserId ||
      !sortedMemberships.some((item) => item.userId === selectedUserId)
    ) {
      const firstEditable = sortedMemberships.find((item) =>
        canEditMembership(item, user?.id, user?.isOwner),
      );
      setSelectedUserId(firstEditable?.userId ?? sortedMemberships[0].userId);
    }
  }, [selectedUserId, sortedMemberships, user?.id, user?.isOwner]);

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
    setIsSaving(true);

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
      setIsSaving(false);
    }
  }

  const selectedDirty = selectedMembership
    ? isMembershipDirty(selectedMembership)
    : false;
  const canEditSelected =
    selectedMembership &&
    canEditMembership(selectedMembership, user?.id, user?.isOwner);

  return (
    <div>
      <SettingsSectionHeader
        title="Usuários"
        description="Atribua cargos a quem tem conta no sistema."
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
          <SettingsSplitLayout
            sidebar={
              <SettingsSidebar>
                {sortedMemberships.map((membership) => (
                  <SettingsSidebarItem
                    key={membership.id}
                    label={membership.user.name}
                    hint={formatMembershipLabel(membership)}
                    selected={membership.userId === selectedUserId}
                    dirty={isMembershipDirty(membership)}
                    onClick={() => setSelectedUserId(membership.userId)}
                  />
                ))}
              </SettingsSidebar>
            }
          >
            {selectedMembership ? (
              <>
                <SettingsDetailHeader
                  title={selectedMembership.user.name}
                  description={`${selectedMembership.user.email}${selectedMembership.memberName ? ` · ${selectedMembership.memberName}` : ""}`}
                />

                <div className="flex-1 overflow-y-auto px-5 py-2">
                  {selectedMembership.isOwner && (
                    <p className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Proprietário da igreja — cargos adicionais são opcionais.
                    </p>
                  )}

                  {!canEditSelected ? (
                    <div className="space-y-2 py-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedMembership.userId === user?.id
                          ? "Você não pode alterar o próprio acesso."
                          : "Você não pode alterar o acesso deste usuário."}
                      </p>
                      <p className="text-sm font-medium">
                        {formatMembershipLabel(selectedMembership)}
                      </p>
                    </div>
                  ) : assignableRoles && assignableRoles.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {assignableRoles.map((role) => (
                        <SettingsToggleRow
                          key={role.id}
                          label={role.name}
                          checked={getDraftRoleIds(selectedMembership).includes(
                            role.id,
                          )}
                          onChange={() =>
                            toggleRole(selectedMembership, role.id)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <SettingsEmptyState message="Nenhum cargo disponível para atribuir." />
                  )}
                </div>

                <SettingsSaveBar
                  visible={Boolean(canEditSelected && selectedDirty)}
                  saving={isSaving}
                  onDiscard={() => discardChanges(selectedMembership)}
                  onSave={() => void saveChanges(selectedMembership)}
                />
              </>
            ) : (
              <SettingsEmptyState message="Selecione um usuário." />
            )}
          </SettingsSplitLayout>
        </SettingsPanel>
      )}
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
