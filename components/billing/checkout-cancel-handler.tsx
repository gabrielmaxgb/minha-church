"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SettingsAlert } from "@/components/dashboard/settings/settings-shared";

export function CheckoutCancelHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    if (searchParams.get("checkout") !== "canceled") {
      return;
    }

    handledRef.current = true;
    setMessage(
      "Checkout cancelado — nenhuma cobrança foi feita. Você pode assinar quando quiser.",
    );

    const section = searchParams.get("section");
    const nextUrl = section
      ? `/app/configuracoes?section=${section}`
      : "/app/configuracoes?section=subscription";

    router.replace(nextUrl, { scroll: false });
  }, [router, searchParams]);

  if (!message) {
    return null;
  }

  return (
    <SettingsAlert
      message={message}
    />
  );
}
