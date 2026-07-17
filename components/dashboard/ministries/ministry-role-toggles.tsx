"use client";

import { Check, Crown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MinistryRole } from "@/types/ministries";

export type MinistryRoleHolderInfo = {
  memberId: string;
  name: string;
};

interface MinistryRoleTogglesProps {
  roles: MinistryRole[];
  selectedRoleIds: string[];
  disabled?: boolean;
  isUpdating?: boolean;
  onToggle: (roleId: string, checked: boolean) => void;
  /** Destaque quando a pessoa ainda não tem cargo. */
  emphasizeEmpty?: boolean;
  /** Titulares atuais de cargos únicos (excluindo a pessoa em edição). */
  holdersByRoleId?: Record<string, MinistryRoleHolderInfo | undefined>;
  /** memberId da pessoa cujos cargos estão sendo editados. */
  currentMemberId?: string;
}

function rolePermissionHint(role: MinistryRole): string | undefined {
  const managed = [
    role.canManageEvents ? "eventos" : null,
    role.canManageRoster ? "escalas" : null,
    role.canManageTeam ? "equipe" : null,
    role.canManageRoles ? "cargos" : null,
  ].filter(Boolean);

  if (managed.length === 0) {
    return undefined;
  }

  return `Gerencia ${managed.join(", ")}`;
}

export function MinistryRoleToggles({
  roles,
  selectedRoleIds,
  disabled = false,
  isUpdating = false,
  onToggle,
  emphasizeEmpty = false,
  holdersByRoleId = {},
  currentMemberId,
}: MinistryRoleTogglesProps) {
  const sortedRoles = [...roles].sort((a, b) => a.sortOrder - b.sortOrder);
  const selectedCount = selectedRoleIds.length;
  const isEmpty = selectedCount === 0;

  if (sortedRoles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este ministério ainda não tem cargos cadastrados. Crie cargos na aba
        Cargos.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "relative space-y-3 rounded-lg border p-3 transition-colors",
        emphasizeEmpty && isEmpty
          ? "border-attention-border bg-attention-subtle/50"
          : "border-border/60 bg-muted/20",
      )}
    >
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {emphasizeEmpty && isEmpty
              ? "Ainda sem cargo"
              : "Cargos desta pessoa"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toque para marcar. Pode escolher mais de um. Cargos com{" "}
            <Crown
              className="inline size-3 align-[-1px] text-muted-foreground"
              aria-hidden
            />{" "}
            são titulares únicos — só uma pessoa por vez.
          </p>
        </div>
        <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {selectedCount === 0
            ? "Nenhum"
            : `${selectedCount} marcado${selectedCount === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedRoles.map((role) => {
          const selected = selectedRoleIds.includes(role.id);
          const hint = rolePermissionHint(role);
          const isSingleHolder = Boolean(role.singleHolder);
          const holder = holdersByRoleId[role.id];
          const heldByOther =
            isSingleHolder &&
            holder &&
            holder.memberId !== currentMemberId &&
            !selected;

          return (
            <button
              key={role.id}
              type="button"
              disabled={disabled || isUpdating}
              aria-pressed={selected}
              onClick={() => onToggle(role.id, !selected)}
              className={cn(
                "group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-left transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                (disabled || isUpdating) && "cursor-not-allowed opacity-50",
                selected
                  ? "border-foreground/15 bg-foreground text-background shadow-sm"
                  : "border-border/80 bg-background text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  selected
                    ? "bg-background/20 text-background"
                    : "border border-border/70 bg-transparent text-muted-foreground group-hover:text-foreground",
                )}
              >
                {selected ? (
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                ) : isSingleHolder ? (
                  <Crown className="size-3" aria-hidden />
                ) : (
                  <span
                    className="size-2 rounded-full bg-current opacity-30"
                    aria-hidden
                  />
                )}
              </span>

              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm font-medium leading-none",
                    !selected && "text-foreground/80",
                  )}
                >
                  {role.name}
                </span>
                {heldByOther ? (
                  <span className="mt-1 block truncate text-[10px] leading-none text-muted-foreground">
                    Com {holder.name.split(" ")[0]}
                  </span>
                ) : isSingleHolder && selected ? (
                  <span className="mt-1 block truncate text-[10px] leading-none text-background/70">
                    Titular único
                  </span>
                ) : isSingleHolder ? (
                  <span className="mt-1 block truncate text-[10px] leading-none text-muted-foreground">
                    Titular único · livre
                  </span>
                ) : hint ? (
                  <span
                    className={cn(
                      "mt-1 block truncate text-[10px] leading-none",
                      selected
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {hint}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
