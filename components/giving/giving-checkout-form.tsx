"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
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
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { givingFundPath, PUBLIC_ROUTES } from "@/constants/routes";
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
import { resolveGivingStripeError } from "@/lib/payments/giving-stripe-errors";
import { toastApiError, toastError } from "@/lib/ui/toast";
import { useAuth } from "@/providers/auth-provider";

export function GivingCheckoutForm({ fund }: { fund: PublicGivingFund }) {
  const { user, church, isAuthenticated, isLoading: authLoading } = useAuth();
  const isMemberOfThisChurch =
    isAuthenticated &&
    Boolean(church?.slug) &&
    church!.slug === fund.churchSlug &&
    Boolean(user);

  const [amountMasked, setAmountMasked] = useState(() =>
    formatBrlCentsMask(5_000),
  );
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [contributeAnonymously, setContributeAnonymously] = useState(false);
  const [starting, setStarting] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [session, setSession] = useState<GivingCheckoutSession | null>(null);
  const [didPrefill, setDidPrefill] = useState(false);

  useEffect(() => {
    if (authLoading || didPrefill || !isMemberOfThisChurch || !user) {
      return;
    }
    setPayerName(user.name);
    setPayerEmail(user.email);
    setDidPrefill(true);
  }, [authLoading, didPrefill, isMemberOfThisChurch, user]);

  const linkToMember = isMemberOfThisChurch && !contributeAnonymously;

  const amountCents = parseBrlMaskToCents(amountMasked);
  const amountValid =
    amountCents >= fund.minAmountCents && amountCents <= fund.maxAmountCents;

  const brand = {
    churchName: fund.churchName,
    fundName: fund.fundName,
    fundDescription: fund.fundDescription,
  };

  const methodsLabel = [
    fund.paymentMethods.pix ? "Pix" : null,
    fund.paymentMethods.card ? "Cartão" : null,
    fund.paymentMethods.boleto ? "Boleto" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleStartCheckout = async () => {
    if (!amountValid) {
      toastError(
        `Informe um valor entre ${formatBrlFromCents(fund.minAmountCents)} e ${formatBrlFromCents(fund.maxAmountCents)}.`,
      );
      return;
    }

    setStarting(true);

    try {
      const next = await createGivingCheckout(fund.churchSlug, fund.fundSlug, {
        amountCents,
        payerName: linkToMember
          ? undefined
          : payerName.trim() || undefined,
        payerEmail: linkToMember
          ? undefined
          : payerEmail.trim() || undefined,
        recurring: recurring || undefined,
        anonymous: contributeAnonymously || undefined,
      });
      setSession(next);
    } catch (startError) {
      toastApiError(startError, "Não foi possível iniciar o pagamento.");
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
    <GivingShell
      brand={brand}
      brandExtra={
        methodsLabel ? (
          <p className="mt-8 text-xs tracking-wide text-[var(--giving-paper)]/55 uppercase">
            Aceita {methodsLabel}
          </p>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {isMemberOfThisChurch && !contributeAnonymously ? (
          <div className="rounded-xl border border-domain-finances/30 bg-domain-finances-subtle/60 px-3.5 py-3">
            <p className="text-sm font-medium text-foreground">
              Contribuindo como {user?.name}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Esta contribuição será vinculada à sua ficha na igreja.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-foreground underline-offset-4 hover:underline"
              disabled={starting}
              onClick={() => setContributeAnonymously(true)}
            >
              Continuar sem identificar
            </button>
          </div>
        ) : null}

        {isMemberOfThisChurch && contributeAnonymously ? (
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3">
            <p className="text-sm text-muted-foreground">
              Contribuição sem vínculo à ficha.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-foreground underline-offset-4 hover:underline"
              disabled={starting}
              onClick={() => setContributeAnonymously(false)}
            >
              Voltar a contribuir como {user?.name}
            </button>
          </div>
        ) : null}

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

        {!linkToMember ? (
          <>
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

            <p className="text-xs leading-relaxed text-muted-foreground">
              Nome e e-mail (se informados) ficam registrados para a igreja
              identificar a contribuição e, quando possível, enviar comprovante.
              A igreja é a controladora desses dados; o Minha Church opera a
              plataforma. Cartão e dados de pagamento são tratados pelo{" "}
              <StripeBrandInline />. Veja a{" "}
              <a
                href={PUBLIC_ROUTES.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Usaremos o nome e e-mail da sua conta. Cartão e dados de pagamento
            são tratados pelo <StripeBrandInline />.
          </p>
        )}

        {fund.paymentMethods.card ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm transition-colors hover:bg-muted/35">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
              checked={recurring}
              disabled={starting}
              onChange={(event) => setRecurring(event.target.checked)}
            />
            <span>
              <span className="font-medium text-foreground">
                Contribuir mensalmente
              </span>
              <span className="mt-0.5 block text-muted-foreground">
                Cobrança recorrente no cartão de crédito. Pix e boleto ficam só
                na doação avulsa.
              </span>
            </span>
          </label>
        ) : null}

        <Button
          type="button"
          className="w-full gap-2"
          disabled={starting || !amountValid}
          onClick={() => void handleStartCheckout()}
        >
          {starting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continuar
          {amountValid ? ` · ${formatBrlFromCents(amountCents)}` : ""}
          {recurring && amountValid ? "/mês" : ""}
        </Button>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo <StripeBrandInline />. A cobrança vai
            para a conta da igreja.
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
    () => getGivingStripe(session.publishableKey, session.stripeAccountId),
    [session.publishableKey, session.stripeAccountId],
  );

  return (
    <GivingShell
      brand={{
        churchName: fund.churchName,
        fundName: fund.fundName,
        fundDescription: fund.fundDescription,
      }}
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
            {session.mode === "subscription" ? " /mês" : ""}
          </p>
          {session.mode === "subscription" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Use um{" "}
              <span className="font-medium text-foreground">
                cartão de crédito
              </span>
              . Débito costuma falhar nas cobranças mensais automáticas.
            </p>
          ) : null}
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
          <ConfirmPaymentForm
            fund={fund}
            donationId={session.donationId}
            receiptToken={session.receiptToken}
          />
        </Elements>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo <StripeBrandInline />. A cobrança vai
            para a conta da igreja.
          </p>
        </div>

        <GivingTrustFooter />
      </div>
    </GivingShell>
  );
}

function ConfirmPaymentForm({
  fund,
  donationId,
  receiptToken,
}: {
  fund: PublicGivingFund;
  donationId: string;
  receiptToken: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    const returnUrl = `${window.location.origin}${givingFundPath(fund.churchSlug, fund.fundSlug)}/obrigado?donationId=${encodeURIComponent(donationId)}&rt=${encodeURIComponent(receiptToken)}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      toastError(resolveGivingStripeError(result.error));
      setSubmitting(false);
      return;
    }

    window.location.assign(returnUrl);
  };

  return (
    <div className="space-y-4">
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
