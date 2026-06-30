"use client";

import Link from "next/link";
import { Calendar, MapPin, Sparkles } from "lucide-react";

import { StatCard } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardHomePage() {
  const { data, isLoading, isError } = useDashboardSummary();

  return (
    <DashboardPage title="Dashboard" subtitle="Visão geral da sua igreja">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Membros cadastrados"
                value={String(data?.memberCount ?? 0)}
              />
              <StatCard
                label="Membros ativos"
                value={String(data?.activeMembers ?? 0)}
                hint="Membros recebidos"
              />
              <StatCard
                label="Próximas atividades"
                value={String(data?.upcomingEvents ?? 0)}
              />
              <StatCard
                label="Saldo do mês"
                value={formatCurrency(data?.monthlyBalance ?? 0)}
              />
            </>
          )}
        </div>

        {!isLoading && (data?.featuredEvents.length ?? 0) > 0 && (
          <section className="rounded-xl border border-foreground/15 bg-muted/20 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <h2 className="font-medium">Destaques da igreja</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atividades da igreja inteira — não vinculadas a um ministério.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={AUTH_ROUTES.activities}>Ver todas</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {data?.featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border bg-background px-4 py-3"
                >
                  <p className="font-medium">{event.name}</p>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-4">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="size-3.5" />
                      {formatDateTime(event.startsAt)}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o resumo. Verifique se o backend está rodando.
          </p>
        )}
      </div>
    </DashboardPage>
  );
}
