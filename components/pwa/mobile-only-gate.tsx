"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * PWA install guide is phone/tablet only — desktop visitors are redirected.
 * Resolves the viewport on mount to avoid flashing the guide on desktop.
 */
export function MobileOnlyGate({
  children,
  desktopHref,
  fallback = null,
}: {
  children: ReactNode;
  desktopHref: string;
  fallback?: ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    function sync() {
      if (media.matches) {
        setAllowed(false);
        router.replace(desktopHref);
        return;
      }

      setAllowed(true);
    }

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [desktopHref, router]);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
