"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toastInfo } from "@/lib/ui/toast";

export function CheckoutCancelHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    if (searchParams.get("checkout") !== "canceled") {
      return;
    }

    handledRef.current = true;
    toastInfo(
      "Checkout cancelado — nenhuma cobrança foi feita. Você pode assinar quando quiser.",
    );

    const section = searchParams.get("section");
    const nextUrl = section
      ? `/app/configuracoes?section=${section}`
      : "/app/configuracoes?section=subscription";

    router.replace(nextUrl, { scroll: false });
  }, [router, searchParams]);

  return null;
}
