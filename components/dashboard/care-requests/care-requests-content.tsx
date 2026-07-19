"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  HandHeart,
  Inbox,
  Send,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { CreateCareRequestModal } from "@/components/dashboard/care-requests/create-care-request-modal";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { MemberDetailButton } from "@/components/dashboard/members/member-detail-link";
import {
  SideRailNav,
  type SideRailItem,
} from "@/components/dashboard/side-rail-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAckCareViewedMine,
  useCareInbox,
  useCareRecipients,
  useCareViewedMineCount,
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

type CareTab = "ask" | "mine" | "inbox";

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function recipientInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
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

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-domain-communication-subtle text-domain-communication-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function PanelIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-2.5 h-px w-8 bg-domain-members" />
      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function CareRequestsContent() {
  const { permissions, user } = useAuth();
  const canReceive =
    Boolean(user?.isOwner) || Boolean(permissions?.counseling?.receive);
  const shouldReduceMotion = useReducedMotion();

  const [tab, setTab] = useState<CareTab>("ask");
  const [tabReady, setTabReady] = useState(false);
  const [selectedRecipient, setSelectedRecipient] =
    useState<CareRequestRecipient | null>(null);
  const [confirmViewRequest, setConfirmViewRequest] =
    useState<CareRequest | null>(null);

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
  const { data: viewedCount } = useCareViewedMineCount();
  const ackViewed = useAckCareViewedMine();
  const ackViewedMutate = ackViewed.mutate;
  const ackedViewedRef = useRef(false);
  const defaultTabApplied = useRef(false);

  const confirmingView =
    markViewed.isPending &&
    confirmViewRequest != null &&
    markViewed.variables === confirmViewRequest.id;

  const pendingInboxCount = inbox.filter((r) => r.status === "pending").length;
  const awaitingMineCount = myRequests.filter(
    (r) => r.status === "pending",
  ).length;

  // Abre na caixa de entrada se houver pedidos aguardando (só quem recebe).
  useEffect(() => {
    if (defaultTabApplied.current || loadingInbox) return;
    if (!canReceive) {
      defaultTabApplied.current = true;
      setTabReady(true);
      return;
    }

    defaultTabApplied.current = true;
    if (pendingInboxCount > 0) {
      setTab("inbox");
    }
    setTabReady(true);
  }, [canReceive, loadingInbox, pendingInboxCount]);

  useEffect(() => {
    if (tab === "inbox" && !canReceive) {
      setTab("ask");
    }
  }, [canReceive, tab]);

  useEffect(() => {
    if ((viewedCount?.count ?? 0) <= 0) {
      ackedViewedRef.current = false;
      return;
    }

    if (ackedViewedRef.current) {
      return;
    }

    ackedViewedRef.current = true;
    ackViewedMutate();
  }, [viewedCount?.count, ackViewedMutate]);

  const navItems: SideRailItem<CareTab>[] = [
    {
      id: "ask",
      label: "Pedir apoio",
      shortLabel: "Pedir",
      hint: "Quem pode te ouvir",
      icon: HandHeart,
    },
    {
      id: "mine",
      label: "Meus pedidos",
      shortLabel: "Meus",
      hint: "Acompanhe a leitura",
      icon: Send,
      badge: awaitingMineCount,
    },
    ...(canReceive
      ? [
          {
            id: "inbox" as const,
            label: "Recebidos",
            shortLabel: "Recebidos",
            hint: "Confirme a leitura",
            icon: Inbox,
            badge: pendingInboxCount,
            highlightBadge: pendingInboxCount > 0,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-7">
      <DashboardPageIntro
        eyebrow="Cuidado pastoral"
        title="Aconselhamentos"
        description="Peça apoio pastoral e acompanhe suas solicitações com discreção."
        domain="members"
      />

      <div className="md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:items-start md:gap-8">
        <SideRailNav
          items={navItems}
          active={tab}
          onChange={setTab}
          tone="communication"
          ariaLabel="Seções de aconselhamento"
          mobileEqual
        />

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {tabReady ? (
              <motion.div
                key={tab}
                role="tabpanel"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? undefined : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
              {tab === "ask" && (
                <section>
                  <PanelIntro
                    title="Pedir um olhar pastoral"
                    description="Escolha alguém que possa te ouvir — aconselhamento ou visita."
                  />

                  {loadingRecipients && (
                    <div className="overflow-hidden rounded-2xl border border-border/80">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-16 rounded-none border-b border-border last:border-b-0"
                        />
                      ))}
                    </div>
                  )}

                  {recipientsError && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                      {recipientsErr instanceof Error
                        ? recipientsErr.message
                        : "Não foi possível carregar a lista."}
                    </div>
                  )}

                  {!loadingRecipients &&
                    !recipientsError &&
                    recipients.length === 0 && (
                      <EmptyState
                        icon={HandHeart}
                        title="Ninguém disponível no momento"
                        description="Não há pessoas aptas a receber pedidos agora. Vale tentar de novo em breve."
                      />
                    )}

                  {!loadingRecipients && recipients.length > 0 && (
                    <ul className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
                      {recipients.map((recipient) => (
                        <li
                          key={recipient.id}
                          className="border-b border-border/70 last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedRecipient(recipient)}
                            className="group flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-domain-communication-subtle/35 sm:px-5"
                          >
                            <div
                              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-domain-communication-subtle text-xs font-semibold tracking-wide text-domain-communication-foreground"
                              aria-hidden
                            >
                              {recipientInitials(recipient.name)}
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
                            <MemberDetailButton
                              memberId={recipient.id}
                              memberName={recipient.name}
                              stopPropagation
                            />
                            <span className="hidden items-center gap-1 text-sm font-medium text-domain-communication-foreground sm:inline-flex">
                              Pedir
                              <ChevronRight
                                className="size-4 transition-transform group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground sm:hidden" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {tab === "mine" && (
                <section>
                  <PanelIntro
                    title="Meus pedidos"
                    description="Veja se já leram — e fique tranquilo enquanto o contato chega."
                  />

                  {loadingMine && (
                    <div className="space-y-2.5">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-24 w-full rounded-2xl"
                        />
                      ))}
                    </div>
                  )}

                  {mineError && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                      {mineErr instanceof Error
                        ? mineErr.message
                        : "Não foi possível carregar seus pedidos."}
                    </div>
                  )}

                  {!loadingMine && !mineError && myRequests.length === 0 && (
                    <EmptyState
                      icon={Send}
                      title="Você ainda não enviou nenhum pedido"
                      description="Quando precisar, peça apoio na aba Pedir — o acompanhamento aparece aqui."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTab("ask")}
                        >
                          Pedir apoio
                        </Button>
                      }
                    />
                  )}

                  {!loadingMine && myRequests.length > 0 && (
                    <ul className="space-y-2.5">
                      {myRequests.map((request) => (
                        <li
                          key={request.id}
                          className="rounded-2xl border border-border/80 bg-card px-4 py-4 shadow-xs sm:px-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2.5">
                            <div className="min-w-0">
                              <p className="inline-flex flex-wrap items-center gap-1 font-medium text-foreground">
                                {CARE_REQUEST_TYPE_LABELS[request.type]}
                                <span className="font-normal text-muted-foreground">
                                  {" "}
                                  com {request.recipient.name}
                                </span>
                                <MemberDetailButton
                                  memberId={request.recipient.id}
                                  memberName={request.recipient.name}
                                  className="size-7"
                                />
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatRequestDate(request.createdAt)}
                              </p>
                              {request.message ? (
                                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
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
              )}

              {tab === "inbox" && canReceive && (
                <section>
                  <PanelIntro
                    title="Pedidos recebidos"
                    description="Confirme a leitura quando puder — isso tranquiliza quem pediu."
                  />

                  {loadingInbox && (
                    <div className="space-y-2.5">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-24 w-full rounded-2xl"
                        />
                      ))}
                    </div>
                  )}

                  {inboxError && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                      {inboxErr instanceof Error
                        ? inboxErr.message
                        : "Não foi possível carregar os pedidos recebidos."}
                    </div>
                  )}

                  {!loadingInbox && !inboxError && inbox.length === 0 && (
                    <EmptyState
                      icon={Inbox}
                      title="Nenhum pedido por aqui ainda"
                      description="Quando alguém pedir aconselhamento ou visita, o pedido aparece nesta lista."
                    />
                  )}

                  {!loadingInbox && inbox.length > 0 && (
                    <ul className="space-y-2.5">
                      {inbox.map((request) => {
                        const isPending = request.status === "pending";

                        return (
                          <li
                            key={request.id}
                            className={cn(
                              "rounded-2xl border bg-card px-4 py-4 shadow-xs sm:px-5",
                              isPending
                                ? "border-domain-communication/30 ring-1 ring-domain-communication/10"
                                : "border-border/80",
                            )}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="inline-flex flex-wrap items-center gap-1 font-medium text-foreground">
                                  {CARE_REQUEST_TYPE_LABELS[request.type]}
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    de {request.requester.name}
                                  </span>
                                  <MemberDetailButton
                                    memberId={request.requester.id}
                                    memberName={request.requester.name}
                                    className="size-7"
                                  />
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {formatRequestDate(request.createdAt)}
                                </p>
                                {request.message ? (
                                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                                    {request.message}
                                  </p>
                                ) : null}
                                {!isPending ? (
                                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-foreground">
                                    <CheckCircle2
                                      className="size-3.5"
                                      aria-hidden
                                    />
                                    Leitura confirmada
                                  </p>
                                ) : null}
                              </div>

                              {isPending ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() =>
                                    setConfirmViewRequest(request)
                                  }
                                >
                                  Confirmar leitura
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
            </motion.div>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
            </div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {confirmViewRequest ? (
        <FinanceConfirmDialog
          title="Confirmar leitura?"
          description={
            <>
              <p>
                {confirmViewRequest.requester.name} será notificado de que você
                leu o pedido.
              </p>
              <p className="mt-2">
                Ao confirmar, planeje a{" "}
                {confirmViewRequest.type === "visit"
                  ? "visita"
                  : "conversa de aconselhamento"}
                — esse próximo passo é o que realmente acolhe quem pediu.
              </p>
            </>
          }
          confirmLabel="Confirmar leitura"
          confirmingLabel="Confirmando…"
          tone="neutral"
          icon={Eye}
          isPending={confirmingView}
          onCancel={() => {
            if (!confirmingView) setConfirmViewRequest(null);
          }}
          onConfirm={() => {
            void markViewed
              .mutateAsync(confirmViewRequest.id)
              .then(() => setConfirmViewRequest(null));
          }}
        />
      ) : null}

      <CreateCareRequestModal
        recipient={selectedRecipient}
        open={Boolean(selectedRecipient)}
        onClose={() => setSelectedRecipient(null)}
        onCreated={() => setTab("mine")}
      />
    </div>
  );
}
