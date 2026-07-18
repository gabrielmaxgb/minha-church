"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query. Returns `false` during SSR / first paint
 * to avoid hydration mismatches (mobile-first layout that upgrades on mount).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Tailwind `lg` — desktop dashboard shell (sidebar visible). */
export function useIsDesktopDashboard(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
