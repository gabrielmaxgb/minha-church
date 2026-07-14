"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMyGivingDonations, useMyMember } from "@/lib/api/queries";
import { formatCurrency } from "@/lib/utils";

import { SettingsPanel, SettingsSectionHeader } from "./settings-shared";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Em processamento",
  succeeded: "Confirmada",
  failed: "Não concluída",
  canceled: "Cancelada",
  refunded: "Estornada",
};

function statusVariant(
  status: string,
): "success" | "outline" | "danger" | "secondary" {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
    case "canceled":
      return "danger";
    case "processing":
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
}

export function MyContributionsSettings() {
  const myMember = useMyMember();
  const donationsQuery = useMyGivingDonations();

  const hasMemberRecord = Boolean(myMember.data?.id);
  const donations = donationsQuery.data ?? [];
  const confirmedTotalCents = donations
    .filter((donation) => donation.status === "succeeded")
    .reduce((sum, donation) => sum + donation.amountCents, 0);

  return (
    <div>
      <SettingsSectionHeader
        title="Minhas contribuições"
        description="Dízimos, ofertas e doações que você fez a esta igreja."
        action={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={AUTH_ROUTES.tithesOfferings}>
              <HeartHandshake className="size-3.5" aria-hidden />
              Contribuir
            </Link>
          </Button>
        }
      />

      {myMember.isPending || donationsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : null}

      {myMember.isError ? (
        <FormAlert>
          Não foi possível carregar sua ficha pastoral. Recarregue a página.
        </FormAlert>
      ) : null}

      {!myMember.isPending && !myMember.isError && !hasMemberRecord ? (
        <SettingsPanel>
          <div className="px-4 py-8 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para ver contribuições vinculadas à sua ficha, é preciso ter um
              cadastro pastoral nesta igreja.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href={AUTH_ROUTES.tithesOfferings}>Ir a Dízimos e ofertas</Link>
            </Button>
          </div>
        </SettingsPanel>
      ) : null}

      {hasMemberRecord && donationsQuery.isError ? (
        <FormAlert>
          Não foi possível carregar suas contribuições. Recarregue a página.
        </FormAlert>
      ) : null}

      {hasMemberRecord && !donationsQuery.isPending && !donationsQuery.isError ? (
        <div className="space-y-4">
          {donations.length > 0 ? (
            <div className="rounded-xl border border-domain-finances/20 bg-domain-finances-subtle/60 px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-domain-finances-foreground uppercase">
                Confirmado nesta igreja
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(confirmedTotalCents / 100)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Soma só das contribuições com pagamento confirmado.
              </p>
            </div>
          ) : null}

          <SettingsPanel>
            <ul className="divide-y divide-border/70">
              {donations.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Você ainda não tem contribuições registradas por aqui.
                    Quando doar em Dízimos e ofertas, elas aparecem nesta lista.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link href={AUTH_ROUTES.tithesOfferings}>
                      Ir a Dízimos e ofertas
                    </Link>
                  </Button>
                </li>
              ) : (
                donations.map((donation) => (
                  <li
                    key={donation.id}
                    className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(donation.amountCents / 100)}
                        </p>
                        <Badge variant={statusVariant(donation.status)}>
                          {STATUS_LABEL[donation.status] ?? donation.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {donation.fundName}
                        {donation.donorMemberId
                          ? " · pelo app"
                          : " · link público"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(donation.createdAt))}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </SettingsPanel>
        </div>
      ) : null}
    </div>
  );
}
