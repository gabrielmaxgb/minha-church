"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, CalendarDays, Layers, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdateMinistryRole } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { Ministry, MinistryRole } from "@/types/ministries";

type MinistryPermissionField = "canManageEvents" | "canManageRoster";

interface MinistryPermissionDefinition {
  field: MinistryPermissionField;
  label: string;
  description: string;
  icon: LucideIcon;
}

const MINISTRY_PERMISSIONS: MinistryPermissionDefinition[] = [
  {
    field: "canManageEvents",
    label: "Gerenciar eventos",
    description: "Cria e edita atividades deste ministério.",
    icon: Calendar,
  },
  {
    field: "canManageRoster",
    label: "Gerenciar escalas",
    description:
      "Monta a escala oficial escolhendo entre quem marcou disponibilidade.",
    icon: CalendarDays,
  },
];

function PermissionSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Alternar ${label}`}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-foreground" : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function MinistryPermissionToggle({
  permission,
  checked,
  disabled,
  onToggle,
}: {
  permission: MinistryPermissionDefinition;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const Icon = permission.icon;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
        checked
          ? "border-violet-500/35 bg-violet-500/6"
          : "border-border/60 bg-card/40",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors",
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            checked
              ? "bg-violet-500/10"
              : "bg-muted/50 group-hover:bg-muted group-disabled:group-hover:bg-muted/50",
          )}
        >
          <Icon
            className={cn(
              "size-4",
              checked ? "text-violet-800 dark:text-violet-300" : "text-muted-foreground",
            )}
            aria-hidden
          />
        </span>

        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-medium leading-tight">
            {permission.label}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {permission.description}
          </span>
        </span>
      </button>

      <PermissionSwitch
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        label={permission.label}
      />
    </div>
  );
}

function MinistryRolePermissionsCard({
  role,
  ministryId,
  canManage,
}: {
  role: MinistryRole;
  ministryId: string;
  canManage: boolean;
}) {
  const updateRole = useUpdateMinistryRole(ministryId);

  const permissions = MINISTRY_PERMISSIONS;

  const enabledCount = permissions.filter(
    (permission) => role[permission.field],
  ).length;

  function togglePermission(field: MinistryPermissionField, next: boolean) {
    updateRole.mutate({
      roleId: role.id,
      payload: { [field]: next },
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-500/15 bg-card/30 shadow-soft">
      <header className="border-b border-border/50 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Shield
                className="size-4 text-violet-800 dark:text-violet-300"
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {role.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="font-normal tabular-nums"
                >
                  {enabledCount}/{permissions.length} ativa
                  {enabledCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Membros com este cargo herdam estas permissões no ministério.
              </p>
            </div>
          </div>
        </div>

        {permissions.length > 0 && (
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/60"
            role="progressbar"
            aria-valuenow={enabledCount}
            aria-valuemin={0}
            aria-valuemax={permissions.length}
            aria-label={`${role.name}: ${enabledCount} de ${permissions.length} permissões`}
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300 ease-out"
              style={{
                width: `${(enabledCount / permissions.length) * 100}%`,
              }}
            />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-2 p-3 sm:p-4">
        {permissions.map((permission) => (
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
    </section>
  );
}

export function MinistryRolePermissionsSection({
  ministry,
  canManage,
}: {
  ministry: Ministry;
  canManage: boolean;
}) {
  const roles = [...ministry.roles].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card className="border-border/80 shadow-soft">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <Layers
              className="size-4 text-violet-800 dark:text-violet-300"
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <CardTitle>Permissões por cargo</CardTitle>
            <CardDescription className="mt-1">
              Defina o que cada cargo pode fazer neste ministério — eventos,
              escalas e mais.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canManage && (
          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Você pode visualizar as permissões. Para alterá-las, é necessário
            gerenciar ministérios na igreja.
          </p>
        )}

        {roles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/15 px-6 py-10 text-center">
            <Shield className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">
              Nenhum cargo cadastrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Crie cargos na seção &quot;Cargos&quot; antes de definir o que
              cada um pode fazer.
            </p>
          </div>
        ) : (
          roles.map((role) => (
            <MinistryRolePermissionsCard
              key={role.id}
              role={role}
              ministryId={ministry.id}
              canManage={canManage}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
