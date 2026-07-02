"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

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
import type { MinistryRole } from "@/types/ministries";

interface MemberMinistriesSectionProps {
  member: Member;
  disabled?: boolean;
}

function MinistryRoleRow({
  link,
  roles,
  disabled,
  isUpdating,
  onRoleChange,
  onRemove,
  isRemoving,
}: {
  link: MemberMinistryLink;
  roles: MinistryRole[];
  disabled?: boolean;
  isUpdating: boolean;
  onRoleChange: (ministryRoleId: string | null) => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const sortedRoles = [...roles].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{link.ministryName}</p>
        {roles.length === 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Este ministério ainda não tem cargos cadastrados.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SelectField
          value={link.ministryRoleId ?? ""}
          onChange={(event) => onRoleChange(event.target.value || null)}
          disabled={disabled || isUpdating || isRemoving || roles.length === 0}
          className="w-full sm:w-52"
          aria-label={`Cargo em ${link.ministryName}`}
        >
          <option value="">Sem cargo</option>
          {sortedRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </SelectField>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
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
    </div>
  );
}

export function MemberMinistriesSection({
  member,
  disabled = false,
}: MemberMinistriesSectionProps) {
  const [newMinistryId, setNewMinistryId] = useState("");
  const [newRoleId, setNewRoleId] = useState("");
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

  async function handleRoleChange(
    link: MemberMinistryLink,
    ministryRoleId: string | null,
  ) {
    setActionError(null);

    try {
      await assignMinistry.mutateAsync({
        ministryId: link.ministryId,
        ministryRoleId: ministryRoleId ?? undefined,
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o cargo.",
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
        ministryRoleId: newRoleId || undefined,
      });
      setNewMinistryId("");
      setNewRoleId("");
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
      <div>
        <h3 className="text-sm font-medium">Ministérios e cargos</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Atribua cargos nos ministérios aos quais a pessoa pertence.
        </p>
      </div>

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
            onRoleChange={(ministryRoleId) => handleRoleChange(link, ministryRoleId)}
            onRemove={() => handleRemove(link.ministryId)}
            isRemoving={removeMinistry.isPending}
          />
        ))}

      {!isLoading && availableMinistries.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium">Vincular a um ministério</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`add-ministry-${member.id}`}>Ministério</Label>
              <SelectField
                id={`add-ministry-${member.id}`}
                value={newMinistryId}
                onChange={(event) => {
                  setNewMinistryId(event.target.value);
                  setNewRoleId("");
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

            <div className="space-y-2">
              <Label htmlFor={`add-ministry-role-${member.id}`}>
                Cargo no ministério
              </Label>
              <SelectField
                id={`add-ministry-role-${member.id}`}
                value={newRoleId}
                onChange={(event) => setNewRoleId(event.target.value)}
                disabled={
                  disabled ||
                  isBusy ||
                  !newMinistryId ||
                  newMinistryRoles.length === 0
                }
              >
                <option value="">Sem cargo definido</option>
                {[...newMinistryRoles]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </SelectField>
            </div>
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
