"use client";

import { Loader2 } from "lucide-react";

import { SettingsToggleRow } from "@/components/dashboard/settings/settings-shared";
import type { MinistryRole } from "@/types/ministries";

interface MinistryRoleTogglesProps {
  roles: MinistryRole[];
  selectedRoleIds: string[];
  disabled?: boolean;
  isUpdating?: boolean;
  onToggle: (roleId: string, checked: boolean) => void;
}

export function MinistryRoleToggles({
  roles,
  selectedRoleIds,
  disabled = false,
  isUpdating = false,
  onToggle,
}: MinistryRoleTogglesProps) {
  const sortedRoles = [...roles].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedRoles.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Este ministério ainda não tem cargos cadastrados.
      </p>
    );
  }

  return (
    <div className="relative divide-y divide-border/50 rounded-lg border border-border/60 bg-card px-2">
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {sortedRoles.map((role) => (
        <SettingsToggleRow
          key={role.id}
          label={role.name}
          description={
            role.canManageEvents ? "Pode gerenciar atividades" : undefined
          }
          checked={selectedRoleIds.includes(role.id)}
          disabled={disabled || isUpdating}
          onChange={(checked) => onToggle(role.id, checked)}
        />
      ))}
    </div>
  );
}
