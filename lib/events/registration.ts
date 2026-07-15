import type { ChurchEvent } from "@/types/events";

/** Compat: eventos pagos antigos sem o flag ainda contam como inscrição aberta. */
export function isEventRegistrationOpen(
  event: Pick<ChurchEvent, "registrationOpen" | "priceCents">,
): boolean {
  return Boolean(
    event.registrationOpen ??
      (event.priceCents != null && event.priceCents > 0),
  );
}

export function isEventRegistrationPaid(
  event: Pick<ChurchEvent, "registrationOpen" | "priceCents">,
): boolean {
  return (
    isEventRegistrationOpen(event) &&
    event.priceCents != null &&
    event.priceCents >= 500
  );
}
