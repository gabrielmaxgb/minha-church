"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { givingFundPath } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import {
  createGivingCheckout,
  type GivingCheckoutSession,
  type PublicGivingFund,
} from "@/lib/api/payments";
import {
  applyBrlCentsMask,
  formatBrlCentsMask,
  parseBrlMaskToCents,
} from "@/lib/utils";

const PRESET_REAIS = [20, 50, 100, 200, 500] as const;

/** Stripe iframes não herdam next/font — carrega DM Sans igual ao app. */
const STRIPE_ELEMENTS_FONTS = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap",
  },
] as const;

const STRIPE_ELEMENTS_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2f5a43",
    colorBackground: "#ffffff",
    colorText: "#141413",
    colorTextSecondary: "#6f6f6a",
    colorTextPlaceholder: "#6f6f6a",
    colorDanger: "#8f4444",
    borderRadius: "8px",
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: "14px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",
  },
  rules: {
    ".Label": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      fontSize: "14px",
      fontWeight: "500",
    },
    ".Input": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    ".Tab": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    ".TabLabel": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
};

function formatBrlFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

type StripeCacheKey = string;
const stripePromises = new Map<StripeCacheKey, Promise<Stripe | null>>();

function getStripe(
  publishableKey: string,
  stripeAccountId: string,
): Promise<Stripe | null> {
  const key = `${publishableKey}:${stripeAccountId}`;
  let promise = stripePromises.get(key);
  if (!promise) {
    promise = loadStripe(publishableKey, { stripeAccount: stripeAccountId });
    stripePromises.set(key, promise);
  }
  return promise;
}

function GivingTrustFooter() {
  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        <span>Pagamento criptografado · processado pelo Stripe</span>
      </div>
      <p className="text-xs text-muted-foreground">Minha Church</p>
    </div>
  );
}

function GivingShell({
  fund,
  children,
  brandExtra,
}: {
  fund: PublicGivingFund;
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
            Contribuição segura
          </p>
          <h1 className="font-display mt-6 max-w-md text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {fund.churchName}
          </h1>
          <div className="mt-6 h-px w-14 bg-[var(--giving-trust)]" />
          <p className="mt-6 text-lg font-medium tracking-tight">
            {fund.fundName}
          </p>
          {fund.fundDescription ? (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--giving-paper)]/65">
              {fund.fundDescription}
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
                feita na conta Stripe da própria igreja.
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

export function GivingCheckoutForm({ fund }: { fund: PublicGivingFund }) {
  const [amountMasked, setAmountMasked] = useState(() =>
    formatBrlCentsMask(5_000),
  );
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<GivingCheckoutSession | null>(null);

  const amountCents = parseBrlMaskToCents(amountMasked);
  const amountValid =
    amountCents >= fund.minAmountCents && amountCents <= fund.maxAmountCents;

  const handleStartCheckout = async () => {
    if (!amountValid) {
      setError(
        `Informe um valor entre ${formatBrlFromCents(fund.minAmountCents)} e ${formatBrlFromCents(fund.maxAmountCents)}.`,
      );
      return;
    }

    setError(null);
    setStarting(true);

    try {
      const next = await createGivingCheckout(fund.churchSlug, fund.fundSlug, {
        amountCents,
        payerName: payerName.trim() || undefined,
        payerEmail: payerEmail.trim() || undefined,
      });
      setSession(next);
    } catch (startError) {
      setError(
        startError instanceof ApiError
          ? startError.message
          : "Não foi possível iniciar o pagamento.",
      );
    } finally {
      setStarting(false);
    }
  };

  if (session) {
    return (
      <CheckoutPaymentStep
        fund={fund}
        session={session}
        onBack={() => setSession(null)}
      />
    );
  }

  return (
    <GivingShell fund={fund}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Valor da contribuição
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mínimo {formatBrlFromCents(fund.minAmountCents)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_REAIS.map((reais) => {
            const presetCents = reais * 100;
            const selected = amountCents === presetCents;
            return (
              <Button
                key={reais}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                disabled={starting}
                onClick={() =>
                  setAmountMasked(formatBrlCentsMask(presetCents))
                }
              >
                R$ {reais}
              </Button>
            );
          })}
        </div>

        <FormField label="Valor" htmlFor="giving-amount" required>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              id="giving-amount"
              inputMode="numeric"
              value={amountMasked}
              onChange={(event) =>
                setAmountMasked(applyBrlCentsMask(event.target.value))
              }
              placeholder="0,00"
              disabled={starting}
              autoComplete="off"
              className="pl-10 tabular-nums"
            />
          </div>
        </FormField>

        {error && <FormAlert>{error}</FormAlert>}

        <FormField label="Nome" htmlFor="payer-name">
          <Input
            id="payer-name"
            value={payerName}
            onChange={(event) => setPayerName(event.target.value)}
            placeholder="Como deseja aparecer no registro"
            disabled={starting}
          />
        </FormField>

        <FormField label="E-mail para comprovante" htmlFor="payer-email">
          <Input
            id="payer-email"
            type="email"
            value={payerEmail}
            onChange={(event) => setPayerEmail(event.target.value)}
            placeholder="Opcional"
            disabled={starting}
          />
        </FormField>

        <Button
          type="button"
          className="w-full gap-2"
          disabled={starting || !amountValid}
          onClick={() => void handleStartCheckout()}
        >
          {starting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continuar
          {amountValid ? ` · ${formatBrlFromCents(amountCents)}` : ""}
        </Button>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo Stripe. A cobrança vai para a conta
            da igreja.
          </p>
        </div>

        <GivingTrustFooter />
      </div>
    </GivingShell>
  );
}

function CheckoutPaymentStep({
  fund,
  session,
  onBack,
}: {
  fund: PublicGivingFund;
  session: GivingCheckoutSession;
  onBack: () => void;
}) {
  const stripePromise = useMemo(
    () => getStripe(session.publishableKey, session.stripeAccountId),
    [session.publishableKey, session.stripeAccountId],
  );

  return (
    <GivingShell
      fund={fund}
      brandExtra={
        <div className="mt-8 rounded-xl border border-[var(--giving-paper)]/15 bg-[var(--giving-paper)]/5 px-4 py-3">
          <p className="text-xs tracking-wide text-[var(--giving-paper)]/55 uppercase">
            Valor
          </p>
          <p className="font-display mt-1 text-2xl font-bold tracking-tight">
            {formatBrlFromCents(session.amountCents)}
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={onBack}
          >
            Alterar valor
          </button>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">
            Forma de pagamento
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fund.fundName} · {formatBrlFromCents(session.amountCents)}
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: session.clientSecret,
            fonts: [...STRIPE_ELEMENTS_FONTS],
            appearance: STRIPE_ELEMENTS_APPEARANCE,
            locale: "pt-BR",
          }}
        >
          <ConfirmPaymentForm fund={fund} />
        </Elements>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo Stripe. A cobrança vai para a conta
            da igreja.
          </p>
        </div>

        <GivingTrustFooter />
      </div>
    </GivingShell>
  );
}

function ConfirmPaymentForm({ fund }: { fund: PublicGivingFund }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const returnUrl = `${window.location.origin}${givingFundPath(fund.churchSlug, fund.fundSlug)}/obrigado`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      setError(
        result.error.message ??
          "Não foi possível confirmar o pagamento. Tente novamente.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <FormAlert>{error}</FormAlert>}
      <PaymentElement options={{ layout: "tabs" }} />
      <Button
        type="button"
        className="w-full gap-2"
        disabled={!stripe || !elements || submitting}
        onClick={() => void handlePay()}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirmar contribuição
      </Button>
    </div>
  );
}
