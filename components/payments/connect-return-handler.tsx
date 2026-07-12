"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";
import { useSyncConnectAccount } from "@/lib/api/queries";

/**
 * Trata o retorno do onboarding hospedado do Stripe Connect.
 * `?connect=return` → força um sync com o Stripe e limpa a URL.
 * `?connect=refresh` → link expirou; apenas limpa a URL (o card mostra "Continuar cadastro").
 */
export function ConnectReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sync = useSyncConnectAccount();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    const connectParam = searchParams.get("connect");

    if (connectParam !== "return" && connectParam !== "refresh") {
      return;
    }

    handledRef.current = true;

    if (connectParam === "return") {
      void sync.mutateAsync().catch(() => {
        // Silencioso: a query de status é revalidada ao focar a janela.
      });
    }

    router.replace(`${AUTH_ROUTES.settings}?section=recebimentos`, {
      scroll: false,
    });
  }, [router, searchParams, sync]);

  return null;
}
