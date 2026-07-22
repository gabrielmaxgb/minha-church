"use client";

import { useMemo } from "react";
import {
  BadgeCheck,
  Building2,
  CreditCard,
  HandCoins,
  History,
  KeyRound,
  Layers,
  Shield,
  User,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import {
  SideRailNav,
  type SideRailItem,
} from "@/components/dashboard/side-rail-nav";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { canManageChurchRoles } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { UserPermissions } from "@/types/auth";

export type SettingsArea = "church" | "user";

export type SettingsSection =
  | "profile"
  | "my-roles"
  | "my-contributions"
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
  shortLabel?: string;
  icon?: LucideIcon;
}

const ALL_ITEMS: SettingsNavItem[] = [
  {
    id: "general",
    label: "Geral",
    shortLabel: "Geral",
    description: "Dados da igreja",
    area: "church",
    icon: Building2,
  },
  {
    id: "subscription",
    label: "Assinatura",
    shortLabel: "Plano",
    description: "Plano e cobrança",
    area: "church",
    icon: CreditCard,
  },
  {
    id: "recebimentos",
    label: "Recebimentos",
    shortLabel: "Receber",
    description: "Dízimos e doações",
    area: "church",
    icon: Wallet,
  },
  {
    id: "roles",
    label: "Cargos",
    shortLabel: "Cargos",
    description: "Permissões por cargo",
    area: "church",
    icon: Shield,
  },
  {
    id: "members",
    label: "Usuários",
    shortLabel: "Usuários",
    description: "Acesso e cargos",
    area: "church",
    icon: Users,
  },
  {
    id: "pending-users",
    label: "Últimos usuários",
    shortLabel: "Pendentes",
    description: "Senhas temporárias",
    area: "church",
    icon: UserPlus,
  },
  {
    id: "password-reset-requests",
    label: "Solicitações de senha",
    shortLabel: "Senhas",
    description: "Recuperação sem e-mail",
    area: "church",
    icon: KeyRound,
  },
  {
    id: "activity",
    label: "Atividade",
    shortLabel: "Atividade",
    description: "Cargos, dinheiro e acessos",
    area: "church",
    icon: History,
  },
  {
    id: "profile",
    label: "Perfil",
    shortLabel: "Perfil",
    description: "Seus dados pessoais",
    area: "user",
    icon: User,
  },
  {
    id: "my-roles",
    label: "Meus cargos",
    shortLabel: "Cargos",
    description: "Igreja e ministérios",
    area: "user",
    icon: BadgeCheck,
  },
  {
    id: "my-contributions",
    label: "Minhas contribuições",
    shortLabel: "Doações",
    description: "Ofertas e doações",
    area: "user",
    icon: HandCoins,
  },
  {
    id: "ministries",
    label: "Funções de serviço",
    shortLabel: "Servir",
    description: "Onde você pode servir",
    area: "user",
    icon: Layers,
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
  finances: { access: false, manage: false },
  communication: { access: false, manage: false },
  reports: { access: false },
  settings: { access: false },
  roles: { manage: false },
  memberships: { manage: false },
  counseling: { receive: false },
  pastoralCare: { access: false },
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
          return (
            item.id === "profile" ||
            item.id === "my-roles" ||
            item.id === "my-contributions"
          );
        }

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

      if (
        item.id === "profile" ||
        item.id === "ministries" ||
        item.id === "my-roles" ||
        item.id === "my-contributions"
      ) {
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
  const railItems: SideRailItem<SettingsSection>[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    shortLabel: item.shortLabel ?? item.label,
    hint: item.description,
    icon: item.icon,
  }));

  return (
    <SideRailNav
      items={railItems}
      active={active}
      onChange={onChange}
      tone="settings"
      ariaLabel="Seções de configurações"
    />
  );
}

export function getDefaultSection(
  items: SettingsNavItem[],
  area: SettingsArea,
): SettingsSection {
  if (area === "user") {
    return (
      items.find((item) => item.id === "profile")?.id ??
      items[0]?.id ??
      "profile"
    );
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
