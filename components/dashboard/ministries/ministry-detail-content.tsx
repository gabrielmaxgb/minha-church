"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  Shield,
  Trash2,
  Users,
} from "lucide-react";

import {
  MinistryDashboardSection,
  MinistryMembersSection,
} from "@/components/dashboard/ministries/ministry-dashboard-section";
import { MinistryEventsSection } from "@/components/dashboard/ministries/ministry-events-section";
import { MinistryOverviewSection } from "@/components/dashboard/ministries/ministry-overview-section";
import { MinistryRolesSettingsSection } from "@/components/dashboard/ministries/ministry-roles-settings-section";
import { MinistryServiceFunctionsSection } from "@/components/dashboard/ministries/ministry-service-functions-section";
import { InactiveMinistryBanner } from "@/components/dashboard/ministries/inactive-ministry-banner";
import { WorshipAvailabilitySection } from "@/components/dashboard/ministries/worship-availability-section";
import {
  SideRailNav,
  type SideRailGroup,
} from "@/components/dashboard/side-rail-nav";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useDeleteMinistry,
  useMinistry,
  useUpdateMinistry,
} from "@/lib/api/queries";
import {
  MINISTRY_SETTINGS_GROUPS,
  MINISTRY_SETTINGS_SECTIONS,
  type MinistrySettingsSection,
} from "@/lib/ministries/constants";
import {
  canManageMinistries,
  canManageMinistryRoles,
  canManageMinistryRoster,
  canManageMinistryTeam,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Ministry } from "@/types/ministries";

interface MinistryDetailContentProps {
  ministryId: string;
}

const SECTION_ICONS = {
  dashboard: LayoutDashboard,
  availability: CalendarDays,
  events: Calendar,
  members: Users,
  "service-functions": ListChecks,
  overview: FileText,
  roles: Shield,
  advanced: AlertTriangle,
} as const;

const SECTION_SHORT: Record<MinistrySettingsSection, string> = {
  dashboard: "Painel",
  availability: "Escalas",
  events: "Eventos",
  members: "Equipe",
  "service-functions": "Funções",
  overview: "Geral",
  roles: "Cargos",
  advanced: "Avançado",
};

const SECTION_HINTS: Record<MinistrySettingsSection, string> = {
  dashboard: "Resumo e atalhos",
  availability: "Disponibilidade e montagem",
  events: "Cultos, ensaios e agendas",
  members: "Pessoas deste ministério",
  "service-functions": "Como a equipe serve",
  overview: "Nome, descrição e status",
  roles: "Quem administra",
  advanced: "Ações irreversíveis",
};

function buildMinistryNavGroups(): SideRailGroup<MinistrySettingsSection>[] {
  return MINISTRY_SETTINGS_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: MINISTRY_SETTINGS_SECTIONS.filter(
      (item) => item.group === group.id,
    ).map((item) => ({
      id: item.id,
      label: item.label,
      shortLabel: SECTION_SHORT[item.id],
      hint: SECTION_HINTS[item.id],
      icon: SECTION_ICONS[item.id],
      tone: item.id === "advanced" ? ("danger" as const) : undefined,
    })),
  }));
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
          Excluir um ministério remove cargos e vínculos. Eventos ficam sem
          ministério associado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canManage ? (
          <p className="text-sm text-muted-foreground">
            Apenas pastores e administradores podem excluir ministérios.
          </p>
        ) : (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium">Excluir ministério</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta ação é permanente. Digite{" "}
              <span className="font-medium text-foreground">{ministry.name}</span>{" "}
              para confirmar.
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
                {deleteMinistry.isPending
                  ? "Excluindo..."
                  : "Excluir ministério"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MinistryDetailContent({
  ministryId,
}: MinistryDetailContentProps) {
  const { permissions } = useAuth();
  const searchParams = useSearchParams();
  const { data: ministry, isLoading, isError } = useMinistry(ministryId);
  const [section, setSection] = useState<MinistrySettingsSection>("dashboard");
  const updateMinistry = useUpdateMinistry(ministryId);
  const canManage = permissions ? canManageMinistries(permissions) : false;
  const canManageTeam =
    permissions && ministry
      ? canManageMinistryTeam(permissions, ministry.id)
      : false;
  const canManageRoles =
    permissions && ministry
      ? canManageMinistryRoles(permissions, ministry.id)
      : false;
  const canManageRosters =
    permissions && ministry
      ? canManageMinistryRoster(permissions, ministry.id)
      : false;

  useEffect(() => {
    const requested = searchParams.get("section");
    if (requested === "availability") {
      setSection("availability");
    }
    if (requested === "events") {
      setSection("events");
    }
    if (requested === "service-functions") {
      setSection("service-functions");
    }
    if (requested === "permissions" || requested === "roles") {
      setSection("roles");
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="h-48 w-full md:w-56" />
          <Skeleton className="h-96 flex-1" />
        </div>
      </div>
    );
  }

  if (isError || !ministry) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ministério não encontrado.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={AUTH_ROUTES.ministries}>Voltar para ministérios</Link>
        </Button>
      </div>
    );
  }

  const inactive = !ministry.isActive;
  const navGroups = buildMinistryNavGroups();

  return (
    <div className="space-y-6">
      <Link
        href={AUTH_ROUTES.ministries}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Ministérios e Grupos de serviço
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="page-title">{ministry.name}</h1>
        {inactive && <Badge variant="outline">Inativo</Badge>}
      </div>

      {inactive && (
        <InactiveMinistryBanner
          ministryName={ministry.name}
          onActivate={
            canManage
              ? () => void updateMinistry.mutateAsync({ isActive: true })
              : undefined
          }
          isActivating={updateMinistry.isPending}
        />
      )}

      <div
        className={cn(
          "md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:items-start md:gap-8",
          inactive && "pointer-events-none select-none opacity-60",
        )}
        aria-hidden={inactive || undefined}
      >
        <SideRailNav
          groups={navGroups}
          active={section}
          onChange={setSection}
          tone="ministries"
          ariaLabel="Seções do ministério"
        />

        <div className="min-w-0 space-y-4">
          {section === "dashboard" && (
            <MinistryDashboardSection
              ministry={ministry}
              onGoToMembers={() => setSection("members")}
              onGoToAvailability={() => setSection("availability")}
              onGoToEvents={() => setSection("events")}
            />
          )}
          {section === "availability" && (
            <WorshipAvailabilitySection
              ministryId={ministry.id}
              canManageRosters={canManageRosters}
            />
          )}
          {section === "events" && (
            <MinistryEventsSection ministry={ministry} />
          )}
          {section === "members" && (
            <MinistryMembersSection
              ministry={ministry}
              canManage={canManageTeam}
            />
          )}
          {section === "service-functions" && (
            <MinistryServiceFunctionsSection
              ministry={ministry}
              canManage={canManageRosters}
            />
          )}
          {section === "overview" && (
            <MinistryOverviewSection
              ministry={ministry}
              canManage={canManage}
            />
          )}
          {section === "roles" && (
            <MinistryRolesSettingsSection
              ministry={ministry}
              canManage={canManageRoles}
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
