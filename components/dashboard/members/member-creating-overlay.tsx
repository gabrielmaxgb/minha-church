"use client";

import { UserPlus } from "lucide-react";

import { BusyOverlay } from "@/components/ui/busy-overlay";

const stepsWithLogin = [
  "Salvando o cadastro pastoral...",
  "Liberando o acesso ao painel...",
  "Gerando as credenciais de login...",
] as const;

const stepsSimple = ["Salvando o cadastro..."] as const;

interface MemberCreatingOverlayProps {
  active: boolean;
  requiresLogin: boolean;
}

export function MemberCreatingOverlay({
  active,
  requiresLogin,
}: MemberCreatingOverlayProps) {
  return (
    <BusyOverlay
      active={active}
      icon={UserPlus}
      steps={requiresLogin ? stepsWithLogin : stepsSimple}
    />
  );
}
