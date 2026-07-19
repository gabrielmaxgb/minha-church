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
    <section className="min-w-0">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {formatLongDate()}
        {churchName ? ` · ${churchName}` : ""}
      </p>
      <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {getTimeGreeting()}, {getFirstName(userName)}
      </h2>
      <div className="mt-3 h-px w-10 bg-domain-home" />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {homeProfileSubtitle(profile)}
      </p>
    </section>
  );
}
