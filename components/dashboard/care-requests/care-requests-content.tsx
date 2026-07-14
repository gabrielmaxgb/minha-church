"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, Loader2 } from "lucide-react";

import { CreateCareRequestModal } from "@/components/dashboard/care-requests/create-care-request-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCareInbox,
  useCareRecipients,
  useMarkCareRequestViewed,
  useMyCareRequests,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  CARE_REQUEST_TYPE_LABELS,
  type CareRequest,
  type CareRequestRecipient,
} from "@/types/care-requests";

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function CareRequestStatusBadge({ request }: { request: CareRequest }) {
  if (request.status === "viewed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-foreground">
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
        Visto — alguém entra em contato
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Clock3 className="size-3.5 shrink-0" aria-hidden />
      Enviado — aguardando leitura
    </span>
  );
}

export function CareRequestsContent() {
  const { permissions, user } = useAuth();
  const canReceive =
    Boolean(user?.isOwner) || Boolean(permissions?.counseling?.receive);
  const [selectedRecipient, setSelectedRecipient] =
    useState<CareRequestRecipient | null>(null);

  const {
    data: recipients = [],
    isLoading: loadingRecipients,
    isError: recipientsError,
    error: recipientsErr,
  } = useCareRecipients();

  const {
    data: myRequests = [],
    isLoading: loadingMine,
    isError: mineError,
    error: mineErr,
  } = useMyCareRequests();

  const {
    data: inbox = [],
    isLoading: loadingInbox,
    isError: inboxError,
    error: inboxErr,
  } = useCareInbox({ enabled: canReceive });

  const markViewed = useMarkCareRequestViewed();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Pedir um olhar pastoral
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Escolha alguém que possa te ouvir — aconselhamento ou visita.
          </p>
        </div>

        {loadingRecipients && (
          <div className="overflow-hidden rounded-xl border border-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 rounded-none border-b border-border"
              />
            ))}
          </div>
        )}

        {recipientsError && (
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            {recipientsErr instanceof Error
              ? recipientsErr.message
              : "Não foi possível carregar a lista."}
          </div>
        )}

        {!loadingRecipients && !recipientsError && recipients.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
            No momento não há ninguém disponível para receber pedidos. Vale
            tentar de novo em breve.
          </div>
        )}

        {!loadingRecipients && recipients.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {recipients.map((recipient) => (
              <button
                key={recipient.id}
                type="button"
                onClick={() => setSelectedRecipient(recipient)}
                className="group flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-domain-communication-subtle text-xs font-semibold tracking-wide text-domain-communication-foreground"
                  aria-hidden
                >
                  {recipient.name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0] ?? "")
                    .join("")
                    .toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {recipient.name}
                  </p>
                  {recipient.roles.length > 0 && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {recipient.roles.join(" · ")}
                    </p>
                  )}
                </div>
                <span className="hidden text-sm text-muted-foreground transition-colors group-hover:text-foreground sm:inline">
                  Pedir
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Meus pedidos
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Veja se já leram — e fique tranquilo enquanto o contato chega.
          </p>
        </div>

        {loadingMine && (
          <div className="overflow-hidden rounded-xl border border-border">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-16 rounded-none border-b border-border"
              />
            ))}
          </div>
        )}

        {mineError && (
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            {mineErr instanceof Error
              ? mineErr.message
              : "Não foi possível carregar seus pedidos."}
          </div>
        )}

        {!loadingMine && !mineError && myRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
            Você ainda não enviou nenhum pedido. Quando precisar, a lista acima
            está pronta.
          </div>
        )}

        {!loadingMine && myRequests.length > 0 && (
          <ul className="space-y-2">
            {myRequests.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-border bg-card px-4 py-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {CARE_REQUEST_TYPE_LABELS[request.type]}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        com {request.recipient.name}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRequestDate(request.createdAt)}
                    </p>
                    {request.message ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {request.message}
                      </p>
                    ) : null}
                  </div>
                  <CareRequestStatusBadge request={request} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canReceive && (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Pedidos recebidos
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Confirme a leitura quando puder — isso tranquiliza quem pediu.
            </p>
          </div>

          {loadingInbox && (
            <div className="overflow-hidden rounded-xl border border-border">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 rounded-none border-b border-border"
                />
              ))}
            </div>
          )}

          {inboxError && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              {inboxErr instanceof Error
                ? inboxErr.message
                : "Não foi possível carregar os pedidos recebidos."}
            </div>
          )}

          {!loadingInbox && !inboxError && inbox.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
              Nenhum pedido por aqui ainda. Quando chegarem, aparecem nesta lista.
            </div>
          )}

          {!loadingInbox && inbox.length > 0 && (
            <ul className="space-y-2">
              {inbox.map((request) => {
                const isPending = request.status === "pending";
                const marking =
                  markViewed.isPending &&
                  markViewed.variables === request.id;

                return (
                  <li
                    key={request.id}
                    className={cn(
                      "rounded-xl border bg-card px-4 py-3.5",
                      isPending
                        ? "border-domain-communication/25"
                        : "border-border",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {CARE_REQUEST_TYPE_LABELS[request.type]}
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            de {request.requester.name}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRequestDate(request.createdAt)}
                        </p>
                        {request.message ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {request.message}
                          </p>
                        ) : null}
                        {!isPending ? (
                          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-foreground">
                            <CheckCircle2 className="size-3.5" aria-hidden />
                            Leitura confirmada
                          </p>
                        ) : null}
                      </div>

                      {isPending ? (
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0"
                          disabled={marking}
                          onClick={() => void markViewed.mutateAsync(request.id)}
                        >
                          {marking ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Confirmando…
                            </>
                          ) : (
                            "Confirmar leitura"
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <CreateCareRequestModal
        recipient={selectedRecipient}
        open={Boolean(selectedRecipient)}
        onClose={() => setSelectedRecipient(null)}
      />
    </div>
  );
}
