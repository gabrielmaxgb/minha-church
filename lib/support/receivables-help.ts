/**
 * Contato de suporte da plataforma (não pastoral da igreja).
 * Prefira WhatsApp via env; senão cai em e-mail.
 */
export function getSupportWhatsAppDigits(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.trim();
  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function getSupportEmail(): string {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "gmaxgomes@gmail.com"
  );
}

export interface ReceivablesHelpContext {
  churchName: string;
  churchId: string;
  ownerName: string;
  ownerEmail: string | null;
  onboardingStatus: string;
}

export function buildReceivablesHelpMessage(
  ctx: ReceivablesHelpContext,
): string {
  const lines = [
    "Olá! Preciso de ajuda para ativar os recebimentos no Minha Church.",
    "",
    `Igreja: ${ctx.churchName}`,
    `ID da igreja: ${ctx.churchId}`,
    `Responsável: ${ctx.ownerName}`,
  ];

  if (ctx.ownerEmail) {
    lines.push(`E-mail: ${ctx.ownerEmail}`);
  }

  lines.push(`Status atual: ${ctx.onboardingStatus}`);
  lines.push("");
  lines.push("Podem me orientar no cadastro?");

  return lines.join("\n");
}

/** Abre WhatsApp (se configurado) ou mailto com a mensagem pronta. */
export function buildReceivablesHelpHref(ctx: ReceivablesHelpContext): string {
  const message = buildReceivablesHelpMessage(ctx);
  const wa = getSupportWhatsAppDigits();

  if (wa) {
    return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  }

  const email = getSupportEmail();
  const subject = encodeURIComponent(
    `Ajuda — ativar recebimentos (${ctx.churchName})`,
  );
  const body = encodeURIComponent(message);

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function receivablesHelpChannelLabel(): "WhatsApp" | "e-mail" {
  return getSupportWhatsAppDigits() ? "WhatsApp" : "e-mail";
}
