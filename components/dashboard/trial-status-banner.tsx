"use client";

import Link from "next/link";
import { Clock, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { useAuth } from "@/providers/auth-provider";

const COUNTDOWN_THRESHOLD_DAYS = 7;

export function TrialStatusBanner() {
  const { user } = useAuth();
  const { locked, subscriptionStatus, trialDaysRemaining } = useFeatureLock();

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
                Você continua com acesso total ao que já criou e pode seguir
                cadastrando membros. Para criar novos ministérios, atividades e
                escalas, escolha um plano.
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

  const showCountdown =
    subscriptionStatus === "trialing" &&
    trialDaysRemaining !== null &&
    trialDaysRemaining <= COUNTDOWN_THRESHOLD_DAYS;

  if (!showCountdown || trialDaysRemaining === null) {
    return null;
  }

  const dayLabel = trialDaysRemaining === 1 ? "dia" : "dias";

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Clock className="size-4" aria-hidden />
          </div>
          <p className="text-sm text-foreground">
            {trialDaysRemaining === 0 ? (
              <>Seu período de teste termina hoje.</>
            ) : (
              <>
                Faltam{" "}
                <span className="font-semibold">
                  {trialDaysRemaining} {dayLabel}
                </span>{" "}
                de teste gratuito.
              </>
            )}{" "}
            Assine para não perder os recursos de gestão.
          </p>
        </div>
        <div className="sm:shrink-0">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full border-amber-500/30 bg-background/80 sm:w-auto"
          >
            <Link href={PUBLIC_ROUTES.pricing}>Ver planos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
