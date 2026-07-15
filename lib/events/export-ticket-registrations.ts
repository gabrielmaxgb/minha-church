import Papa from "papaparse";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { EventTicketRegistration } from "@/types/events";

const STATUS_LABEL: Record<string, string> = {
  succeeded: "Confirmada",
  pending: "Aguardando",
  failed: "Falhou",
  canceled: "Cancelada",
  refunded: "Estornada",
};

const CSV_TIME_ZONE = "America/Sao_Paulo";

export interface EventTicketExportContext {
  eventName: string;
  startsAt: string;
  location?: string | null;
  isPaid?: boolean;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatEventWhen(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CSV_TIME_ZONE,
  }).format(new Date(iso));
}

function slugifyForFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildFilename(eventName: string, startsAt: string): string {
  const slug = slugifyForFilename(eventName) || "evento";
  const dateStamp = new Intl.DateTimeFormat("sv-SE", {
    timeZone: CSV_TIME_ZONE,
  }).format(new Date(startsAt));
  return `inscritos-${slug}-${dateStamp}.csv`;
}

export function downloadEventTicketRegistrationsCsv(
  registrations: EventTicketRegistration[],
  context: EventTicketExportContext,
): void {
  const isPaid = context.isPaid ?? true;
  const eventWhen = formatEventWhen(context.startsAt);
  const location = context.location?.trim() || "";

  const headers = [
    "Evento",
    "Data do evento",
    ...(location ? ["Local"] : []),
    "Nome do inscrito",
    "E-mail",
    "Status da inscrição",
    "Data da inscrição",
    ...(isPaid ? ["Valor pago"] : []),
  ];

  const rows = registrations.map((item) => {
    const row = [
      context.eventName,
      eventWhen,
      ...(location ? [location] : []),
      item.name,
      item.email ?? "",
      STATUS_LABEL[item.status] ?? item.status,
      formatDateTime(item.createdAt),
    ];
    if (isPaid) {
      row.push(formatCurrency(item.amountCents / 100));
    }
    return row;
  });

  const csv = Papa.unparse([headers, ...rows]);
  // BOM (\uFEFF) garante acentuação correta ao abrir no Excel.
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, buildFilename(context.eventName, context.startsAt));
}
