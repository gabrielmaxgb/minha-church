"use client";

import { useEffect, useState } from "react";
import { CreditCard, QrCode, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { FormAlert } from "@/components/ui/form-field";
import { settingsSectionPath } from "@/constants/routes";
import type {
  ConnectCapabilityStatus,
  ConnectStatus,
  GivingFundPaymentMethods,
} from "@/lib/api/payments";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type MethodKey = keyof GivingFundPaymentMethods;

const METHODS: Array<{
  key: MethodKey;
  label: string;
  hint: string;
  icon: LucideIcon;
}> = [
  {
    key: "pix",
    label: "Pix",
    hint: "Liquidação rápida",
    icon: QrCode,
  },
  {
    key: "card",
    label: "Cartão",
    hint: "Crédito e débito",
    icon: CreditCard,
  },
  {
    key: "boleto",
    label: "Boleto",
    hint: "Pagamento bancário",
    icon: Receipt,
  },
];

function isCapabilityActive(status: ConnectCapabilityStatus | undefined) {
  return status === "active";
}

export function FundPaymentMethodsField({
  value,
  onChange,
  connect,
  disabled,
}: {
  value: GivingFundPaymentMethods;
  onChange: (next: GivingFundPaymentMethods) => void;
  connect: ConnectStatus | undefined;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.isOwner);
  const [hydrated, setHydrated] = useState(false);

  const availability = {
    pix: isCapabilityActive(connect?.capabilities.pix),
    card: isCapabilityActive(connect?.capabilities.card),
    boleto: isCapabilityActive(connect?.capabilities.boleto),
  };

  const anyAvailable =
    availability.pix || availability.card || availability.boleto;

  // Na primeira carga do Connect, marca só o que está ativo.
  useEffect(() => {
    if (!connect || hydrated) {
      return;
    }

    onChange({
      pix: availability.pix,
      card: availability.card,
      boleto: availability.boleto,
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per mount
  }, [connect, hydrated]);

  const selectedCount =
    Number(value.pix && availability.pix) +
    Number(value.card && availability.card) +
    Number(value.boleto && availability.boleto);

  return (
    <fieldset className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <legend className="text-sm font-medium text-foreground">
          Meios de pagamento
        </legend>
        <p className="text-xs text-muted-foreground">
          Só entram no checkout os meios ativos da conta.
        </p>
      </div>

      {!connect ? (
        <p className="text-sm text-muted-foreground">
          Carregando meios disponíveis…
        </p>
      ) : !anyAvailable ? (
        <FormAlert>
          <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
            Nenhum meio está ativo ainda.
            {isOwner ? (
              <>
                {" "}
                <Link
                  href={settingsSectionPath("recebimentos")}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Ativar em Recebimentos
                </Link>
              </>
            ) : (
              " Peça ao proprietário para concluir a ativação."
            )}
          </span>
        </FormAlert>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {METHODS.map((method) => {
            const available = availability[method.key];
            const checked = Boolean(value[method.key] && available);
            const Icon = method.icon;
            const inputId = `fund-method-${method.key}`;

            return (
              <label
                key={method.key}
                htmlFor={inputId}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-3 rounded-xl border px-3.5 py-3.5 transition-colors",
                  available
                    ? checked
                      ? "border-foreground/25 bg-background shadow-xs"
                      : "border-border bg-transparent hover:bg-muted/30"
                    : "cursor-not-allowed border-dashed border-border/80 bg-muted/15 opacity-70",
                  disabled && "pointer-events-none opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      available
                        ? checked
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                        : "bg-muted/60 text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || !available}
                    onChange={(event) => {
                      if (!available) {
                        return;
                      }
                      onChange({
                        ...value,
                        [method.key]: event.target.checked,
                      });
                    }}
                    className="mt-0.5 size-4 shrink-0 accent-foreground"
                  />
                </div>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {method.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {available ? method.hint : "Indisponível na conta"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {anyAvailable && selectedCount === 0 ? (
        <p className="text-sm text-destructive">
          Selecione pelo menos um meio disponível.
        </p>
      ) : null}
    </fieldset>
  );
}

export function fundPaymentMethodsSelected(
  methods: GivingFundPaymentMethods,
  connect?: ConnectStatus,
): boolean {
  if (!connect) {
    return false;
  }

  return (
    (methods.pix && connect.capabilities.pix === "active") ||
    (methods.card && connect.capabilities.card === "active") ||
    (methods.boleto && connect.capabilities.boleto === "active")
  );
}

export function paymentMethodLabels(
  methods: GivingFundPaymentMethods,
): string[] {
  return METHODS.filter((method) => methods[method.key]).map(
    (method) => method.label,
  );
}

/** Quiet meta text for list rows — not interactive chips. */
export function PaymentMethodSummary({
  methods,
  className,
}: {
  methods: GivingFundPaymentMethods;
  className?: string;
}) {
  const labels = paymentMethodLabels(methods);

  if (labels.length === 0) {
    return null;
  }

  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {labels.join(" · ")}
    </span>
  );
}

export function PaymentMethodBadges({
  methods,
}: {
  methods: GivingFundPaymentMethods;
}) {
  return <PaymentMethodSummary methods={methods} />;
}
