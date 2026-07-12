import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Máscara BRL a partir de centavos: 12345 → "123,45" */
export function formatBrlCentsMask(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.max(0, Math.trunc(cents)) : 0;
  return (safe / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Digits de um input mascarado → centavos (padrão BR: digita da direita). */
export function parseBrlMaskToCents(masked: string): number {
  const digits = masked.replace(/\D/g, "").replace(/^0+/, "") || "0";
  // Limite prático: até R$ 99.999.999,99
  const clipped = digits.slice(0, 10);
  return Number.parseInt(clipped, 10);
}

/** Aplica máscara BRL enquanto a pessoa digita. */
export function applyBrlCentsMask(raw: string): string {
  return formatBrlCentsMask(parseBrlMaskToCents(raw));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
