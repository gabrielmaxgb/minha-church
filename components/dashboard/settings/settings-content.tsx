"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

import { ProfileSettings } from "./profile-settings";
import { ProfileMinistriesSettings } from "./profile-ministries-settings";
import { PendingUsersSettings } from "./pending-users-settings";
import { PasswordResetRequestsSettings } from "./password-reset-requests-settings";
import { ChurchActivitySettings } from "./church-activity-settings";
import { ChurchMembershipsSettings } from "./church-memberships-settings";
import { ChurchRolesSettings } from "./church-roles-settings";
import {
  getDefaultSection,
  isSettingsSection,
  SettingsNav,
  useSettingsNav,
  type SettingsSection,
} from "./settings-nav";
import { SettingsGeneralPanel } from "./settings-general-panel";
import { SubscriptionSettings } from "./subscription-settings";
import { ReceivablesSettings } from "./receivables-settings";
import { CheckoutCancelHandler } from "@/components/billing/checkout-cancel-handler";
import { ConnectReturnHandler } from "@/components/payments/connect-return-handler";

export function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { permissions } = useAuth();
  const navItems = useSettingsNav(permissions);
  const [active, setActive] = useState<SettingsSection>(() =>
    getDefaultSection(navItems),
  );

  useEffect(() => {
    const sectionParam = searchParams.get("section");

    if (
      sectionParam &&
      isSettingsSection(sectionParam) &&
      navItems.some((item) => item.id === sectionParam)
    ) {
      setActive(sectionParam);
    }
  }, [navItems, searchParams]);

  useEffect(() => {
    if (!navItems.some((item) => item.id === active)) {
      setActive(getDefaultSection(navItems));
    }
  }, [active, navItems]);

  // A URL é a fonte da verdade da seção ativa: manter só o estado local diverge
  // do `?section=` e o efeito acima reverte a escolha do usuário (ex.: voltando
  // do onboarding do Connect a URL fica em `section=recebimentos`).
  const handleChangeSection = useCallback(
    (section: SettingsSection) => {
      setActive(section);
      router.replace(`${AUTH_ROUTES.settings}?section=${section}`, {
        scroll: false,
      });
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <SettingsNav
        items={navItems}
        active={active}
        onChange={handleChangeSection}
      />

      <div className="min-w-0 flex-1">
        <CheckoutCancelHandler />
        <ConnectReturnHandler />
        {active === "profile" && <ProfileSettings />}
        {active === "subscription" && <SubscriptionSettings />}
        {active === "recebimentos" && <ReceivablesSettings />}
        {active === "ministries" && <ProfileMinistriesSettings />}
        {active === "pending-users" && <PendingUsersSettings />}
        {active === "password-reset-requests" && <PasswordResetRequestsSettings />}
        {active === "roles" && <ChurchRolesSettings />}
        {active === "members" && <ChurchMembershipsSettings />}
        {active === "activity" && <ChurchActivitySettings />}
        {active === "general" && <SettingsGeneralPanel />}
      </div>
    </div>
  );
}
