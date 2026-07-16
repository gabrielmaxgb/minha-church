export type ActivityFormField =
  | "name"
  | "ministryId"
  | "price"
  | "recurrenceEndDate"
  | "root";

export type ActivityFormFieldErrors = Partial<
  Record<ActivityFormField, string>
>;

export const ACTIVITY_FORM_FIELD_ORDER: ActivityFormField[] = [
  "name",
  "ministryId",
  "price",
  "recurrenceEndDate",
  "root",
];

export function activityFormFieldIds(prefix: string): Record<ActivityFormField, string> {
  return {
    name: `${prefix}-name`,
    ministryId: `${prefix}-ministry`,
    price: `${prefix}-price`,
    recurrenceEndDate: `${prefix}-recurrence-end-date`,
    root: `${prefix}-form-root`,
  };
}

export function firstActivityFormFieldError(
  errors: ActivityFormFieldErrors,
): ActivityFormField | null {
  return (
    ACTIVITY_FORM_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null
  );
}

export function mapActivityFormApiError(
  message: string,
): ActivityFormFieldErrors {
  const lower = message.toLowerCase();

  if (
    lower.includes("recebimentos") &&
    (lower.includes("inscrição paga") || lower.includes("inscricao paga"))
  ) {
    return { price: message };
  }

  if (
    lower.includes("preço mínimo") ||
    lower.includes("preco minimo") ||
    lower.includes("preço minimo")
  ) {
    return { price: message };
  }

  if (
    lower.includes("data final da repetição") ||
    lower.includes("data final da repeticao")
  ) {
    return { recurrenceEndDate: message };
  }

  if (lower.includes("ministério") || lower.includes("ministerio")) {
    return { ministryId: message };
  }

  if (lower.includes("nome")) {
    return { name: message };
  }

  return { root: message };
}

export function activityFormErrorsNeedMoreOptions(
  errors: ActivityFormFieldErrors,
): boolean {
  return Boolean(errors.price || errors.recurrenceEndDate);
}

export function scrollToActivityFormField(
  field: ActivityFormField,
  fieldIds: Record<ActivityFormField, string>,
) {
  const elementId = fieldIds[field];
  if (!elementId) {
    return;
  }

  requestAnimationFrame(() => {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLButtonElement
    ) {
      element.focus({ preventScroll: true });
    }
  });
}

export function applyActivityFormFieldErrors(
  errors: ActivityFormFieldErrors,
  fieldIds: Record<ActivityFormField, string>,
) {
  const firstField = firstActivityFormFieldError(errors);
  if (firstField && firstField !== "root") {
    scrollToActivityFormField(firstField, fieldIds);
    return;
  }

  if (errors.root) {
    scrollToActivityFormField("root", fieldIds);
  }
}
