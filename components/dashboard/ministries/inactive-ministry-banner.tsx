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
        "flex flex-col gap-3 rounded-lg border border-attention-border bg-attention-subtle px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-attention-border bg-attention-mark text-attention-foreground">
          <PowerOff className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-attention-foreground">
            {ministryName ? `${ministryName} está inativo` : "Ministério inativo"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
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
          className="shrink-0 border-attention-border bg-card hover:bg-attention-mark/40"
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
          className="shrink-0 border-attention-border bg-card hover:bg-attention-mark/40"
        >
          <Link href={ministryHref}>Abrir ministério</Link>
        </Button>
      ) : null}
    </div>
  );
}
