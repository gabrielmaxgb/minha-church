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
		"Aqui você só diz se pode servir. Isso não te inscreve no evento.",
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
		pendingHint: "Diga se você pode servir na equipe neste dia.",
		availableTitle: "Você está disponível para servir",
		availableHint: "Pronto — o líder já sabe que você pode neste dia.",
		unavailableTitle: "Você não pode servir neste dia",
		unavailableHint: "Tudo certo — o líder já sabe da sua indisponibilidade.",
		saving: "Salvando sua resposta...",
		savingHint: "Só um instante.",
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
		"Confirme que você vai participar — como convidado ou participante.",
	subtitleFreeDense:
		"Aqui você confirma sua participação. Isso não é a escala da equipe.",
	subtitlePaid: "Pague para garantir sua vaga neste evento.",
	subtitlePaidDense: "Complete a inscrição para garantir sua vaga.",
	confirmFree: "Confirmar participação",
	confirmPaid: (amount: string) => `Continuar · ${amount}`,
	confirmedTitle: "Você já está inscrito",
	confirmedFree: "Sua participação neste evento está confirmada.",
	confirmedFreeDense: "Participação confirmada.",
	confirmedPaid:
		"Sua inscrição paga já está confirmada. Você não precisa pagar de novo.",
	confirmedPaidDense: "Inscrição confirmada — você não precisa pagar de novo.",
	paymentEyebrow: "Inscrição no evento",
	paymentDescription:
		"Taxa de inscrição para confirmar sua participação neste evento.",
	paymentDescriptionFree: "Confirme sua participação gratuita neste evento.",
} as const;
