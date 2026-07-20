"use client";

import { useState } from "react";
import { ArrowRight, PiggyBank } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { RequireActiveMember } from "@/components/auth/require-active-member";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { PaymentMethodSummary } from "@/components/dashboard/finances/fund-payment-methods-field";
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
      <div className="space-y-7">
        <Skeleton className="h-8 w-48" />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-48 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
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
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {funds.map((fund, index) => (
            <motion.li
              key={fund.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: EASE,
              }}
              className="h-full"
            >
              <MemberFundCard fund={fund} onSelect={() => setSelected(fund)} />
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

function MemberFundCard({
  fund,
  onSelect,
}: {
  fund: MemberGivingFund;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-domain-finances/25 bg-card text-left shadow-xs transition-colors",
        "hover:border-[color-mix(in_srgb,var(--giving-trust)_40%,var(--border))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--giving-trust)]/35",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-domain-finances-subtle/80 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-finances-subtle text-domain-finances-foreground"
            aria-hidden
          >
            <PiggyBank className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {fund.name}
            </h3>
            {fund.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {fund.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Contribuição vinculada à sua ficha
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <PaymentMethodSummary methods={fund.paymentMethods} />

          <span className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--giving-ink)] text-sm font-medium text-[var(--giving-paper)] transition-transform group-hover:translate-y-px">
            Contribuir
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

export function TithesOfferingsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireActiveMember>{children}</RequireActiveMember>;
}
