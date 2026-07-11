"use client";

import { useEffect, useState } from "react";

import {
  addRosterRole,
  formatRosterRole,
  isRosterRoleSelected,
  removeRosterRole,
} from "@/lib/ministries/roster";
import { useUpdateEventRoleProfile } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

interface EventRoleProfileSectionProps {
  ministryId: string;
  profileKey: string;
  rosterRoles: string[];
  myProfileRoleLabels: string[];
  onRolesChange?: (roleLabels: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function EventRoleProfileSection({
  ministryId,
  profileKey,
  rosterRoles,
  myProfileRoleLabels,
  onRolesChange,
  disabled = false,
  className,
}: EventRoleProfileSectionProps) {
  const [selectedRoles, setSelectedRoles] = useState(myProfileRoleLabels);
  const [error, setError] = useState<string | null>(null);
  const updateProfile = useUpdateEventRoleProfile(ministryId);

  useEffect(() => {
    setSelectedRoles(myProfileRoleLabels);
    setError(null);
  }, [profileKey, myProfileRoleLabels.join("|")]);

  const hasEventRoles = rosterRoles.length > 0;
  const busy = updateProfile.isPending || disabled;

  async function persistRoles(nextRoles: string[]) {
    setError(null);
    onRolesChange?.(nextRoles);

    try {
      await updateProfile.mutateAsync({
        profileKey,
        roleLabels: nextRoles,
      });
    } catch (saveError) {
      setSelectedRoles(myProfileRoleLabels);
      onRolesChange?.(myProfileRoleLabels);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar suas funções.",
      );
    }
  }

  function toggleRole(role: string) {
    const nextRoles = isRosterRoleSelected(selectedRoles, role)
      ? removeRosterRole(selectedRoles, role)
      : addRosterRole(selectedRoles, role);

    setSelectedRoles(nextRoles);
    void persistRoles(nextRoles);
  }

  if (!hasEventRoles) {
    return (
      <p
        className={cn(
          "rounded-lg border border-dashed border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
      >
        O líder ainda não definiu as funções deste evento.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Suas funções neste evento (vale para todas as datas)
      </p>
      <div className="flex flex-wrap gap-2">
        {rosterRoles.map((role) => {
          const active = isRosterRoleSelected(selectedRoles, role);

          return (
            <button
              key={role}
              type="button"
              disabled={busy}
              onClick={() => toggleRole(role)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {formatRosterRole(role)}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {selectedRoles.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Selecione ao menos uma função para marcar disponibilidade.
        </p>
      )}
    </div>
  );
}
