export interface FaqItem {
	question: string;
	answer: string;
}

export const generalFaq: FaqItem[] = [
	{
		question: "Preciso instalar algo?",
		answer:
			"Não é obrigatório. O Minha Church funciona no navegador. Você também pode instalar como app no celular ou no computador — veja o guia /instalar ou o aviso no painel. Sem App Store.",
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
			"Você testa todas as funcionalidades por 30 dias, sem cartão. Depois de organizar sua igreja no sistema, assina a faixa correspondente ao número de membros (mensal ou anual).",
	},
	{
		question: "Funciona para igrejas pequenas?",
		answer:
			"Sim. A faixa inicial (até 100 membros) começa em R$ 119/mês — pensada para comunidades que querem sair das planilhas sem pesar no orçamento.",
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
		answer:
			"Não. O período de 30 dias é gratuito e não exige cartão de crédito.",
	},
	{
		question: "Como definir a faixa adequada?",
		answer:
			"Pelo número de membros. Até 100: Pequena Igreja (R$ 119/mês). De 101 a 300: Igreja em Crescimento (R$ 289/mês). A tabela completa e a calculadora estão nesta página.",
	},
	{
		question: "Quais formas de pagamento são aceitas?",
		answer:
			"Cartão de crédito e Pix no ciclo mensal ou anual. Boleto pode estar disponível conforme o checkout.",
	},
	{
		question: "Há desconto no plano anual?",
		answer:
			"Sim. No plano anual, o equivalente a dois meses deixa de ser cobrado em relação ao ciclo mensal. Exemplo: Pequena Igreja por R$ 1.190/ano, em vez de R$ 1.428 no mensal.",
	},
	{
		question: "O preço inclui todos os recursos?",
		answer:
			"Sim. Todas as faixas incluem os mesmos recursos: membros, ministérios, escalas, comunicados, finanças, cuidado pastoral e relatórios. A diferença é apenas o número de membros.",
	},
	{
		question: "O que acontece se a igreja crescer?",
		answer:
			"Ao ultrapassar o limite da faixa atual, avisamos com antecedência e a igreja passa à faixa seguinte. A cobrança é ajustada de forma proporcional.",
	},
	{
		question: "Posso mudar de mensal para anual depois?",
		answer:
			"Sim. A alternância entre cobrança mensal e anual pode ser feita a qualquer momento nas configurações da conta.",
	},
];
