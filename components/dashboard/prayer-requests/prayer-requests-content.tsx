"use client";

import { useId, useState } from "react";
import {
  Archive,
  Check,
  HandHeart,
  Heart,
  Loader2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useArchivePrayerRequest,
  useCreatePrayerRequest,
  useDeletePrayerRequest,
  usePrayerRequests,
  useTogglePrayerRequestPray,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type {
  PrayerRequest,
  PrayerRequestBoardStatus,
} from "@/types/prayer-requests";

const BODY_MAX = 1000;

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function authorLabel(request: PrayerRequest): string {
  if (request.isAnonymous && !request.author) {
    return "Anônimo";
  }

  if (request.isAnonymous && request.author) {
    return `${request.author.name} (anônimo para outros)`;
  }

  return request.author?.name ?? "Membro";
}

function authorInitials(request: PrayerRequest): string {
  const name = request.author?.name?.trim();
  if (!name || (request.isAnonymous && !request.author)) {
    return "";
  }

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function AuthorMark({ request }: { request: PrayerRequest }) {
  const anonymousToOthers = request.isAnonymous && !request.author;
  const initials = authorInitials(request);

  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-wide",
        anonymousToOthers
          ? "bg-domain-communication-subtle text-domain-communication-foreground"
          : "bg-muted text-foreground",
      )}
      aria-hidden
    >
      {anonymousToOthers || !initials ? (
        <HandHeart className="size-4" strokeWidth={2} />
      ) : (
        initials
      )}
    </span>
  );
}

