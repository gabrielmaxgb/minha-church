"use client";

import { useId, useState } from "react";
import { HandHeart, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePrayerRequest,
  useDeletePrayerRequest,
  usePrayerRequests,
  useTogglePrayerRequestPray,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { PrayerRequest } from "@/types/prayer-requests";

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

function PrayerRequestCard({
  request,
  onPray,
  onDelete,
  praying,
  deleting,
}: {
  request: PrayerRequest;
  onPray: () => void;
  onDelete: () => void;
  praying: boolean;
  deleting: boolean;
}) {
  return (
    <article className="space-y-3 border-b border-border/70 pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {authorLabel(request)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRequestDate(request.createdAt)}
          </p>
        </div>
        {request.canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
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

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {request.body}
      </p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 px-2",
          request.prayedByMe
            ? "text-domain-members-foreground"
            : "text-muted-foreground",
        )}
        onClick={onPray}
        disabled={praying}
        aria-pressed={request.prayedByMe}
      >
        {praying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <HandHeart
            className={cn(
              "size-4",
              request.prayedByMe && "fill-current opacity-90",
            )}
            aria-hidden
          />
        )}
        <span>
          {request.prayedByMe ? "Estou orando" : "Orar"}
          {request.prayerCount > 0 ? ` · ${request.prayerCount}` : ""}
        </span>
      </Button>
    </article>
  );
}

export function PrayerRequestsContent() {
  const anonymousId = useId();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [prayingId, setPrayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = usePrayerRequests();

  const createRequest = useCreatePrayerRequest();
  const togglePray = useTogglePrayerRequestPray();
  const deleteRequest = useDeletePrayerRequest();

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
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível publicar o pedido.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Compartilhar pedido
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A igreja pode se unir em oração. Use com cuidado e respeito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Pelo que você gostaria de oração?"
            maxLength={1000}
            rows={4}
            disabled={createRequest.isPending}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor={anonymousId}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                id={anonymousId}
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="size-4 rounded border-border"
                disabled={createRequest.isPending}
              />
              Publicar de forma anônima
            </label>
            <Button type="submit" disabled={createRequest.isPending}>
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
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Quadro de oração
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque em “Orar” para marcar que você está intercedendo.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os pedidos."}
          </p>
        ) : requests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Ainda não há pedidos publicados. Seja o primeiro a compartilhar.
          </p>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => (
              <PrayerRequestCard
                key={request.id}
                request={request}
                praying={prayingId === request.id && togglePray.isPending}
                deleting={deletingId === request.id && deleteRequest.isPending}
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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
