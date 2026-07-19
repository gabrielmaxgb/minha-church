"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renderiza overlays no `document.body` para escapar de ancestors com
 * `transform`/`overflow` (ex.: DashboardContentMotion) que quebram
 * `position: fixed` e deixam modais atrás da sidebar mobile.
 */
export function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
