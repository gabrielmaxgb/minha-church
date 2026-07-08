"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

export function SettingsContent() {
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

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <SettingsNav
        items={navItems}
        active={active}
        onChange={setActive}
      />

      <div className="min-w-0 flex-1">
        {active === "profile" && <ProfileSettings />}
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
