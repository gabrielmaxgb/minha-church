"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { MinistryRoleToggles } from "@/components/dashboard/ministries/ministry-role-toggles";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  useMemberMinistryAssignment,
  useMemberMinistryRemoval,
  useMinistries,
} from "@/lib/api/queries";
import type { Member, MemberMinistryLink } from "@/types/members";

interface MemberMinistriesSectionProps {
  member: Member;
  disabled?: boolean;
  /** Oculta o título interno quando a seção já tem cabeçalho externo. */
  hideTitle?: boolean;
}

function MinistryRoleRow({
  link,
  roles,
  disabled,
  isUpdating,
  onRolesChange,
  onRemove,
  isRemoving,
}: {
  link: MemberMinistryLink;
  roles: import("@/types/ministries").MinistryRole[];
  disabled?: boolean;
  isUpdating: boolean;
  onRolesChange: (roleIds: string[]) => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const selectedRoleIds = link.roles.map((role) => role.id);

  return (
    <div className="space-y-3 rounded-lg border border-border px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{link.ministryName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedRoleIds.length === 0
              ? "Nenhum cargo atribuído"
              : `${selectedRoleIds.length} cargo${selectedRoleIds.length === 1 ? "" : "s"} atribuído${selectedRoleIds.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          disabled={disabled || isUpdating || isRemoving}
          onClick={onRemove}
          aria-label={`Remover de ${link.ministryName}`}
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>

      <MinistryRoleToggles
        roles={roles}
        selectedRoleIds={selectedRoleIds}
        disabled={disabled}
        isUpdating={isUpdating}
        onToggle={(roleId, checked) => {
          const next = checked
            ? [...selectedRoleIds, roleId]
            : selectedRoleIds.filter((id) => id !== roleId);

          onRolesChange(next);
        }}
      />
    </div>
  );
}

export function MemberMinistriesSection({
  member,
  disabled = false,
  hideTitle = false,
}: MemberMinistriesSectionProps) {
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newRoleIds, setNewRoleIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ministries, isLoading } = useMinistries();
  const assignMinistry = useMemberMinistryAssignment(member.id);
  const removeMinistry = useMemberMinistryRemoval(member.id);

  const ministriesById = useMemo(
    () => new Map((ministries ?? []).map((ministry) => [ministry.id, ministry])),
    [ministries],
  );

  const availableMinistries = useMemo(() => {
    const assignedIds = new Set(member.ministries.map((link) => link.ministryId));

    return (ministries ?? [])
      .filter((ministry) => ministry.isActive && !assignedIds.has(ministry.id))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [member.ministries, ministries]);

  const selectedNewMinistry = newMinistryId
    ? ministriesById.get(newMinistryId)
    : undefined;
  const newMinistryRoles = selectedNewMinistry?.roles ?? [];

  const isBusy = assignMinistry.isPending || removeMinistry.isPending;

  async function handleRolesChange(
    link: MemberMinistryLink,
    ministryRoleIds: string[],
  ) {
    setActionError(null);

    try {
      await assignMinistry.mutateAsync({
        ministryId: link.ministryId,
        ministryRoleIds,
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar os cargos.",
      );
    }
  }

  async function handleRemove(ministryId: string) {
    setActionError(null);

    try {
      await removeMinistry.mutateAsync(ministryId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o vínculo com o ministério.",
      );
    }
  }

  async function handleAddMinistry() {
    if (!newMinistryId) {
      setActionError("Selecione um ministério.");
      return;
    }

    setActionError(null);

    try {
      await assignMinistry.mutateAsync({
        ministryId: newMinistryId,
        ministryRoleIds: newRoleIds,
      });
      setNewMinistryId("");
      setNewRoleIds([]);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível vincular ao ministério.",
      );
    }
  }

  return (
    <section className="space-y-4">
      {!hideTitle && (
        <div>
          <h3 className="text-sm font-medium">Ministérios e cargos</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Uma pessoa pode ter mais de um cargo no mesmo ministério.
          </p>
        </div>
      )}

      {actionError && <FormAlert>{actionError}</FormAlert>}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando ministérios...</p>
      )}

      {!isLoading && member.ministries.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Nenhum ministério vinculado ainda.
        </p>
      )}

      {!isLoading &&
        member.ministries.map((link) => (
          <MinistryRoleRow
            key={link.id}
            link={link}
            roles={ministriesById.get(link.ministryId)?.roles ?? []}
            disabled={disabled}
            isUpdating={assignMinistry.isPending}
            onRolesChange={(roleIds) => handleRolesChange(link, roleIds)}
            onRemove={() => handleRemove(link.ministryId)}
            isRemoving={removeMinistry.isPending}
          />
        ))}

      {!isLoading && availableMinistries.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium">Vincular a um ministério</p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`add-ministry-${member.id}`}>Ministério</Label>
              <SelectField
                id={`add-ministry-${member.id}`}
                value={newMinistryId}
                onChange={(event) => {
                  setNewMinistryId(event.target.value);
                  setNewRoleIds([]);
                }}
                disabled={disabled || isBusy}
              >
                <option value="">Selecione um ministério</option>
                {availableMinistries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </SelectField>
            </div>

            {newMinistryId && (
              <div className="space-y-2">
                <Label>Cargos no ministério</Label>
                <MinistryRoleToggles
                  roles={newMinistryRoles}
                  selectedRoleIds={newRoleIds}
                  disabled={disabled || isBusy}
                  onToggle={(roleId, checked) => {
                    setNewRoleIds((current) =>
                      checked
                        ? [...current, roleId]
                        : current.filter((id) => id !== roleId),
                    );
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            className="mt-4"
            disabled={disabled || isBusy || !newMinistryId}
            onClick={handleAddMinistry}
          >
            {assignMinistry.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Vinculando...
              </>
            ) : (
              "Vincular ao ministério"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