function PrayerRequestCard({
  request,
  onPray,
  onDelete,
  onArchive,
  praying,
  deleting,
  archiving,
}: {
  request: PrayerRequest;
  onPray: () => void;
  onDelete: () => void;
  onArchive: () => void;
  praying: boolean;
  deleting: boolean;
  archiving: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
      <div className="flex items-start gap-3">
        <AuthorMark request={request} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {authorLabel(request)}
              </p>
              <time
                dateTime={request.createdAt}
                className="mt-0.5 block text-xs text-muted-foreground"
              >
                {formatRequestDate(request.createdAt)}
                {request.isArchived && request.archivedAt
                  ? ` · arquivado em ${formatRequestDate(request.archivedAt)}`
                  : null}
              </time>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {request.canArchive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={onArchive}
                  disabled={archiving}
                  aria-label="Arquivar pedido"
                  title="Arquivar"
                >
                  {archiving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Archive className="size-4" />
                  )}
                </Button>
              ) : null}
              {request.canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                  onClick={onDelete}
                  disabled={deleting}
                  aria-label="Remover pedido"
                >
                  {deleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">
            {request.body}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Button
              type="button"
              size="sm"
              variant={request.prayedByMe ? "secondary" : "outline"}
              className={cn(
                "h-9 gap-2 rounded-lg px-3 font-medium shadow-xs transition-[transform,background-color,border-color] active:scale-[0.98]",
                request.prayedByMe
                  ? "border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/12 hover:text-destructive"
                  : "hover:border-domain-communication/40 hover:bg-domain-communication-subtle/60 hover:text-domain-communication-foreground",
              )}
              onClick={onPray}
              disabled={praying}
              aria-pressed={request.prayedByMe}
            >
              {praying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : request.prayedByMe ? (
                <Heart className="size-4 fill-current" aria-hidden />
              ) : (
                <HandHeart className="size-4" aria-hidden />
              )}
              {request.prayedByMe ? "Estou orando" : "Orar"}
            </Button>

            {request.prayerCount > 0 ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {request.prayerCount === 1
                  ? "1 pessoa orando"
                  : `${request.prayerCount} pessoas orando`}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Seja o primeiro a orar
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PrayerRequestsContent() {
  const anonymousId = useId();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [board, setBoard] = useState<PrayerRequestBoardStatus>("active");
  const [prayingId, setPrayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = usePrayerRequests(board);

  const createRequest = useCreatePrayerRequest();
  const togglePray = useTogglePrayerRequestPray(board);
  const deleteRequest = useDeletePrayerRequest();
  const archiveRequest = useArchivePrayerRequest();

  const trimmedLength = body.trim().length;
  const canPublish = trimmedLength > 0 && !createRequest.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmed = body.trim();
    if (!trimmed) {
      setFormError("Escreva seu pedido de oração.");
      return;
    }

    try {
      await createRequest.mutateAsync({
        body: trimmed,
        isAnonymous,
      });
      setBody("");
      setIsAnonymous(false);
      setBoard("active");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível publicar o pedido.",
      );
    }
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/70 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-domain-communication-subtle text-domain-communication-foreground">
              <HandHeart className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Compartilhar pedido
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                A igreja pode se unir em oração. Pedidos ficam no quadro ativo
                por 30 dias.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-4 py-4 sm:px-5 sm:py-5"
        >
          <div className="space-y-2">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Pelo que você gostaria de oração?"
              maxLength={BODY_MAX}
              rows={4}
              disabled={createRequest.isPending}
              className="min-h-28 resize-y rounded-xl border-border/80 bg-background text-[0.95rem] leading-relaxed shadow-none focus-visible:ring-domain-communication/30"
            />
            <div className="flex justify-end">
              <span
                className={cn(
                  "text-[11px] tabular-nums text-muted-foreground",
                  body.length > BODY_MAX * 0.9 && "text-attention-foreground",
                )}
              >
                {body.length}/{BODY_MAX}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              id={anonymousId}
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous((value) => !value)}
              disabled={createRequest.isPending}
              className={cn(
                "inline-flex h-9 w-fit items-center gap-2.5 rounded-lg border px-3 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isAnonymous
                  ? "border-domain-communication/35 bg-domain-communication-subtle text-domain-communication-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "relative flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isAnonymous
                    ? "border-domain-communication bg-domain-communication text-white"
                    : "border-muted-foreground/40 bg-background",
                )}
                aria-hidden
              >
                {isAnonymous ? <Check className="size-3 stroke-[3]" /> : null}
              </span>
              Publicar de forma anônima
            </button>

            <Button
              type="submit"
              disabled={!canPublish}
              className="h-9 min-w-28 gap-2 shadow-xs active:scale-[0.98]"
            >
              {createRequest.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publicando…
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          </div>

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Quadro de oração
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {board === "active"
                ? "Pedidos dos últimos 30 dias. Toque em Orar para interceder."
                : "Histórico arquivado — você ainda pode orar por esses pedidos."}
            </p>
          </div>

          <div
            className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5"
            role="tablist"
            aria-label="Filtrar quadro"
          >
            {(
              [
                { id: "active", label: "Ativos" },
                { id: "archived", label: "Arquivados" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={board === tab.id}
                onClick={() => setBoard(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  board === tab.id
                    ? "bg-background font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os pedidos."}
          </p>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-domain-communication-subtle text-domain-communication-foreground">
              {board === "archived" ? (
                <Archive className="size-5" aria-hidden />
              ) : (
                <HandHeart className="size-5" aria-hidden />
              )}
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">
              {board === "archived"
                ? "Nenhum pedido arquivado"
                : "Ainda não há pedidos no quadro"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {board === "archived"
                ? "Depois de 30 dias, ou quando alguém arquivar, os pedidos aparecem aqui."
                : "Seja o primeiro a compartilhar. Pedidos ficam ativos por 30 dias."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs tabular-nums text-muted-foreground">
              {requests.length === 1
                ? "1 pedido"
                : `${requests.length} pedidos`}
            </p>
            {requests.map((request) => (
              <PrayerRequestCard
                key={request.id}
                request={request}
                praying={prayingId === request.id && togglePray.isPending}
                deleting={deletingId === request.id && deleteRequest.isPending}
                archiving={
                  archivingId === request.id && archiveRequest.isPending
                }
                onPray={async () => {
                  setPrayingId(request.id);
                  try {
                    await togglePray.mutateAsync(request.id);
                  } finally {
                    setPrayingId(null);
                  }
                }}
                onDelete={async () => {
                  setDeletingId(request.id);
                  try {
                    await deleteRequest.mutateAsync(request.id);
                  } finally {
                    setDeletingId(null);
                  }
                }}
                onArchive={async () => {
                  setArchivingId(request.id);
                  try {
                    await archiveRequest.mutateAsync(request.id);
                  } finally {
                    setArchivingId(null);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
