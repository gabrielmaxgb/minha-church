"use client";

import Link from "next/link";

import { settingsSectionPath } from "@/constants/routes";
import { useConnectStatus } from "@/lib/api/queries";

export function usePaidEventRegistrationGate() {
  const { data: connect, isPending } = useConnectStatus();
  const canChargePaidRegistration = Boolean(connect?.canReceivePayments);

  return {
    isPending,
    canChargePaidRegistration,
    receivablesHref: settingsSectionPath("recebimentos"),
  };
}

export function PaidRegistrationReceivablesHint({
  href,
}: {
  href: string;
}) {
  return (
    <p className="text-xs text-attention-foreground">
      Para cobrar inscrição,{" "}
      <Link href={href} className="font-medium underline underline-offset-2">
        ative os recebimentos
      </Link>{" "}
      da igreja primeiro. Inscrição gratuita continua disponível.
    </p>
  );
}
