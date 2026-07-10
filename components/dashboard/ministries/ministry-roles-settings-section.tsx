"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";

import { MinistryRolesGuideModal } from "@/components/dashboard/ministries/ministry-roles-guide-modal";
import {
  SettingsEmptyState,
  SettingsPanel,
  SettingsSectionHeader,
  SettingsSidebar,
  SettingsSidebarItem,
  SettingsSplitLayout,
} from "@/components/dashboard/settings/settings-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateMinistryRole,
  useDeleteMinistryRole,
  useUpdateMinistryRole,
} from "@/lib/api/queries";
import { looksLikeServiceFunctionName } from "@/lib/ministries/looks-like-service-function";
import type { Ministry, MinistryRole } from "@/types/ministries";

import {
  MINISTRY_PERMISSIONS,
  MinistryPermissionToggle,
  RoleAssignmentConstraintToggle,
  type MinistryPermissionField,
} from "./ministry-role-permissions-section";

interface MinistryRolesSettingsSectionProps {
  ministry: Ministry;
  canManage: boolean;
}

function permissionCount(role: MinistryRole): number {
  return MINISTRY_PERMISSIONS.filter((permission) => role[permission.field])
    .length;
}

function MinistryRolePermissionsPanel({
  role,
  ministryId,
  canManage,
  onDelete,
  isDeleting,
}: {
  role: MinistryRole;
  ministryId: string;
  canManage: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const updateRole = useUpdateMinistryRole(ministryId);
  const enabledCount = permissionCount(role);

  function togglePermission(field: MinistryPermissionField, next: boolean) {
    updateRole.mutate({
      roleId: role.id,
      payload: { [field]: next },
    });
  }

  function toggleSingleHolder(next: boolean) {
    updateRole.mutate({
      roleId: role.id,
      payload: { singleHolder: next },
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium tracking-tight">
                {role.name}
              </h3>
              <Badge variant="secondary" className="font-normal tabular-nums">
                {enabledCount}/{MINISTRY_PERMISSIONS.length} ativa
                {enabledCount === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Membros com este cargo herdam estas permissões no ministério.
              Atribua cargos na aba Membros.
            </p>
          </div>

          {canManage && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Excluir cargo
            </Button>
          )}
        </div>

        {MINISTRY_PERMISSIONS.length > 0 && (
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/60"
            role="progressbar"
            aria-valuenow={enabledCount}
            aria-valuemin={0}
            aria-valuemax={MINISTRY_PERMISSIONS.length}
            aria-label={`${role.name}: ${enabledCount} de ${MINISTRY_PERMISSIONS.length} permissões`}
          >
            <div
              className="h-full rounded-full bg-foreground transition-all duration-150 ease-out"
              style={{
                width: `${(enabledCount / MINISTRY_PERMISSIONS.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2 p-3 sm:p-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Atribuição
          </p>
          <RoleAssignmentConstraintToggle
            label="Titular único"
            description="Só uma pessoa por vez pode ter este cargo. Ao atribuir a outra, a anterior perde automaticamente."
            checked={role.singleHolder ?? false}
            disabled={!canManage || updateRole.isPending}
            onToggle={() => toggleSingleHolder(!(role.singleHolder ?? false))}
          />
        </div>

        {MINISTRY_PERMISSIONS.map((permission) => (
          <MinistryPermissionToggle
            key={permission.field}
            permission={permission}
            checked={role[permission.field]}
            disabled={!canManage || updateRole.isPending}
            onToggle={() =>
              togglePermission(permission.field, !role[permission.field])
            }
          />
        ))}
      </div>
    </div>
  );
}

export function MinistryRolesSettingsSection({
  ministry,
  canManage,
}: MinistryRolesSettingsSectionProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const createRole = useCreateMinistryRole(ministry.id);
  const deleteRole = useDeleteMinistryRole(ministry.id);

  const roles = useMemo(
    () => [...ministry.roles].sort((a, b) => a.sortOrder - b.sortOrder),
    [ministry.roles],
  );

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;

  useEffect(() => {
    if (roles.length === 0) {
      setSelectedRoleId(null);
      return;
    }

    if (!selectedRoleId || !roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(roles[0]?.id ?? null);
    }
  }, [roles, selectedRoleId]);

  const looksLikeFunction = looksLikeServiceFunctionName(newRoleName);

  async function handleCreateRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newRoleName.trim();

    if (!name) {
      return;
    }

    const created = await createRole.mutateAsync({ name });
    setNewRoleName("");
    setIsCreating(false);
    setSelectedRoleId(created.id);
  }

  async function handleDeleteRole(roleId: string) {
    await deleteRole.mutateAsync(roleId);

    if (selectedRoleId === roleId) {
      setSelectedRoleId(null);
    }
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Cargos de liderança"
        description="Papéis administrativos neste ministério — quem pode gerenciar eventos e montar a escala. Não confunda com funções na escala (Recepção, Infantil, Mídia…)."
        action={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => setGuideOpen(true)}
            aria-label="Cargos e funções — qual a diferença?"
            title="Cargos e funções — qual a diferença?"
          >
            <HelpCircle className="size-4" />
          </Button>
        }
      />

      <MinistryRolesGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {!canManage && (
        <p className="mb-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Você pode visualizar os cargos e permissões. Para alterá-los, é
          necessário gerenciar ministérios na igreja.
        </p>
      )}

      <SettingsPanel>
        <SettingsSplitLayout
          sidebar={
            <SettingsSidebar>
              {roles.map((role) => (
                <SettingsSidebarItem
                  key={role.id}
                  label={role.name}
                  hint={`${permissionCount(role)} permissão${permissionCount(role) === 1 ? "" : "ões"} ativa${permissionCount(role) === 1 ? "" : "s"}`}
                  selected={role.id === selectedRole?.id}
                  onClick={() => setSelectedRoleId(role.id)}
                />
              ))}

              {canManage && (
                <div className="px-1 pt-2">
                  {isCreating ? (
                    <form
                      onSubmit={(event) => void handleCreateRole(event)}
                      className="space-y-2"
                    >
                      <Input
                        value={newRoleName}
                        onChange={(event) => setNewRoleName(event.target.value)}
                        placeholder="Ex.: Líder, Coordenador"
                        autoFocus
                        disabled={createRole.isPending}
                        className="h-9 text-sm"
                      />
                      {looksLikeFunction && (
                        <p className="rounded-lg border border-attention-border bg-attention-subtle px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                          Isso parece uma{" "}
                          <strong className="text-foreground">
                            função na escala
                          </strong>
                          , não um cargo. Use a seção Funções na escala para
                          Vocal, Teclado, Mídia e similares.
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="flex-1"
                          disabled={createRole.isPending || !newRoleName.trim()}
                        >
                          Adicionar cargo
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
                      Novo cargo
                    </Button>
                  )}
                </div>
              )}
            </SettingsSidebar>
          }
        >
          {selectedRole ? (
            <MinistryRolePermissionsPanel
              role={selectedRole}
              ministryId={ministry.id}
              canManage={canManage}
              isDeleting={deleteRole.isPending}
              onDelete={() => void handleDeleteRole(selectedRole.id)}
            />
          ) : (
            <SettingsEmptyState
              message={
                canManage
                  ? "Nenhum cargo ainda. Crie o primeiro — por exemplo, Líder ou Coordenador."
                  : "Nenhum cargo cadastrado neste ministério."
              }
            />
          )}
        </SettingsSplitLayout>
      </SettingsPanel>
    </div>
  );
}
