/**
 * Copy for the two member-facing responses on an event page:
 * - roster availability = serving on the team (escala)
 * - registration = attending the event as a participant (inscrição)
 */

export const rosterAvailabilityCopy = {
  eyebrow: "Servir na equipe",
  title: "Pode servir neste dia?",
  subtitle:
    "O líder está montando a escala. Avise se você está disponível para servir.",
  subtitleWithRegistration:
    "Para servir na equipe — separado da inscrição para participar do evento.",
  leaderMessageLabel: "Mensagem do líder",
  buttons: {
    available: "Posso servir",
    unavailable: "Não posso servir",
    availableEmphasis: "Sim, posso servir",
    clear: "Limpar resposta",
    undo: "Desfazer resposta",
  },
  status: {
    pendingTitle: "Aguardando sua resposta",
    pendingHint: "Diga se pode servir na equipe neste dia.",
    availableTitle: "Disponível para servir",
    availableHint: "O líder já sabe que você pode servir neste dia.",
    unavailableTitle: "Indisponível para servir",
    unavailableHint: "O líder já sabe que você não pode servir neste dia.",
    saving: "Salvando resposta...",
    savingHint: "Aguarde um instante.",
  },
  setup: {
    functionsTitle: "Funções não configuradas",
    functionsHint:
      "Cadastre suas funções no perfil antes de responder à escala.",
    functionsGateTitle: "Cadastre suas funções antes de responder",
    functionsGateHint:
      "Em Configurações → Ministérios, informe pelo menos uma função para o líder saber como você pode servir.",
  },
} as const;

export const eventRegistrationCopy = {
  eyebrow: "Participar do evento",
  titleFree: "Inscrição",
  titlePaid: "Taxa de inscrição",
  subtitleFree:
    "Confirme que vai participar deste evento — como convidado ou participante.",
  subtitleFreeDense: "Para participar do evento — não é a escala da equipe.",
  subtitlePaid: "Pague para confirmar sua participação neste evento.",
  subtitlePaidDense: "Pague para participar — não é a escala da equipe.",
  confirmFree: "Confirmar participação",
  confirmPaid: (amount: string) => `Continuar · ${amount}`,
  confirmedTitle: "Você já está inscrito",
  confirmedFree: "Participação confirmada neste evento.",
  confirmedFreeDense: "Participação confirmada.",
  confirmedPaid:
    "Sua inscrição paga neste evento já está confirmada. Não é necessário pagar de novo.",
  confirmedPaidDense: "Inscrição confirmada — não precisa pagar de novo.",
  paymentEyebrow: "Inscrição no evento",
  paymentDescription:
    "Taxa de inscrição para confirmar sua participação neste evento.",
  paymentDescriptionFree:
    "Confirme sua participação gratuita neste evento.",
} as const;
