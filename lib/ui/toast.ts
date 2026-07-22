import { toast } from "sonner";

/** Janela curta para não empilhar o mesmo aviso (ex.: preview + catch). */
const DEDUPE_MS = 2500;
const recentMessages = new Map<string, number>();

function shouldShow(key: string): boolean {
  const now = Date.now();
  const last = recentMessages.get(key) ?? 0;
  if (now - last < DEDUPE_MS) {
    return false;
  }
  recentMessages.set(key, now);
  return true;
}

function messageFromUnknown(error: unknown): string | null {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const message = (error as { message: string }).message.trim();
    return message || null;
  }

  return null;
}

export function toastSuccess(message: string): void {
  if (typeof window === "undefined" || !message.trim()) {
    return;
  }
  const key = `ok:${message}`;
  if (!shouldShow(key)) {
    return;
  }
  toast.success(message);
}

export function toastError(message: string): void {
  if (typeof window === "undefined" || !message.trim()) {
    return;
  }
  const key = `err:${message}`;
  if (!shouldShow(key)) {
    return;
  }
  toast.error(message);
}

export function toastInfo(message: string): void {
  if (typeof window === "undefined" || !message.trim()) {
    return;
  }
  const key = `info:${message}`;
  if (!shouldShow(key)) {
    return;
  }
  toast.message(message);
}

/** Extrai mensagem útil de erro de API / Error e exibe toast. */
export function toastApiError(
  error: unknown,
  fallback = "Não foi possível concluir a ação. Tente novamente.",
): void {
  toastError(messageFromUnknown(error) ?? fallback);
}
