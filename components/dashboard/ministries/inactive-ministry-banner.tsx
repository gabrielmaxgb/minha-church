"use client";

import Link from "next/link";
import { Loader2, Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardBanner } from "@/components/ui/dashboard-banner";
import { cn } from "@/lib/utils";

interface InactiveMinistryBannerProps {
  ministryName?: string | null;
  onActivate?: () => void;
  isActivating?: boolean;
  ministryHref?: string;
  className?: string;
}

export function InactiveMinistryBanner({
  ministryName,
  onActivate,
  isActivating = false,
  ministryHref,
  className,
}: InactiveMinistryBannerProps) {
  return (
    <DashboardBanner
      tone="attention"
      icon={PowerOff}
      label="Ministério"
      title={ministryName ? `${ministryName} está inativo` : "Ministério inativo"}
      description="As informações estão em modo leitura. Reative o ministério para voltar a gerenciar cargos, equipe, atividades e escalas."
      action={
        onActivate ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-attention-border bg-card hover:bg-attention-mark/40"
            disabled={isActivating}
            onClick={onActivate}
          >
            {isActivating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Power className="size-4" aria-hidden />
            )}
            Ativar ministério
          </Button>
        ) : ministryHref ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-attention-border bg-card hover:bg-attention-mark/40"
          >
            <Link href={ministryHref}>Abrir ministério</Link>
          </Button>
        ) : undefined
      }
      className={cn("mb-0", className)}
    />
  );
}
