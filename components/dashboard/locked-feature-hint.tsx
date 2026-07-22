"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface LockedFeatureHintProps {
  className?: string;
  /** Nome do recurso bloqueado, ex.: "criar ministérios". */
  action?: string;
}

/**
 * Explicação curta junto a um botão de criação bloqueado por trial/assinatura.
 * Em pré-visualização de cargo não renderiza (o banner já comunica só-leitura).
 */
export function LockedFeatureHint({
  className,
  action = "criar novos recursos",
}: LockedFeatureHintProps) {
  const { isPreviewingRole } = useAuth();

  if (isPreviewingRole) {
    return null;
  }

  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Lock className="size-3.5 shrink-0" aria-hidden />
      <span>
        Período de teste encerrado — para {action},{" "}
        <Link
          href={PUBLIC_ROUTES.pricing}
          className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
        >
          veja a faixa da sua igreja
        </Link>
        .
      </span>
    </p>
  );
}
