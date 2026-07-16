/**
 * Traduz erros comuns do Stripe no checkout de contribuições
 * para mensagens acionáveis em português.
 *
 * Nunca devolve a mensagem bruta do Stripe (quase sempre em inglês).
 */
export function resolveGivingStripeError(
  error: { code?: string; message?: string | null; decline_code?: string } | null | undefined,
  fallback = "Não foi possível confirmar o pagamento. Tente novamente.",
): string {
  if (!error) {
    return fallback;
  }

  const code = error.code ?? "";
  const declineCode = error.decline_code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (
    code === "tax_id_invalid" ||
    message.includes("boleto tax id cannot match your legal entity tax id")
  ) {
    return "No boleto, o CPF/CNPJ do pagador não pode ser o mesmo documento da igreja. Use outro CPF ou CNPJ para testar.";
  }

  if (
    code === "incomplete_payment_details" ||
    code === "payment_intent_authentication_failure"
  ) {
    return "Confira os dados do pagamento e tente novamente.";
  }

  if (
    code === "card_declined" ||
    declineCode === "generic_decline" ||
    declineCode === "do_not_honor" ||
    message.includes("card was declined")
  ) {
    return "O cartão foi recusado. Confira os dados ou use outro meio de pagamento.";
  }

  if (
    code === "expired_card" ||
    declineCode === "expired_card" ||
    message.includes("expired")
  ) {
    return "Este cartão está vencido. Use outro cartão.";
  }

  if (
    code === "incorrect_cvc" ||
    code === "invalid_cvc" ||
    declineCode === "incorrect_cvc"
  ) {
    return "O código de segurança (CVV) está incorreto.";
  }

  if (
    code === "incorrect_number" ||
    code === "invalid_number" ||
    declineCode === "invalid_number"
  ) {
    return "O número do cartão está incorreto.";
  }

  if (code === "insufficient_funds" || declineCode === "insufficient_funds") {
    return "Saldo insuficiente neste cartão. Tente outro meio de pagamento.";
  }

  if (
    code === "processing_error" ||
    code === "payment_intent_unexpected_state"
  ) {
    return "Houve um problema ao processar o pagamento. Aguarde um momento e tente novamente.";
  }

  if (code === "authentication_required" || declineCode === "authentication_required") {
    return "Seu banco pediu uma confirmação extra. Conclua a autenticação e tente novamente.";
  }

  return fallback;
}
