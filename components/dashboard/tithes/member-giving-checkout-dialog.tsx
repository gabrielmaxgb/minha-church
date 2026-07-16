"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, X } from "lucide-react";

import {
  GivingShell,
  GivingTrustFooter,
} from "@/components/giving/giving-shell";
import {
  formatBrlFromCents,
  getGivingStripe,
  GIVING_PRESET_REAIS,
  STRIPE_ELEMENTS_APPEARANCE,
  STRIPE_ELEMENTS_FONTS,
} from "@/components/giving/giving-stripe";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import type {
  GivingCheckoutSession,
  MemberGivingFund,
} from "@/lib/api/payments";
import { useCreateMemberGivingCheckout } from "@/lib/api/queries";
import {
  applyBrlCentsMask,
  formatBrlCentsMask,
  parseBrlMaskToCents,
} from "@/lib/utils";
import { resolveGivingStripeError } from "@/lib/payments/giving-stripe-errors";
import { useAuth } from "@/providers/auth-provider";

import "@/app/doar/giving.css";

export function MemberGivingCheckoutDialog({
  fund,
  onClose,
}: {
  fund: MemberGivingFund;
  onClose: () => void;
}) {
  const { church, user } = useAuth();
  const createCheckout = useCreateMemberGivingCheckout();
  const [amountMasked, setAmountMasked] = useState(() =>
    formatBrlCentsMask(5_000),
  );
  const [error, setError] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [session, setSession] = useState<GivingCheckoutSession | null>(null);

  const amountCents = parseBrlMaskToCents(amountMasked);
  const amountValid =
    amountCents >= fund.minAmountCents && amountCents <= fund.maxAmountCents;

  const brand = {
    churchName: church?.name ?? "Sua igreja",
    fundName: fund.name,
    fundDescription: fund.description,
    eyebrow: "Dízimos e ofertas",
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleStart = async () => {
    if (!amountValid) {
      setError(
        `Informe um valor entre ${formatBrlFromCents(fund.minAmountCents)} e ${formatBrlFromCents(fund.maxAmountCents)}.`,
      );
      return;
    }

    setError(null);

    try {
      const next = await createCheckout.mutateAsync({
        fundId: fund.id,
        amountCents,
        recurring: recurring || undefined,
      });
      setSession(next);
    } catch (startError) {
      setError(
        startError instanceof ApiError
          ? startError.message
          : "Não foi possível iniciar o pagamento.",
      );
    }
  };

  return (
    <div className="giving-root fixed inset-0 z-50 overflow-y-auto">
      <div className="relative mx-auto flex min-h-full w-full items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
        <button
          type="button"
          className="absolute inset-0 bg-[var(--giving-ink)]/45 backdrop-blur-[2px]"
          aria-label="Fechar"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-5xl">
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-[var(--giving-paper)]/20 bg-[var(--giving-ink)]/40 text-[var(--giving-paper)] hover:bg-[var(--giving-ink)]/60 hover:text-[var(--giving-paper)]"
              onClick={onClose}
            >
              <X className="size-3.5" />
              Fechar
            </Button>
          </div>

          {session ? (
            <MemberPaymentStep
              brand={brand}
              fund={fund}
              session={session}
              onBack={() => setSession(null)}
            />
          ) : (
            <GivingShell
              brand={brand}
              brandExtra={
                user?.name ? (
                  <div className="mt-8 rounded-xl border border-[var(--giving-paper)]/15 bg-[var(--giving-paper)]/5 px-4 py-3">
                    <p className="text-xs tracking-wide text-[var(--giving-paper)]/55 uppercase">
                      Registrado como
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-tight">
                      {user.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--giving-paper)]/55">
                      Esta contribuição fica vinculada à sua ficha pastoral.
                    </p>
                  </div>
                ) : undefined
              }
            >
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
                  {GIVING_PRESET_REAIS.map((reais) => {
                    const presetCents = reais * 100;
                    const selected = amountCents === presetCents;
                    return (
                      <Button
                        key={reais}
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        disabled={createCheckout.isPending}
                        onClick={() =>
                          setAmountMasked(formatBrlCentsMask(presetCents))
                        }
                      >
                        R$ {reais}
                      </Button>
                    );
                  })}
                </div>

                <FormField
                  label="Valor"
                  htmlFor="member-giving-amount"
                  required
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="member-giving-amount"
                      inputMode="numeric"
                      value={amountMasked}
                      onChange={(event) =>
                        setAmountMasked(applyBrlCentsMask(event.target.value))
                      }
                      placeholder="0,00"
                      disabled={createCheckout.isPending}
                      autoComplete="off"
                      className="pl-10 tabular-nums"
                    />
                  </div>
                </FormField>

                {error ? <FormAlert>{error}</FormAlert> : null}

                {fund.paymentMethods.card ? (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm transition-colors hover:bg-muted/35">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                      checked={recurring}
                      disabled={createCheckout.isPending}
                      onChange={(event) => setRecurring(event.target.checked)}
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        Contribuir mensalmente
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        Cobrança recorrente no cartão.
                      </span>
                    </span>
                  </label>
                ) : null}

                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={createCheckout.isPending || !amountValid}
                  onClick={() => void handleStart()}
                >
                  {createCheckout.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Continuar
                  {amountValid ? ` · ${formatBrlFromCents(amountCents)}` : ""}
                  {recurring && amountValid ? "/mês" : ""}
                </Button>

                <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
                  <p className="text-xs leading-relaxed">
                    Dados do cartão tratados pelo Stripe. A cobrança vai para a
                    conta da igreja, com registro na sua ficha.
                  </p>
                </div>

                <GivingTrustFooter />
              </div>
            </GivingShell>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberPaymentStep({
  brand,
  fund,
  session,
  onBack,
}: {
  brand: {
    churchName: string;
    fundName: string;
    fundDescription?: string | null;
    eyebrow?: string;
  };
  fund: MemberGivingFund;
  session: GivingCheckoutSession;
  onBack: () => void;
}) {
  const stripePromise = useMemo(
    () => getGivingStripe(session.publishableKey, session.stripeAccountId),
    [session.publishableKey, session.stripeAccountId],
  );

  return (
    <GivingShell
      brand={brand}
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
            {fund.name} · {formatBrlFromCents(session.amountCents)}
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
          <MemberConfirmPaymentForm donationId={session.donationId} />
        </Elements>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo Stripe. A cobrança vai para a conta
            da igreja, com registro na sua ficha.
          </p>
        </div>

        <GivingTrustFooter />
      </div>
    </GivingShell>
  );
}

function MemberConfirmPaymentForm({ donationId }: { donationId: string }) {
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

    const returnUrl = `${window.location.origin}${AUTH_ROUTES.tithesOfferings}/obrigado?donationId=${encodeURIComponent(donationId)}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      setError(resolveGivingStripeError(result.error));
      setSubmitting(false);
      return;
    }

    // Pagamentos sem redirect (ex.: cartão sem 3DS): ir ao recibo e validar no backend.
    window.location.assign(returnUrl);
  };

  return (
    <div className="space-y-4">
      {error ? <FormAlert>{error}</FormAlert> : null}
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
