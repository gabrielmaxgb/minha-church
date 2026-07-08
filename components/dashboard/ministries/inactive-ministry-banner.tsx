"use client";

import Link from "next/link";
import { Loader2, Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <PowerOff className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {ministryName ? `${ministryName} está inativo` : "Ministério inativo"}
          </p>
          <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/70">
            As informações estão em modo leitura. Reative o ministério para voltar a
            gerenciar cargos, equipe, atividades e escalas.
          </p>
        </div>
      </div>

      {onActivate ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-500/50 bg-background/60 hover:bg-background"
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
          className="shrink-0 border-amber-500/50 bg-background/60 hover:bg-background"
        >
          <Link href={ministryHref}>Abrir ministério</Link>
        </Button>
      ) : null}
    </div>
  );
}
