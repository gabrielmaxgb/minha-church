"use client";

import {
  formatLongDate,
  getFirstName,
  getTimeGreeting,
} from "@/lib/dashboard/date-utils";
import type { DashboardHomeProfile } from "@/lib/dashboard/home-profile";
import { homeProfileSubtitle } from "@/lib/dashboard/home-profile";

interface DashboardHeroProps {
  userName: string;
  churchName: string;
  profile: DashboardHomeProfile;
}

export function DashboardHero({
  userName,
  churchName,
  profile,
}: DashboardHeroProps) {
  return (
    <section className="min-w-0 space-y-1">
      <p className="text-xs text-muted-foreground">
        {formatLongDate()}
        {churchName ? ` · ${churchName}` : ""}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {getTimeGreeting()}, {getFirstName(userName)}
      </h2>
      <p className="text-sm text-muted-foreground">
        {homeProfileSubtitle(profile)}
      </p>
    </section>
  );
}
