"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { RequireActiveMember } from "@/components/auth/require-active-member";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { PaymentMethodBadges } from "@/components/dashboard/finances/fund-payment-methods-field";
import { MemberGivingCheckoutDialog } from "@/components/dashboard/tithes/member-giving-checkout-dialog";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberGivingFunds } from "@/lib/api/queries";
import type { MemberGivingFund } from "@/lib/api/payments";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { cn } from "@/lib/utils";

import "@/app/doar/giving.css";

const EASE = [0.22, 1, 0.36, 1] as const;

export function TithesOfferingsContent() {
  const { locked } = useFeatureLock();
  const fundsQuery = useMemberGivingFunds({ enabled: !locked });
  const [selected, setSelected] = useState<MemberGivingFund | null>(null);
  const reduceMotion = useReducedMotion();

  if (locked) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="font-medium text-foreground">Contribuições indisponíveis</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Os recebimentos da igreja estão temporariamente indisponíveis. Fale
          com a liderança se precisar contribuir por outro canal.
        </p>
      </div>
    );
  }

  if (fundsQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (fundsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar os fundos. Recarregue a página ou verifique se
        sua ficha pastoral está ativa.
      </FormAlert>
    );
  }

  const funds = fundsQuery.data ?? [];

  return (
    <div className="giving-root -mx-1 space-y-7 rounded-3xl px-1">
      <DashboardPageIntro
        eyebrow="Contribuição registrada"
        title="Escolha um fundo"
        description="Você contribui logado — o valor fica no fundo e na sua ficha pastoral."
        domain="finances"
        accentClassName="bg-[var(--giving-trust)]"
      />

      {funds.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Nenhum fundo para membros ativos no momento. Quando a liderança
          criar, eles aparecerão aqui.
        </p>
      ) : (
        <ul className="grid gap-3">
          {funds.map((fund, index) => (
            <motion.li
              key={fund.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: EASE,
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(fund)}
                className={cn(
                  "group flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs transition-colors",
                  "hover:border-[color-mix(in_srgb,var(--giving-trust)_35%,var(--border))]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--giving-trust)]/35",
                )}
              >
                <div className="relative hidden min-h-24 w-1.5 shrink-0 self-stretch bg-[var(--giving-ink)] sm:block">
                  <div className="absolute inset-0 bg-[var(--giving-trust)]/40" />
                </div>
                <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
                  <p className="font-display text-base font-semibold tracking-tight text-foreground">
                    {fund.name}
                  </p>
                  {fund.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {fund.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Contribuição vinculada à sua ficha
                    </p>
                  )}
                  <div className="mt-2">
                    <PaymentMethodBadges methods={fund.paymentMethods} />
                  </div>
                </div>
                <span className="mr-4 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--giving-ink)] px-3 py-1.5 text-xs font-medium text-[var(--giving-paper)] transition-transform group-hover:translate-x-0.5 sm:mr-5">
                  Contribuir
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {selected ? (
        <MemberGivingCheckoutDialog
          fund={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

export function TithesOfferingsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireActiveMember>{children}</RequireActiveMember>;
}
