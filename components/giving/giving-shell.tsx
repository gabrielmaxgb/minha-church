"use client";

import type { ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";

export type GivingShellBrand = {
  churchName: string;
  fundName: string;
  fundDescription?: string | null;
  /** Default: Contribuição segura */
  eyebrow?: string;
};

export function GivingTrustFooter() {
  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        <span className="inline-flex flex-wrap items-center gap-1">
          Pagamento criptografado · processado pelo <StripeBrandInline />
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Minha Church</p>
    </div>
  );
}

export function GivingShell({
  brand,
  children,
  brandExtra,
}: {
  brand: GivingShellBrand;
  children: ReactNode;
  brandExtra?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
    >
      <section className="relative overflow-hidden bg-[var(--giving-ink)] px-7 py-10 text-[var(--giving-paper)] sm:px-10 sm:py-14 lg:min-h-144 lg:py-16">
        <div className="giving-grain" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 top-1/4 size-64 rounded-full bg-[var(--giving-trust)]/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex h-full flex-col">
          <p className="text-xs font-medium tracking-wide text-[var(--giving-paper)]/55 uppercase">
            {brand.eyebrow ?? "Contribuição segura"}
          </p>
          <h1 className="font-display mt-6 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
            {brand.churchName}
          </h1>
          <div className="mt-6 h-px w-14 bg-[var(--giving-trust)]" />
          <p className="mt-6 text-lg font-medium tracking-tight">
            {brand.fundName}
          </p>
          {brand.fundDescription ? (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--giving-paper)]/65">
              {brand.fundDescription}
            </p>
          ) : (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--giving-paper)]/65">
              Sua contribuição chega diretamente à igreja, com registro e
              comprovante.
            </p>
          )}

          {brandExtra}

          <div className="mt-auto hidden pt-16 lg:block">
            <div className="flex items-start gap-3 text-[var(--giving-paper)]/70">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
              <p className="text-sm leading-relaxed">
                Os dados do cartão não passam pelo Minha Church. A cobrança é
                feita na conta <StripeBrandInline /> da própria igreja.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-7 py-10 sm:px-10 sm:py-14 lg:py-16">
        {children}
      </section>
    </motion.div>
  );
}
