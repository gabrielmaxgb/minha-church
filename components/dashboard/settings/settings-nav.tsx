"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { canManageChurchRoles } from "@/lib/permissions";
import type { UserPermissions } from "@/types/auth";

export type SettingsSection =
  | "profile"
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
}

const ALL_ITEMS: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Perfil",
    description: "Seus dados pessoais",
  },
  {
    id: "ministries",
    label: "Ministérios e Grupos de serviço",
    description: "Funções em que você serve",
  },
  {
    id: "roles",
    label: "Cargos",
    description: "Permissões por cargo",
  },
  {
    id: "members",
    label: "Usuários",
    description: "Cargos e permissões",
  },
  {
    id: "pending-users",
    label: "Últimos usuários adicionados",
    description: "Senhas temporárias pendentes",
  },
  {
    id: "password-reset-requests",
    label: "Solicitações de senha",
    description: "Recuperação sem e-mail",
  },
  {
    id: "activity",
    label: "Atividade",
    description: "Histórico de mudanças",
  },
  {
    id: "general",
    label: "Geral",
    description: "Informações da igreja",
  },
];

export function useSettingsNav(permissions: UserPermissions | null) {
  return useMemo(() => {
    return ALL_ITEMS.filter((item) => {
      if (item.id === "profile" || item.id === "ministries") {
        return true;
      }

      if (item.id === "roles") {
        return canManageChurchRoles(permissions ?? emptyPermissions);
      }

      if (item.id === "members" || item.id === "pending-users" || item.id === "password-reset-requests") {
        return canManageChurchMemberships(permissions);
      }

      if (item.id === "activity" || item.id === "general") {
        return permissions?.settings.access ?? false;
      }

      return false;
    });
  }, [permissions]);
}

const emptyPermissions: UserPermissions = {
  dashboard: { access: false },
  members: { access: false, manage: false },
  ministries: { access: false, manage: false, rosterMinistryIds: [] },
  activities: { access: false, createChurchWide: false, ministryIds: [] },
  schedules: { access: false },
  finances: { access: false },
  communication: { access: false },
  reports: { access: false },
  settings: { access: false },
  roles: { manage: false },
  memberships: { manage: false },
};

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
): SettingsSection {
  return items.find((item) => item.id === "profile")?.id ?? items[0]?.id ?? "profile";
}

export function isSettingsSection(value: string): value is SettingsSection {
  return ALL_ITEMS.some((item) => item.id === value);
}
