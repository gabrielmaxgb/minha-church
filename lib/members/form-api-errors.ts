import type { UseFormClearErrors, UseFormSetError } from "react-hook-form";

import type { MemberFormValues } from "./form";

const EMAIL_FIELD_PATTERNS = [
  /e-mail já cadastrado/i,
  /e-mail já possui login/i,
];

const CPF_FIELD_PATTERNS = [
  /cpf já cadastrado/i,
  /cpf já possui login/i,
  /cpf inválido/i,
];

const CONTACT_FIELD_PATTERNS = [/informe e-mail ou cpf/i];

export function applyMemberFormApiError(
  setError: UseFormSetError<MemberFormValues>,
  clearErrors: UseFormClearErrors<MemberFormValues>,
  error: unknown,
  fallbackMessage = "Não foi possível salvar.",
): void {
  const message = error instanceof Error ? error.message : fallbackMessage;

  clearErrors();

  if (CONTACT_FIELD_PATTERNS.some((pattern) => pattern.test(message))) {
    setError("email", { message });
    setError("cpf", { message });
    return;
  }

  if (EMAIL_FIELD_PATTERNS.some((pattern) => pattern.test(message))) {
    setError("email", { message });
    return;
  }

  if (CPF_FIELD_PATTERNS.some((pattern) => pattern.test(message))) {
    setError("cpf", { message });
    return;
  }

  setError("root", { message });
}
