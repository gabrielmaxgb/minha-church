"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useChurchRoles,
  useCreateChurchRole,
  useDeleteChurchRole,
  useUpdateChurchRole,
} from "@/lib/api/queries";
import { canManageChurchRoles } from "@/lib/permissions";
import {
  ALL_CHURCH_PERMISSIONS,
  CHURCH_PERMISSION_GROUPS,
  type ChurchPermissionKey,
} from "@/types/church-roles";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchRole, UpdateChurchRolePayload } from "@/types/church-roles";

import {
  SettingsAlert,
  SettingsEmptyState,
  SettingsPanel,
  SettingsSaveBar,
  SettingsSectionHeader,
  SettingsSidebar,
  SettingsSidebarItem,
  SettingsSplitLayout,
} from "./settings-shared";
import { ChurchRoleNameHeader } from "./church-role-name-header";
import {
  ChurchRolePermissionsEditor,
  ChurchRolePermissionsSummary,
} from "./church-role-permissions-editor";

function permissionsEqual(
  a: readonly ChurchPermissionKey[],
  b: readonly ChurchPermissionKey[],
) {
  if (a.length !== b.length) {
    return false;
  }

  const set = new Set(a);

  return b.every((item) => set.has(item));
}

const CHURCH_ROLE_GROUP_TONES = {
  system: {
    label: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    badge:
      "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  custom: {
    label: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    badge:
      "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
} as const;

function ChurchRoleSidebarGroupLabel({
  title,
  count,
  tone,
}: {
  title: string;
  count: number;
  tone: keyof typeof CHURCH_ROLE_GROUP_TONES;
}) {
  const toneStyle = CHURCH_ROLE_GROUP_TONES[tone];

  return (
    <div className="mt-1 flex items-center gap-2 px-3 pb-1.5 pt-3">
      <span className={cn("size-1.5 rounded-full", toneStyle.dot)} />
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider",
          toneStyle.label,
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
          toneStyle.badge,
        )}
      >
        {count}
      </span>
    </div>
  );
}

