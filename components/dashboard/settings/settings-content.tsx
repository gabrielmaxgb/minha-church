"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

import { MyRolesSettings } from "./my-roles-settings";
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
  settingsBasePath,
  useSettingsNav,
  type SettingsArea,
  type SettingsSection,
} from "./settings-nav";
import { SettingsGeneralPanel } from "./settings-general-panel";
import { SubscriptionSettings } from "./subscription-settings";
import { ReceivablesSettings } from "./receivables-settings";
import { CheckoutCancelHandler } from "@/components/billing/checkout-cancel-handler";
import { ConnectReturnHandler } from "@/components/payments/connect-return-handler";

export function SettingsContent({ area }: { area: SettingsArea }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { permissions } = useAuth();
  const navItems = useSettingsNav(permissions, area);
  const [active, setActive] = useState<SettingsSection>(() =>
    getDefaultSection(navItems, area),
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
      setActive(getDefaultSection(navItems, area));
    }
  }, [active, area, navItems]);

  const handleChangeSection = useCallback(
    (section: SettingsSection) => {
      setActive(section);
      router.replace(`${settingsBasePath(area)}?section=${section}`, {
        scroll: false,
      });
    },
    [area, router],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <SettingsNav
        items={navItems}
        active={active}
        onChange={handleChangeSection}
      />

      <div className="min-w-0 flex-1">
        {area === "church" && (
          <>
            <CheckoutCancelHandler />
            <ConnectReturnHandler />
          </>
        )}
        {active === "profile" && <ProfileSettings />}
        {active === "my-roles" && <MyRolesSettings />}
        {active === "subscription" && <SubscriptionSettings />}
        {active === "recebimentos" && <ReceivablesSettings />}
        {active === "ministries" && <ProfileMinistriesSettings />}
        {active === "pending-users" && <PendingUsersSettings />}
        {active === "password-reset-requests" && (
          <PasswordResetRequestsSettings />
        )}
        {active === "roles" && <ChurchRolesSettings />}
        {active === "members" && <ChurchMembershipsSettings />}
        {active === "activity" && <ChurchActivitySettings />}
        {active === "general" && <SettingsGeneralPanel />}
      </div>
    </div>
  );
}
