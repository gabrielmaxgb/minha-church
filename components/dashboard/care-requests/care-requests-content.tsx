"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

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
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="size-4" aria-hidden />
        Visualizada — aguarde o contato
      </span>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">Aguardando visualização</span>
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
          <h2 className="text-base font-semibold text-foreground">Pedir ajuda</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Escolha alguém habilitado a receber pedidos de aconselhamento ou visita.
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
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Ninguém com permissão para receber pedidos está disponível no momento.
          </div>
        )}

        {!loadingRecipients && recipients.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {recipients.map((recipient) => (
              <button
                key={recipient.id}
                type="button"
                onClick={() => setSelectedRecipient(recipient)}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40"
              >
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
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Minhas solicitações
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe se o pedido já foi visualizado.
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
              : "Não foi possível carregar suas solicitações."}
          </div>
        )}

        {!loadingMine && !mineError && myRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Você ainda não enviou nenhuma solicitação.
          </div>
        )}

        {!loadingMine && myRequests.length > 0 && (
          <ul className="space-y-2">
            {myRequests.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {CARE_REQUEST_TYPE_LABELS[request.type]} ·{" "}
                      {request.recipient.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRequestDate(request.createdAt)}
                    </p>
                    {request.message && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    )}
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
            <h2 className="text-base font-semibold text-foreground">Recebidas</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Marque como visualizada para o solicitante saber que você viu o pedido.
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
                : "Não foi possível carregar a caixa de entrada."}
            </div>
          )}

          {!loadingInbox && !inboxError && inbox.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
              Nenhuma solicitação recebida ainda.
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
                      "rounded-xl border border-border bg-background px-4 py-3",
                      isPending && "border-foreground/20",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {CARE_REQUEST_TYPE_LABELS[request.type]} ·{" "}
                          {request.requester.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRequestDate(request.createdAt)}
                        </p>
                        {request.message && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {request.message}
                          </p>
                        )}
                        {!isPending && (
                          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="size-4" aria-hidden />
                            Visualizada
                          </p>
                        )}
                      </div>

                      {isPending && (
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
                              Salvando...
                            </>
                          ) : (
                            "Marcar como visualizada"
                          )}
                        </Button>
                      )}
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
