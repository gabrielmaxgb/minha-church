"use client";

import { Check, Crown, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChurchMembershipRole } from "@/types/church-memberships";

export type RoleHolderInfo = {
  userId: string;
  name: string;
};

type MembershipRolePickerProps = {
  roles: ChurchMembershipRole[];
  selectedRoleIds: string[];
  disabled?: boolean;
  holdersByRoleId?: Record<string, RoleHolderInfo | undefined>;
  currentUserId: string;
  onToggle: (roleId: string) => void;
};

function roleDotColor(role: ChurchMembershipRole) {
  return role.color?.trim() || undefined;
}

export function MembershipRolePicker({
  roles,
  selectedRoleIds,
  disabled = false,
  holdersByRoleId = {},
  currentUserId,
  onToggle,
}: MembershipRolePickerProps) {
  const selectable = roles.filter((role) => role.systemKey !== "member");
  const baseline = roles.find((role) => role.systemKey === "member");
  const selectedCount = selectable.filter((role) =>
    selectedRoleIds.includes(role.id),
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight text-foreground">
            Cargos
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toque para marcar. Pode combinar vários — as permissões se somam.
          </p>
        </div>
        <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {selectedCount === 0
            ? "Nenhum extra"
            : `${selectedCount} selecionado${selectedCount === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectable.map((role) => {
          const selected = selectedRoleIds.includes(role.id);
          const isSingleHolder = Boolean(role.singleHolder);
          const holder = holdersByRoleId[role.id];
          const heldByOther =
            isSingleHolder &&
            holder &&
            holder.userId !== currentUserId &&
            !selected;
          const color = roleDotColor(role);

          return (
            <button
              key={role.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onToggle(role.id)}
              className={cn(
                "group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-left transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                disabled && "cursor-not-allowed opacity-50",
                selected
                  ? "border-foreground/15 bg-foreground text-background shadow-sm"
                  : heldByOther
                    ? "border-attention-border bg-attention-subtle/70 text-foreground hover:bg-attention-mark"
                    : "border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  selected
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground group-hover:text-foreground",
                )}
              >
                {selected ? (
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                ) : isSingleHolder ? (
                  <Crown className="size-3" aria-hidden />
                ) : color ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ) : (
                  <UserRound className="size-3" aria-hidden />
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-medium leading-none">
                  {role.name}
                </span>
                {isSingleHolder && (
                  <span
                    className={cn(
                      "mt-1 block truncate text-[10px] leading-none",
                      selected
                        ? "text-background/70"
                        : heldByOther
                          ? "text-attention-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {heldByOther
                      ? `Com ${holder.name.split(" ")[0]}`
                      : selected
                        ? "Titular único"
                        : "Titular único · livre"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {baseline && (
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-medium text-muted-foreground">
            {baseline.name}
          </span>
          <span>sempre incluso para quem tem login</span>
        </p>
      )}
    </div>
  );
}

export function MembershipRoleBadges({
  roles,
  isOwner,
  maxVisible = 2,
}: {
  roles: ChurchMembershipRole[];
  isOwner?: boolean;
  maxVisible?: number;
}) {
  const visibleRoles = roles
    .filter((role) => role.systemKey !== "member")
    .slice(0, maxVisible);
  const hiddenCount = Math.max(
    0,
    roles.filter((role) => role.systemKey !== "member").length -
      visibleRoles.length,
  );
  const hasOnlyMember =
    roles.length > 0 &&
    roles.every((role) => role.systemKey === "member") &&
    !isOwner;

  if (!isOwner && visibleRoles.length === 0 && !hasOnlyMember) {
    return (
      <span className="hidden rounded-full border border-dashed border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
        Sem cargo
      </span>
    );
  }

  return (
    <div className="hidden max-w-56 shrink-0 items-center justify-end gap-1 sm:flex">
      {isOwner && (
        <span className="inline-flex items-center gap-1 rounded-full border border-attention-border bg-attention-subtle px-2 py-0.5 text-[11px] font-medium text-attention-foreground">
          <Crown className="size-2.5" aria-hidden />
          Dono
        </span>
      )}
      {visibleRoles.map((role) => (
        <span
          key={role.id}
          className="inline-flex max-w-24 items-center gap-1.5 truncate rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
        >
          {role.color ? (
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: role.color }}
              aria-hidden
            />
          ) : null}
          <span className="truncate">{role.name}</span>
        </span>
      ))}
      {hasOnlyMember && (
        <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
          Membro
        </span>
      )}
      {hiddenCount > 0 && (
        <span className="rounded-full border border-border/70 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

export function MembershipUserAvatar({
  name,
  isOwner,
}: {
  name: string;
  isOwner?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide",
        isOwner
          ? "bg-attention-mark text-attention-foreground ring-2 ring-attention-border/50"
          : "bg-muted text-muted-foreground",
      )}
      aria-hidden
    >
      {initials || "?"}
      {isOwner ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-attention-solid text-attention-solid-foreground shadow-sm">
          <Crown className="size-2" aria-hidden />
        </span>
      ) : null}
    </span>
  );
}
