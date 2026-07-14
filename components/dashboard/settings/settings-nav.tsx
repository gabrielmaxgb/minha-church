"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { canManageChurchRoles } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { UserPermissions } from "@/types/auth";

export type SettingsArea = "church" | "user";

export type SettingsSection =
  | "profile"
  | "my-roles"
  | "subscription"
  | "recebimentos"
  | "ministries"
  | "pending-users"
  | "password-reset-requests"
  | "roles"
  | "members"
  | "activity"
  | "general";

export interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  description: string;
  area: SettingsArea;
}

const ALL_ITEMS: SettingsNavItem[] = [
  {
    id: "general",
    label: "Geral",
    description: "Dados e identificação da igreja",
    area: "church",
  },
  {
    id: "subscription",
    label: "Assinatura",
    description: "Plano e cobrança",
    area: "church",
  },
  {
    id: "recebimentos",
    label: "Recebimentos",
    description: "Dízimos, doações e eventos",
    area: "church",
  },
  {
    id: "roles",
    label: "Cargos",
    description: "Permissões por cargo",
    area: "church",
  },
  {
    id: "members",
    label: "Usuários",
    description: "Acesso e cargos",
    area: "church",
  },
  {
    id: "pending-users",
    label: "Últimos usuários adicionados",
    description: "Senhas temporárias pendentes",
    area: "church",
  },
  {
    id: "password-reset-requests",
    label: "Solicitações de senha",
    description: "Recuperação sem e-mail",
    area: "church",
  },
  {
    id: "activity",
    label: "Atividade",
    description: "Histórico de mudanças",
    area: "church",
  },
  {
    id: "profile",
    label: "Perfil",
    description: "Seus dados pessoais",
    area: "user",
  },
  {
    id: "my-roles",
    label: "Meus cargos",
    description: "Igreja e ministérios",
    area: "user",
  },
  {
    id: "ministries",
    label: "Funções de serviço",
    description: "Onde você pode servir na escala",
    area: "user",
  },
];

const emptyPermissions: UserPermissions = {
  dashboard: { access: false },
  members: { access: false, manage: false },
  ministries: {
    access: false,
    manage: false,
    rosterMinistryIds: [],
    teamMinistryIds: [],
    rolesMinistryIds: [],
  },
  activities: { access: false, createChurchWide: false, ministryIds: [] },
  schedules: { access: false },
  finances: { access: false },
  communication: { access: false, manage: false },
  reports: { access: false },
  settings: { access: false },
  roles: { manage: false },
  memberships: { manage: false },
  counseling: { receive: false },
};

export function useSettingsNav(
  permissions: UserPermissions | null,
  area: SettingsArea,
) {
  const { church, user } = useAuth();
  const writesBlocked = Boolean(church?.featuresLocked);
  const canAccessChurchSettings =
    Boolean(user?.isOwner) || Boolean(permissions?.settings.access);

  return useMemo(() => {
    return ALL_ITEMS.filter((item) => {
      if (item.area !== area) {
        return false;
      }

      if (writesBlocked) {
        if (area === "user") {
          return item.id === "profile" || item.id === "my-roles";
        }

        // Conta travada: manter só Assinatura (para reativar) e Geral
        // (leitura), e apenas para quem pode acessar as configs da igreja.
        if (!canAccessChurchSettings) {
          return false;
        }

        if (item.id === "subscription") {
          return Boolean(user?.isOwner);
        }

        return item.id === "general";
      }

      if (area === "church" && !canAccessChurchSettings) {
        return false;
      }

      if (item.id === "subscription" || item.id === "recebimentos") {
        return Boolean(user?.isOwner);
      }

      if (item.id === "profile" || item.id === "ministries" || item.id === "my-roles") {
        return true;
      }

      if (item.id === "roles") {
        return canManageChurchRoles(permissions ?? emptyPermissions);
      }

      if (
        item.id === "members" ||
        item.id === "pending-users" ||
        item.id === "password-reset-requests"
      ) {
        return canManageChurchMemberships(permissions);
      }

      if (item.id === "activity" || item.id === "general") {
        return canAccessChurchSettings;
      }

      return false;
    });
  }, [
    area,
    canAccessChurchSettings,
    permissions,
    user?.isOwner,
    writesBlocked,
  ]);
}

export function SettingsNav({
  items,
  active,
  onChange,
}: {
  items: SettingsNavItem[];
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}) {
  return (
    <nav className="flex shrink-0 flex-col gap-0.5 sm:w-48">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-lg px-3 py-2.5 text-left transition-colors",
            active === item.id
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <span className="block text-sm font-medium">{item.label}</span>
          <span className="mt-0.5 block text-xs opacity-80">
            {item.description}
          </span>
        </button>
      ))}
    </nav>
  );
}

export function getDefaultSection(
  items: SettingsNavItem[],
  area: SettingsArea,
): SettingsSection {
  if (area === "user") {
    return items.find((item) => item.id === "profile")?.id ?? items[0]?.id ?? "profile";
  }

  return (
    items.find((item) => item.id === "general")?.id ??
    items.find((item) => item.id === "recebimentos")?.id ??
    items[0]?.id ??
    "general"
  );
}

export function isSettingsSection(value: string): value is SettingsSection {
  return ALL_ITEMS.some((item) => item.id === value);
}

export function settingsBasePath(area: SettingsArea): string {
  return area === "user"
    ? "/app/configuracoes/usuario"
    : "/app/configuracoes/igreja";
}
