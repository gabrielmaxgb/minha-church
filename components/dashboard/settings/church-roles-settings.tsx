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
  SettingsExpandableRow,
  SettingsPanel,
  SettingsSaveBar,
  SettingsSectionHeader,
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

function ChurchRoleOption({
  label,
  hint,
  selected,
  dirty,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  dirty?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-background shadow-sm ring-1 ring-border"
          : "hover:bg-muted/50",
      )}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{label}</span>
          {dirty && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-amber-500"
              aria-label="Alterações não salvas"
            />
          )}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
      {selected && (
        <span className="shrink-0 text-[11px] font-medium text-primary">
          Ativo
        </span>
      )}
    </button>
  );
}

function ChurchRoleGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
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
  const [rolesPickerOpen, setRolesPickerOpen] = useState(false);

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
      setRolesPickerOpen(false);
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
    setRolesPickerOpen(false);
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
          <div className="border-b border-border/70 p-4 sm:p-5">
            <SettingsExpandableRow
              title={
                selectedRole
                  ? getDraftName(selectedRole)
                  : "Selecione um cargo"
              }
              subtitle={
                rolesPickerOpen
                  ? "Escolha o cargo que deseja configurar"
                  : "Clique para ver todos os cargos"
              }
              badge={
                selectedRole
                  ? `${getDraftPermissions(selectedRole).length}/${ALL_CHURCH_PERMISSIONS.length} permissões`
                  : undefined
              }
              expanded={rolesPickerOpen}
              dirty={selectedDirty}
              onToggle={() => setRolesPickerOpen((open) => !open)}
            >
              <div className="space-y-4">
                <ChurchRoleGroup title="Cargos padrão">
                  {systemRoles.map((role) => (
                    <ChurchRoleOption
                      key={role.id}
                      label={getDraftName(role)}
                      hint={`${getDraftPermissions(role).length} permissões ativas`}
                      selected={role.id === selectedRoleId}
                      dirty={isRoleDirty(role)}
                      onClick={() => selectRole(role.id)}
                    />
                  ))}
                </ChurchRoleGroup>

                {customRoles.length > 0 && (
                  <ChurchRoleGroup title="Cargos personalizados">
                    {customRoles.map((role) => (
                      <ChurchRoleOption
                        key={role.id}
                        label={getDraftName(role)}
                        hint={`${getDraftPermissions(role).length} permissões ativas`}
                        selected={role.id === selectedRoleId}
                        dirty={isRoleDirty(role)}
                        onClick={() => selectRole(role.id)}
                      />
                    ))}
                  </ChurchRoleGroup>
                )}

                <div className="border-t border-border/60 pt-4">
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
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setIsCreating(true)}
                    >
                      <Plus className="size-3.5" />
                      Novo cargo personalizado
                    </Button>
                  )}
                </div>
              </div>
            </SettingsExpandableRow>
          </div>

          <div className="flex flex-col">
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
          </div>
        </SettingsPanel>
      )}
    </div>
  );
}
