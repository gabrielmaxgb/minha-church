export interface FaqItem {
	question: string;
	answer: string;
}

export const generalFaq: FaqItem[] = [
	{
		question: "Preciso instalar algo?",
		answer:
			"Não é obrigatório. O Minha Church funciona no navegador. No celular, você também pode instalar como app (atalho na tela inicial) — o próprio painel oferece a opção, ou use “Adicionar à Tela de Início” no Safari/Chrome. Sem App Store.",
	},
	{
		question: "Posso importar meus membros de uma planilha?",
		answer:
			"Sim. Você pode importar membros via planilha Excel ou CSV. Nossa equipe também ajuda na migração de outros sistemas.",
	},
	{
		question: "Os dados da minha igreja são seguros?",
		answer:
			"Tratamos a segurança a sério: HTTPS/TLS, backups na nuvem, controle de acesso por perfil e textos alinhados à LGPD. Mais detalhes na página de Segurança e na Política de Privacidade.",
	},
	{
		question: "Como funciona o período gratuito?",
		answer:
			"Você testa todas as funcionalidades por 30 dias, sem cartão. Depois de organizar sua igreja no sistema, assina a faixa correspondente ao tamanho do cadastro (mensal ou anual).",
	},
	{
		question: "Funciona para igrejas pequenas?",
		answer:
			"Sim. A faixa inicial (até 100 membros cadastrados) começa em R$ 119/mês — pensada para comunidades que querem sair das planilhas sem pesar no orçamento.",
	},
	{
		question: "Posso cancelar a qualquer momento?",
		answer:
			"Sim. Não há fidelidade. Cancele a assinatura nas configurações. Antes de encerrar a igreja, exporte membros e o pacote de dados da igreja no painel. Após o pedido de encerramento, há 90 dias para cancelar; depois anonimizamos os dados (salvo retenção legal). Você também pode excluir sua conta pessoal em Configurações → Perfil.",
	},
	{
		question: "Como exporto ou excluo dados (LGPD)?",
		answer:
			"Na lista de membros: Exportar CSV. Em Configurações → Geral (responsável): exportar pacote da igreja e encerrar a igreja. Em Configurações → Perfil: baixar dados da conta/membro e excluir a conta. O Adendo LGPD (DPA) está em /dpa.",
	},
];

export const billingFaq: FaqItem[] = [
	{
		question: "Preciso de cartão de crédito para começar?",
		answer: "Não. O teste de 30 dias é gratuito e não exige cartão de crédito.",
	},
	{
		question: "Como sei qual faixa escolher?",
		answer:
			"Pela quantidade de membros cadastrados no sistema. Até 100 membros: Pequena Igreja (R$ 119/mês). De 101 a 300: Igreja em Crescimento (R$ 289/mês). A página de preços mostra a tabela completa e uma calculadora para simular.",
	},
	{
		question: "Quais formas de pagamento são aceitas?",
		answer:
			"Cartão de crédito e PIX no ciclo mensal ou anual. Boleto pode ser habilitado conforme disponibilidade no checkout.",
	},
	{
		question: "Existe desconto no plano anual?",
		answer:
			"Sim. No plano anual você economiza o equivalente a 2 meses em relação ao pagamento mensal (por exemplo, Pequena Igreja: R$ 1.190/ano em vez de R$ 1.428 no mensal).",
	},
	{
		question: "O preço inclui todas as funcionalidades?",
		answer:
			"Sim. Todas as faixas incluem as mesmas ferramentas — membros, ministérios, escalas, comunicados e permissões. A diferença é só a quantidade de membros cadastrados.",
	},
	{
		question: "O que acontece se minha igreja crescer?",
		answer:
			"Quando você ultrapassar o limite da faixa atual, avisamos com antecedência e você migra para a próxima. A cobrança é ajustada de forma proporcional — sem surpresas escondidas.",
	},
	{
		question: "Posso mudar de mensal para anual depois?",
		answer:
			"Sim. Você pode alternar entre cobrança mensal e anual a qualquer momento nas configurações da conta.",
	},
];
