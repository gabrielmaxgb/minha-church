"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChurchRoles,
  useCreateChurchRole,
  useDeleteChurchRole,
  useUpdateChurchRole,
} from "@/lib/api/queries";
import { canManageChurchRoles } from "@/lib/permissions";
import {
  ALL_CHURCH_PERMISSIONS,
  CHURCH_PERMISSION_LABELS,
  type ChurchPermissionKey,
} from "@/types/church-roles";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchRole } from "@/types/church-roles";

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

export function ChurchRolesSettings() {
  const { permissions } = useAuth();
  const { data: roles, isLoading, isError } = useChurchRoles();
  const createRole = useCreateChurchRole();
  const updateRole = useUpdateChurchRole();
  const deleteRole = useDeleteChurchRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ChurchPermissionKey[]>>({});
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
  }, [roles]);

  if (!canManage) {
    return null;
  }

  function getDraftPermissions(role: ChurchRole): ChurchPermissionKey[] {
    return drafts[role.id] ?? role.permissions;
  }

  function isRoleDirty(role: ChurchRole): boolean {
    const draft = drafts[role.id];

    if (!draft) {
      return false;
    }

    return !permissionsEqual(draft, role.permissions);
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

  function discardChanges(role: ChurchRole) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[role.id];
      return next;
    });
    setErrorMessage(null);
  }

  async function saveChanges(role: ChurchRole) {
    const draft = drafts[role.id];

    if (!draft || permissionsEqual(draft, role.permissions)) {
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await updateRole.mutateAsync({
        roleId: role.id,
        payload: { permissions: draft },
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

  return (
    <div>
      <SettingsSectionHeader
        title="Cargos"
        description="Defina o que cada cargo pode fazer na igreja."
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
              <SettingsSidebar
                footer={
                  isCreating ? (
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
                        className="h-8 border-0 bg-background text-sm shadow-none"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="submit"
                          size="sm"
                          className="h-7 flex-1 text-xs"
                          disabled={createRole.isPending || !newRoleName.trim()}
                        >
                          Criar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
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
                    <button
                      type="button"
                      onClick={() => setIsCreating(true)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                    >
                      <Plus className="size-3.5" />
                      Novo cargo
                    </button>
                  )
                }
              >
                {sortedRoles.map((role) => (
                  <SettingsSidebarItem
                    key={role.id}
                    label={role.name}
                    selected={role.id === selectedRoleId}
                    dirty={isRoleDirty(role)}
                    onClick={() => setSelectedRoleId(role.id)}
                  />
                ))}
              </SettingsSidebar>
            }
          >
            {selectedRole ? (
              <>
                <SettingsDetailHeader
                  title={selectedRole.name}
                  description={`${getDraftPermissions(selectedRole).length} de ${ALL_CHURCH_PERMISSIONS.length} permissões${selectedRole.isSystem ? " · cargo padrão" : ""}`}
                  action={
                    !selectedRole.isSystem ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-destructive"
                        disabled={deleteRole.isPending}
                        onClick={() => void handleDeleteRole(selectedRole)}
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </Button>
                    ) : undefined
                  }
                />

                <div className="flex-1 overflow-y-auto px-5 py-2">
                  <div className="divide-y divide-border/50">
                    {ALL_CHURCH_PERMISSIONS.map((permission) => (
                      <SettingsToggleRow
                        key={permission}
                        label={CHURCH_PERMISSION_LABELS[permission]}
                        checked={getDraftPermissions(selectedRole).includes(
                          permission,
                        )}
                        onChange={() =>
                          togglePermission(selectedRole, permission)
                        }
                      />
                    ))}
                  </div>
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
