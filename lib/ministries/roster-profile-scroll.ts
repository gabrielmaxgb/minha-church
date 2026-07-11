import { ROSTER_PROFILE_SECTION_ID } from "@/constants/routes";

export function scrollToRosterProfileSection(): boolean {
  const element = document.getElementById(ROSTER_PROFILE_SECTION_ID);

  if (!element) {
    return false;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export function hasRosterProfileHash(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.hash === `#${ROSTER_PROFILE_SECTION_ID}`;
}
