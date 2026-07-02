"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/providers/auth-provider";

import { ProfileSettings } from "./profile-settings";
import { PendingUsersSettings } from "./pending-users-settings";
import { ChurchActivitySettings } from "./church-activity-settings";
import { ChurchMembershipsSettings } from "./church-memberships-settings";
import { ChurchRolesSettings } from "./church-roles-settings";
import {
  getDefaultSection,
  SettingsNav,
  useSettingsNav,
  type SettingsSection,
} from "./settings-nav";
import { SettingsGeneralPanel } from "./settings-general-panel";

export function SettingsContent() {
  const { permissions } = useAuth();
  const navItems = useSettingsNav(permissions);
  const [active, setActive] = useState<SettingsSection>(() =>
    getDefaultSection(navItems),
  );

  useEffect(() => {
    if (!navItems.some((item) => item.id === active)) {
      setActive(getDefaultSection(navItems));
    }
  }, [active, navItems]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <SettingsNav items={navItems} active={active} onChange={setActive} />

      <div className="min-w-0 flex-1">
        {active === "profile" && <ProfileSettings />}
        {active === "pending-users" && <PendingUsersSettings />}
        {active === "roles" && <ChurchRolesSettings />}
        {active === "members" && <ChurchMembershipsSettings />}
        {active === "activity" && <ChurchActivitySettings />}
        {active === "general" && <SettingsGeneralPanel />}
      </div>
    </div>
  );
}
