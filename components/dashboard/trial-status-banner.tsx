"use client";

import Link from "next/link";
import { Clock, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const URGENT_THRESHOLD_DAYS = 7;

function formatTrialEndDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function buildTrialCountdownMessage(
  trialDaysRemaining: number,
  trialEndsAt: string | null,
): string {
  const dayLabel = trialDaysRemaining === 1 ? "dia" : "dias";
  const endDateHint =
    trialEndsAt !== null ? ` (até ${formatTrialEndDate(trialEndsAt)})` : "";

  if (trialDaysRemaining === 0) {
    return `Seu teste gratuito termina hoje${endDateHint}.`;
  }

  if (trialDaysRemaining === 1) {
    return `Falta 1 dia de teste gratuito${endDateHint}.`;
  }

  return `Faltam ${trialDaysRemaining} ${dayLabel} de teste gratuito${endDateHint}.`;
}

export function TrialStatusBanner() {
  const { user } = useAuth();
  const {
    locked,
    subscriptionStatus,
    trialDaysRemaining,
    trialEndsAt,
  } = useFeatureLock();

  // Só o proprietário decide sobre plano — evita "barulho" para os demais.
  if (!user?.isOwner) {
    return null;
  }

  if (locked) {
    return (
      <div className="mb-6 rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
              <Lock className="size-4" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Seu período de teste terminou
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Você ainda pode consultar o painel, ver o que já criou e
                cadastrar novos membros. Para editar ministérios, atividades,
                comunicados e configurações da igreja, escolha um plano.
              </p>
            </div>
          </div>
          <div className="sm:shrink-0">
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={PUBLIC_ROUTES.pricing}>Ver planos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isTrialing =
    subscriptionStatus === "trialing" && trialDaysRemaining !== null;

  if (!isTrialing) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= URGENT_THRESHOLD_DAYS;
  const countdownMessage = buildTrialCountdownMessage(
    trialDaysRemaining,
    trialEndsAt,
  );

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border px-4 py-4 sm:px-5",
        isUrgent
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-sky-500/25 bg-sky-500/8",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
              isUrgent
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-sky-500/15 text-sky-700 dark:text-sky-300",
            )}
          >
            {isUrgent ? (
              <Clock className="size-4" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Você está no período de teste gratuito
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {countdownMessage}{" "}
              {isUrgent
                ? "Assine um plano para não perder os recursos de gestão quando o teste acabar."
                : "Explore o painel com calma — quando quiser, veja os planos e continue sem interrupções."}
            </p>
          </div>
        </div>
        <div className="sm:shrink-0">
          <Button
            asChild
            size="sm"
            variant="outline"
            className={cn(
              "w-full bg-background/80 sm:w-auto",
              isUrgent
                ? "border-amber-500/30"
                : "border-sky-500/25",
            )}
          >
            <Link href={PUBLIC_ROUTES.pricing}>Ver planos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
