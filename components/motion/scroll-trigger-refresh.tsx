"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ensureGsap, ScrollTrigger } from "@/lib/gsap/client";

/** Refresh ScrollTrigger after client navigations between public pages. */
export function ScrollTriggerRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    ensureGsap();
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
