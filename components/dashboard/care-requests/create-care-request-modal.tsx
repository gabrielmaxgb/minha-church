"use client";

import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCareRequest } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import {
  CARE_REQUEST_TYPE_LABELS,
  type CareRequestRecipient,
  type CareRequestType,
} from "@/types/care-requests";

interface CreateCareRequestModalProps {
  recipient: CareRequestRecipient | null;
  open: boolean;
  onClose: () => void;
}

export function CreateCareRequestModal({
  recipient,
  open,
  onClose,
}: CreateCareRequestModalProps) {
  const titleId = useId();
  const createRequest = useCreateCareRequest();
  const [type, setType] = useState<CareRequestType>("counseling");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType("counseling");
    setMessage("");
    setError(null);
  }, [open, recipient?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !recipient) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await createRequest.mutateAsync({
        recipientMemberId: recipient!.id,
        type,
        message: message.trim() || undefined,
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar a solicitação.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        disabled={createRequest.isPending}
        onClick={() => {
          if (!createRequest.isPending) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-background p-5 shadow-xl sm:rounded-2xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          Pedir para {recipient.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o tipo de pedido. A mensagem é opcional.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CARE_REQUEST_TYPE_LABELS) as CareRequestType[]).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      type === value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {CARE_REQUEST_TYPE_LABELS[value]}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="care-request-message">Mensagem (opcional)</Label>
            <Textarea
              id="care-request-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Contexto breve, se quiser..."
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              disabled={createRequest.isPending}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar solicitação"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
