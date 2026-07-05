"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";

import {
  MinistryDashboardSection,
  MinistryMembersSection,
} from "@/components/dashboard/ministries/ministry-dashboard-section";
import { MinistryOverviewSection } from "@/components/dashboard/ministries/ministry-overview-section";
import { MinistryRolePermissionsSection } from "@/components/dashboard/ministries/ministry-role-permissions-section";
import { WorshipAvailabilitySection } from "@/components/dashboard/ministries/worship-availability-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useCreateMinistryRole,
  useDeleteMinistry,
  useDeleteMinistryRole,
  useMinistry,
} from "@/lib/api/queries";
import {
  MINISTRY_SETTINGS_SECTIONS,
  type MinistrySettingsSection,
} from "@/lib/ministries/constants";
import { canManageMembers, canManageMinistries, canCreateMinistryActivity, canManageMinistryRoster } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Ministry, MinistryRole } from "@/types/ministries";

interface MinistryDetailContentProps {
  ministryId: string;
}

function SettingsNav({
  active,
  onChange,
  hasRoster,
}: {
  active: MinistrySettingsSection;
  onChange: (section: MinistrySettingsSection) => void;
  hasRoster: boolean;
}) {
  const sections = MINISTRY_SETTINGS_SECTIONS.filter(
    (item) => !item.rosterOnly || hasRoster,
  );

  return (
    <nav className="flex shrink-0 flex-col gap-0.5 lg:w-56">
      {sections.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-lg px-3 py-2 text-left transition-colors",
            active === item.id
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            item.id === "advanced" && active !== "advanced" && "text-destructive/80",
          )}
        >
          <span className="block text-sm font-medium">{item.label}</span>
          <span className="mt-0.5 block text-xs opacity-80">{item.description}</span>
        </button>
      ))}
    </nav>
  );
}

