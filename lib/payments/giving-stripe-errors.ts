/**
 * Traduz erros comuns do Stripe no checkout de contribuições
 * para mensagens acionáveis em português.
 */
export function resolveGivingStripeError(
  error: { code?: string; message?: string | null } | null | undefined,
  fallback = "Não foi possível confirmar o pagamento. Tente novamente.",
): string {
  if (!error) {
    return fallback;
  }

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (
    code === "tax_id_invalid" ||
    message.includes("boleto tax id cannot match your legal entity tax id")
  ) {
    return "No boleto, o CPF/CNPJ do pagador não pode ser o mesmo documento da igreja. Use outro CPF ou CNPJ para testar.";
  }

  if (code === "incomplete_payment_details" || code === "payment_intent_authentication_failure") {
    return "Confira os dados do pagamento e tente novamente.";
  }

  if (error.message?.trim()) {
    return error.message.trim();
  }

  return fallback;
}