export function ChurchRolesSettings() {
  const { permissions } = useAuth();
  const { data: roles, isLoading, isError } = useChurchRoles();
  const createRole = useCreateChurchRole();
  const updateRole = useUpdateChurchRole();
  const deleteRole = useDeleteChurchRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ChurchPermissionKey[]>>({});
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [newRoleName, setNewRoleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = permissions ? canManageChurchRoles(permissions) : false;

  const sortedRoles = useMemo(
    () =>
      [...(roles ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"),
      ),
    [roles],
  );

  const systemRoles = useMemo(
    () => sortedRoles.filter((role) => role.isSystem),
    [sortedRoles],
  );

  const customRoles = useMemo(
    () => sortedRoles.filter((role) => !role.isSystem),
    [sortedRoles],
  );

  const selectedRole = sortedRoles.find((role) => role.id === selectedRoleId) ?? null;

  useEffect(() => {
    if (sortedRoles.length === 0) {
      setSelectedRoleId(null);
      return;
    }

    if (!selectedRoleId || !sortedRoles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(sortedRoles[0].id);
    }
  }, [selectedRoleId, sortedRoles]);

  useEffect(() => {
    if (!roles) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };

      for (const role of roles) {
        const draft = current[role.id];

        if (draft && permissionsEqual(draft, role.permissions)) {
          delete next[role.id];
        }
      }

      return next;
    });

    setNameDrafts((current) => {
      const next = { ...current };

      for (const role of roles) {
        const draft = current[role.id];

        if (draft !== undefined && draft.trim() === role.name) {
          delete next[role.id];
        }
      }

      return next;
    });
  }, [roles]);

  if (!canManage) {
    return null;
  }

  function getDraftName(role: ChurchRole): string {
    return nameDrafts[role.id] ?? role.name;
  }

  function getDraftPermissions(role: ChurchRole): ChurchPermissionKey[] {
    return drafts[role.id] ?? role.permissions;
  }

  function isPermissionsDirty(role: ChurchRole): boolean {
    const draft = drafts[role.id];

    if (!draft) {
      return false;
    }

    return !permissionsEqual(draft, role.permissions);
  }

  function isNameDirty(role: ChurchRole): boolean {
    const draft = nameDrafts[role.id];

    if (draft === undefined) {
      return false;
    }

    return draft.trim() !== role.name;
  }

  function isRoleDirty(role: ChurchRole): boolean {
    return isPermissionsDirty(role) || isNameDirty(role);
  }

  function setDraftName(roleId: string, value: string) {
    const role = sortedRoles.find((item) => item.id === roleId);

    if (!role) {
      return;
    }

    setNameDrafts((current) => {
      if (value.trim() === role.name) {
        const next = { ...current };
        delete next[roleId];
        return next;
      }

      return { ...current, [roleId]: value };
    });
  }

  function setDraftPermissions(
    roleId: string,
    nextPermissions: ChurchPermissionKey[],
  ) {
    const role = sortedRoles.find((item) => item.id === roleId);

    if (!role) {
      return;
    }

    setDrafts((current) => {
      if (permissionsEqual(nextPermissions, role.permissions)) {
        const next = { ...current };
        delete next[roleId];
        return next;
      }

      return { ...current, [roleId]: nextPermissions };
    });
  }

  function togglePermission(role: ChurchRole, permission: ChurchPermissionKey) {
    const current = getDraftPermissions(role);
    const next = current.includes(permission)
      ? current.filter((item) => item !== permission)
      : [...current, permission];

    setDraftPermissions(role.id, next);
  }

  function setGroupPermissions(
    role: ChurchRole,
    groupId: "sections" | "actions",
    enabled: boolean,
  ) {
    const group = CHURCH_PERMISSION_GROUPS.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    const current = getDraftPermissions(role);
    const next = enabled
      ? [...new Set([...current, ...group.permissions])]
      : current.filter((item) => !group.permissions.includes(item));

    setDraftPermissions(role.id, next);
  }

  function discardChanges(role: ChurchRole) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[role.id];
      return next;
    });
    setNameDrafts((current) => {
      const next = { ...current };
      delete next[role.id];
      return next;
    });
    setErrorMessage(null);
  }

  async function saveChanges(role: ChurchRole) {
    const permissionDraft = drafts[role.id];
    const nameDraft = nameDrafts[role.id];
    const permissionsChanged =
      permissionDraft !== undefined &&
      !permissionsEqual(permissionDraft, role.permissions);
    const nameChanged =
      nameDraft !== undefined && nameDraft.trim() !== role.name;

    if (!permissionsChanged && !nameChanged) {
      return;
    }

    const payload: UpdateChurchRolePayload = {};

    if (permissionsChanged) {
      payload.permissions = permissionDraft;
    }

    if (nameChanged) {
      const trimmedName = nameDraft.trim();

      if (!trimmedName) {
        setErrorMessage("O nome do cargo não pode ficar vazio.");
        return;
      }

      payload.name = trimmedName;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await updateRole.mutateAsync({
        roleId: role.id,
        payload,
      });
      discardChanges(role);
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

  async function handleCreateRole(event: React.FormEvent) {
    event.preventDefault();

    const name = newRoleName.trim();

    if (!name) {
      return;
    }

    setErrorMessage(null);

    try {
      const created = await createRole.mutateAsync({
        name,
        permissions: [],
      });
      setNewRoleName("");
      setIsCreating(false);
      setSelectedRoleId(created.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o cargo.",
      );
    }
  }

  async function handleDeleteRole(role: ChurchRole) {
    if (role.isSystem) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteRole.mutateAsync(role.id);
      discardChanges(role);

      if (selectedRoleId === role.id) {
        setSelectedRoleId(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o cargo.",
      );
    }
  }

  const selectedDirty = selectedRole ? isRoleDirty(selectedRole) : false;

  function selectRole(roleId: string) {
    setSelectedRoleId(roleId);
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Cargos"
        description="Configure o que cada cargo vê no menu e o que pode fazer na igreja."
      />

      {errorMessage && <SettingsAlert message={errorMessage} />}

      {isLoading ? (
        <Skeleton className="h-112 w-full rounded-xl" />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os cargos.
        </p>
      ) : (
        <SettingsPanel>
          <SettingsSplitLayout
            sidebar={
              <SettingsSidebar>
                <ChurchRoleSidebarGroupLabel
                  title="Cargos padrão"
                  count={systemRoles.length}
                  tone="system"
                />
                {systemRoles.map((role) => (
                  <SettingsSidebarItem
                    key={role.id}
                    label={getDraftName(role)}
                    hint={`${getDraftPermissions(role).length} permissões ativas`}
                    selected={role.id === selectedRoleId}
                    dirty={isRoleDirty(role)}
                    onClick={() => selectRole(role.id)}
                  />
                ))}

                {customRoles.length > 0 && (
                  <>
                    <ChurchRoleSidebarGroupLabel
                      title="Cargos personalizados"
                      count={customRoles.length}
                      tone="custom"
                    />
                    {customRoles.map((role) => (
                      <SettingsSidebarItem
                        key={role.id}
                        label={getDraftName(role)}
                        hint={`${getDraftPermissions(role).length} permissões ativas`}
                        selected={role.id === selectedRoleId}
                        dirty={isRoleDirty(role)}
                        onClick={() => selectRole(role.id)}
                      />
                    ))}
                  </>
                )}

                <div className="px-1 pt-2">
                  {isCreating ? (
                    <form
                      onSubmit={(event) => void handleCreateRole(event)}
                      className="space-y-2"
                    >
                      <Input
                        value={newRoleName}
                        onChange={(event) => setNewRoleName(event.target.value)}
                        placeholder="Nome do cargo"
                        autoFocus
                        disabled={createRole.isPending}
                        className="h-9 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="flex-1"
                          disabled={createRole.isPending || !newRoleName.trim()}
                        >
                          Criar cargo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsCreating(false);
                            setNewRoleName("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsCreating(true)}
                    >
                      <Plus className="size-3.5" />
                      Novo cargo personalizado
                    </Button>
                  )}
                </div>
              </SettingsSidebar>
            }
          >
            {selectedRole ? (
              <>
                {selectedRole.isSystem ? (
                  <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium">{selectedRole.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Cargo padrão do sistema — personalize o acesso abaixo.
                        </p>
                      </div>
                      <ChurchRolePermissionsSummary
                        enabledCount={getDraftPermissions(selectedRole).length}
                        total={ALL_CHURCH_PERMISSIONS.length}
                      />
                    </div>
                  </div>
                ) : (
                  <ChurchRoleNameHeader
                    name={getDraftName(selectedRole)}
                    enabledCount={getDraftPermissions(selectedRole).length}
                    totalCount={ALL_CHURCH_PERMISSIONS.length}
                    isNameDirty={isNameDirty(selectedRole)}
                    isSaving={isSaving}
                    isDeleting={deleteRole.isPending}
                    onNameChange={(value) =>
                      setDraftName(selectedRole.id, value)
                    }
                    onDelete={() => void handleDeleteRole(selectedRole)}
                  />
                )}

                <div className="flex-1 px-4 py-4 sm:px-5">
                  <ChurchRolePermissionsEditor
                    permissions={getDraftPermissions(selectedRole)}
                    onToggle={(permission) =>
                      togglePermission(selectedRole, permission)
                    }
                    onSetGroup={(groupId, enabled) =>
                      setGroupPermissions(selectedRole, groupId, enabled)
                    }
                  />
                </div>

                <SettingsSaveBar
                  visible={selectedDirty}
                  saving={isSaving}
                  onDiscard={() => discardChanges(selectedRole)}
                  onSave={() => void saveChanges(selectedRole)}
                />
              </>
            ) : (
              <SettingsEmptyState message="Selecione um cargo ou crie um novo." />
            )}
          </SettingsSplitLayout>
        </SettingsPanel>
      )}
    </div>
  );
}