function RoleRow({
  role,
  ministryId,
  canManage,
}: {
  role: MinistryRole;
  ministryId: string;
  canManage: boolean;
}) {
  const deleteRole = useDeleteMinistryRole(ministryId);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{role.name}</p>
        <p className="text-xs text-muted-foreground">Ordem {role.sortOrder + 1}</p>
      </div>

      {canManage && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
          disabled={deleteRole.isPending}
          onClick={() => deleteRole.mutate(role.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

function RolesSection({
  ministry,
  canManage,
}: {
  ministry: Ministry;
  canManage: boolean;
}) {
  const [name, setName] = useState("");
  const createRole = useCreateMinistryRole(ministry.id);
  const roles = [...ministry.roles].sort((a, b) => a.sortOrder - b.sortOrder);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    await createRole.mutateAsync({ name: name.trim() });
    setName("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargos</CardTitle>
        <CardDescription>
          Defina os papéis dentro deste ministério. As permissões são configuradas na seção ao lado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cargo cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                ministryId={ministry.id}
                canManage={canManage}
              />
            ))}
          </div>
        )}

        {canManage && (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-lg border border-dashed border-border p-4"
          >
            <p className="text-sm font-medium">Adicionar cargo</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Regente, Líder, Vocalista"
                disabled={createRole.isPending}
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0"
                disabled={createRole.isPending || !name.trim()}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function AdvancedSection({
  ministry,
  canManage,
}: {
  ministry: Ministry;
  canManage: boolean;
}) {
  const deleteMinistry = useDeleteMinistry(ministry.id);
  const [confirmName, setConfirmName] = useState("");

  const canDelete = confirmName.trim() === ministry.name;

  async function handleDelete() {
    if (!canDelete) {
      return;
    }

    await deleteMinistry.mutateAsync();
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de perigo</CardTitle>
        <CardDescription>
          Excluir um ministério remove cargos e vínculos. Eventos ficam sem ministério associado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canManage ? (
          <p className="text-sm text-muted-foreground">
            Apenas pastores e administradores podem excluir ministérios.
          </p>
        ) : (
          <>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium">Excluir ministério</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta ação é permanente. Digite{" "}
                <span className="font-medium text-foreground">{ministry.name}</span> para
                confirmar.
              </p>

              <div className="mt-4 space-y-3">
                <Input
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  placeholder={ministry.name}
                  disabled={deleteMinistry.isPending}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!canDelete || deleteMinistry.isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                  {deleteMinistry.isPending ? "Excluindo..." : "Excluir ministério"}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MinistryDetailContent({ ministryId }: MinistryDetailContentProps) {
  const { permissions } = useAuth();
  const searchParams = useSearchParams();
  const { data: ministry, isLoading, isError } = useMinistry(ministryId);
  const [section, setSection] = useState<MinistrySettingsSection>("dashboard");
  const canManage = permissions ? canManageMinistries(permissions) : false;
  const canManageTeam = permissions ? canManageMembers(permissions) : false;
  const canManageMinistryEvents = permissions
    ? canCreateMinistryActivity(permissions, ministryId)
    : false;
  const canManageRosters =
    permissions && ministry
      ? canManageMinistryRoster(permissions, ministry.id)
      : false;
  const hasRoster = ministry?.hasRoster ?? false;

  useEffect(() => {
    const requested = searchParams.get("section");
    if (requested === "availability" && ministry?.hasRoster) {
      setSection("availability");
    }
  }, [searchParams, ministry?.hasRoster]);

  useEffect(() => {
    if (section === "availability" && ministry && !ministry.hasRoster) {
      setSection("dashboard");
    }
  }, [ministry, section]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="h-48 w-full lg:w-56" />
          <Skeleton className="h-96 flex-1" />
        </div>
      </div>
    );
  }

  if (isError || !ministry) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">Ministério não encontrado.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={AUTH_ROUTES.ministries}>Voltar para ministérios</Link>
        </Button>
      </div>
    );
  }

  const activeSection = MINISTRY_SETTINGS_SECTIONS.find((item) => item.id === section);

  return (
    <div className="space-y-6">
      <Link
        href={AUTH_ROUTES.ministries}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Ministérios
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold">{ministry.name}</h1>
        {hasRoster && <Badge variant="secondary">Escalas</Badge>}
        {!ministry.isActive && (
          <Badge variant="outline">Inativo</Badge>
        )}
      </div>

      {!canManage && !canManageTeam && (
        <p className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Você está em modo leitura. Pastores e administradores podem editar o ministério;
          secretários podem gerenciar a equipe.
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SettingsNav
          active={section}
          onChange={setSection}
          hasRoster={hasRoster}
        />

        <Separator className="lg:hidden" />

        <div className="min-w-0 flex-1 space-y-4">
          {activeSection && (
            <div className="lg:hidden">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {activeSection.label}
              </p>
            </div>
          )}

          {section === "dashboard" && (
            <MinistryDashboardSection
              ministry={ministry}
              onGoToMembers={() => setSection("members")}
              onGoToAvailability={() => setSection("availability")}
            />
          )}
          {section === "availability" && hasRoster && (
            <WorshipAvailabilitySection
              ministryId={ministry.id}
              canManage={canManageMinistryEvents}
              canManageRosters={canManageRosters}
            />
          )}
          {section === "members" && (
            <MinistryMembersSection ministry={ministry} canManage={canManageTeam} />
          )}
          {section === "overview" && (
            <MinistryOverviewSection ministry={ministry} canManage={canManage} />
          )}
          {section === "roles" && (
            <RolesSection ministry={ministry} canManage={canManage} />
          )}
          {section === "permissions" && (
            <MinistryRolePermissionsSection
              ministry={ministry}
              canManage={canManage}
            />
          )}
          {section === "advanced" && (
            <AdvancedSection ministry={ministry} canManage={canManage} />
          )}
        </div>
      </div>
    </div>
  );
}
