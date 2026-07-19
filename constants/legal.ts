/**
 * Textos legais públicos.
 * Revisão jurídica recomendada antes de considerar definitivo.
 */

/** Soft-delete / encerramento: dias até anonimização definitiva. */
export const MEMBER_RETENTION_DAYS = 90;

/** Versão dos Termos + Privacidade (material). Espelhar no backend. */
export const LEGAL_DOC_VERSION = "2026-07-16";

/** Versão do Adendo LGPD / DPA. Espelhar no backend. */
export const DPA_VERSION = "2026-07-16";

export const legalMeta = {
	productName: "Minha Church",
	legalName: "G MAX G DE BESSA DEV",
	tradeName: "GABRIEL MAX",
	cnpj: "40.887.745/0001-39",
	companySize: "ME",
	openedAtLabel: "17 de fevereiro de 2021",
	supportEmail: "gmaxgomes@gmail.com",
	/** Endereço do prestador conforme CNPJ (Receita Federal). */
	address:
		"Q EPTG QE, nº 2, Bloco A1 Apt 206, Quadras Econômicas Lúcio Costa (Guará), Brasília/DF, CEP 71.100-050",
	/** Encarregado (DPO) — canal público LGPD. */
	dpoName: "Gabriel Max Gomes de Bessa",
	dpoEmail: "gmaxgomes@gmail.com",
	lastUpdatedLabel: "16 de julho de 2026",
	lastUpdatedIso: "2026-07-16",
};

export const legalCompanySummary = `${legalMeta.legalName}, nome fantasia ${legalMeta.tradeName}, inscrita no CNPJ sob o nº ${legalMeta.cnpj}`;

const legalAddressLine =
	legalMeta.address.trim().length > 0
		? legalMeta.address.trim()
		: `Endereço completo disponível mediante solicitação em ${legalMeta.supportEmail}.`;

export type LegalSection = {
	id: string;
	title: string;
	paragraphs: string[];
	bullets?: string[];
};

export const termsOfUseSections: LegalSection[] = [
	{
		id: "prestador",
		title: "1. Prestador do serviço",
		paragraphs: [
			`O ${legalMeta.productName} é oferecido por ${legalCompanySummary} (“${legalMeta.productName}” ou “nós”).`,
			`Microempresa (ME), com data de abertura em ${legalMeta.openedAtLabel}. Contato: ${legalMeta.supportEmail}. ${legalAddressLine}`,
		],
	},
	{
		id: "aceitacao",
		title: "2. Aceitação",
		paragraphs: [
			`Ao criar uma conta ou usar o ${legalMeta.productName}, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.`,
			"Se você cadastra uma igreja, declara ter autoridade para representá-la e vincular a organização a estes termos.",
		],
	},
	{
		id: "servico",
		title: "3. O que é o serviço",
		paragraphs: [
			`O ${legalMeta.productName} é uma plataforma online de gestão para igrejas, que pode incluir, entre outras funções: cadastro de membros, ministérios e escalas, eventos e atividades, comunicação, finanças e recebimentos (quando habilitados), e configurações de acesso por perfil.`,
			"O serviço evolui com o tempo: recursos podem ser adicionados, alterados ou descontinuados, com aviso razoável quando a mudança for relevante para o uso do produto.",
		],
	},
	{
		id: "conta",
		title: "4. Conta e responsabilidades",
		paragraphs: [
			"Você é responsável por manter a confidencialidade das credenciais de acesso e por todas as atividades realizadas na conta.",
			"Informações de cadastro devem ser verdadeiras, completas e atualizadas. Contas podem ser suspensas em caso de uso indevido, fraude ou violação destes termos.",
		],
	},
	{
		id: "papeis",
		title: "5. Papéis: igreja e plataforma",
		paragraphs: [
			`A igreja (ou organização religiosa) que usa o ${legalMeta.productName} é responsável pelo conteúdo e pelos dados que cadastra — inclusive dados de membros, voluntários, visitantes, menores, pedidos de oração e de aconselhamento/visita.`,
			`O ${legalMeta.productName} presta o serviço de software (hospedagem e operação da plataforma). Não substitui aconselhamento pastoral, jurídico, contábil, clínico ou fiscal da igreja. Conteúdos pastorais no produto não constituem sigilo profissional.`,
		],
	},
	{
		id: "planos",
		title: "6. Planos, trial e cobrança",
		paragraphs: [
			"Podemos oferecer período de teste gratuito e planos pagos com limites de uso (por exemplo, número de membros). Valores, ciclos (mensal/anual) e condições comerciais aparecem na página de preços e no fluxo de assinatura.",
			"Assinaturas podem renovar automaticamente conforme a forma de pagamento escolhida, até o cancelamento. Impostos e taxas de meios de pagamento, quando aplicáveis, seguem a legislação e o provedor de cobrança.",
			"O não pagamento pode resultar em restrição de recursos ou suspensão da conta, após aviso, conforme a política comercial vigente.",
		],
	},
	{
		id: "cancelamento",
		title: "7. Cancelamento e encerramento",
		paragraphs: [
			"Você pode cancelar a assinatura a qualquer momento pelos canais indicados no produto (por exemplo, configurações da igreja) ou pelo suporte.",
			`Após o cancelamento ou encerramento da conta, o acesso ao painel pode ser interrompido. Exporte os dados pelo painel (membros, pacote da igreja, dados da conta) antes de encerrar. Após o pedido de encerramento, mantemos os dados por ${MEMBER_RETENTION_DAYS} dias (janela recuperável) e, em seguida, excluímos ou anonimizamos, salvo retenção legal. Detalhes na Política de Privacidade.`,
		],
	},
	{
		id: "uso-aceitavel",
		title: "8. Uso aceitável",
		paragraphs: [
			"É proibido usar o serviço para fins ilegais, abusivos ou que violem direitos de terceiros. Em especial, você não deve:",
		],
		bullets: [
			"Enviar spam, phishing ou comunicações enganosas em nome da igreja ou da plataforma",
			"Tentar acessar contas, dados ou sistemas sem autorização",
			"Interferir na segurança, disponibilidade ou integridade do serviço",
			"Usar o produto para armazenar ou disseminar conteúdo ilícito",
			"Revender o acesso à plataforma sem autorização expressa",
		],
	},
	{
		id: "pagamentos-terceiros",
		title: "9. Recebimentos e pagamentos de terceiros",
		paragraphs: [
			"Recursos de inscrição em eventos, contribuições ou recebimentos podem usar processadores de pagamento de terceiros (por exemplo, Stripe). Nesses casos, o valor cobrado do pagador destina-se à igreja ou ao beneficiário configurado, observadas as regras do processador.",
			`O ${legalMeta.productName} não é instituição financeira e não “guarda” o dinheiro das doações ou taxas de inscrição da igreja. Taxas do processador, chargebacks e disputas seguem as regras desse terceiro e a relação entre a igreja e o pagador.`,
			`Podemos cobrar uma taxa de plataforma (percentual ou valor) sobre recebimentos intermediados, quando habilitada. Enquanto a taxa for zero, nenhuma retenção adicional da plataforma é aplicada além das taxas do processador. Se a taxa for ativada ou alterada, informaremos no produto e/ou nestes termos com antecedência razoável.`,
		],
	},
	{
		id: "disponibilidade",
		title: "10. Disponibilidade e alterações",
		paragraphs: [
			"Buscamos manter o serviço disponível e estável, mas não garantimos funcionamento ininterrupto ou isento de erros. Podem ocorrer manutenções, falhas de infraestrutura ou indisponibilidade de terceiros.",
			"Não nos responsabilizamos por danos indiretos, lucros cessantes ou perda de dados decorrente de uso inadequado, força maior ou falhas fora do nosso controle razoável, na medida permitida pela lei aplicável.",
		],
	},
	{
		id: "propriedade",
		title: "11. Propriedade intelectual",
		paragraphs: [
			`O software, marca, layout e materiais do ${legalMeta.productName} pertencem a ${legalMeta.legalName} ou a licenciadores. O uso do serviço não transfere propriedade intelectual para você.`,
			"Os dados e conteúdos inseridos pela igreja continuam sob responsabilidade e titularidade da igreja, conforme a lei e a Política de Privacidade.",
		],
	},
	{
		id: "alteracoes",
		title: "12. Alterações destes termos",
		paragraphs: [
			"Podemos atualizar estes Termos de Uso. A data da última atualização aparece no topo da página. Em mudanças relevantes, podemos notificar por e-mail ou aviso no produto. O uso continuado após a vigência das alterações constitui aceitação, salvo quando a lei exigir consentimento específico.",
		],
	},
	{
		id: "contato-foro",
		title: "13. Contato e foro",
		paragraphs: [
			`Dúvidas sobre estes termos: ${legalMeta.supportEmail}.`,
			`Prestador: ${legalMeta.legalName} — CNPJ ${legalMeta.cnpj}. ${legalAddressLine}`,
			"Salvo disposição legal em contrário, aplica-se a legislação brasileira. Fica eleito o foro da comarca do domicílio do prestador do serviço, ou outro previsto em lei protetiva do consumidor, quando aplicável.",
		],
	},
];

export const privacyPolicySections: LegalSection[] = [
	{
		id: "intro",
		title: "1. Introdução",
		paragraphs: [
			`Esta Política de Privacidade explica como ${legalCompanySummary} (“${legalMeta.productName}” ou “nós”) trata dados pessoais no Brasil, em linha com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).`,
			"Leia também os Termos de Uso. Em caso de conflito sobre tratamento de dados pessoais, esta política prevalece naquilo que for específico à privacidade.",
		],
	},
	{
		id: "controlador-operador",
		title: "2. Controlador e operador",
		paragraphs: [
			`Controlador, quando aplicável aos dados da plataforma e da assinatura: ${legalMeta.legalName}, CNPJ ${legalMeta.cnpj}, contato ${legalMeta.supportEmail}.`,
			`Dados da conta da igreja e da cobrança da assinatura do ${legalMeta.productName} (por exemplo, nome e e-mail do responsável, dados de plano): em regra, atuamos como controlador.`,
			"Dados de membros, voluntários, escalas, eventos, comunicações, contribuições, doadores em páginas públicas e demais informações cadastradas pela igreja no dia a dia: a igreja é a controladora; nós atuamos como operadores, processando esses dados sob instrução da igreja para prestar o serviço.",
			`Pedidos de titulares sobre dados da igreja devem, em primeiro lugar, ser feitos à própria igreja. Podemos apoiar a igreja no atendimento. Contato da plataforma: ${legalMeta.supportEmail}.`,
		],
	},
	{
		id: "dados-coletados",
		title: "3. Quais dados coletamos",
		paragraphs: ["Dependendo do uso do produto, podemos tratar:"],
		bullets: [
			"Dados de conta e perfil: nome, e-mail, CPF (quando informado), telefone, senha (armazenada de forma segura), funções e permissões",
			"Dados da igreja: nome, endereço/contato, informações fiscais necessárias a recebimentos (quando configurados)",
			"Dados de membros e operação: fichas (inclusive datas de nascimento, batismo e membresia), famílias, ministérios, disponibilidade e escalas, eventos, inscrições, comunicados e registros de uso do painel",
			"Conteúdos pastorais inseridos pelos usuários: pedidos de oração e de aconselhamento/visita (texto livre)",
			"Dados de doadores e contribuidores: nome e e-mail informados no checkout público ou vinculados a membros",
			"Dados de pagamento: tratados em grande parte pelo processador (Stripe); podemos receber status, identificadores e comprovantes necessários à operação",
			"Dados técnicos: endereço IP, logs de acesso, tipo de dispositivo/navegador e cookies essenciais de sessão",
		],
	},
	{
		id: "finalidades",
		title: "4. Para que usamos os dados",
		paragraphs: ["Usamos dados pessoais para:"],
		bullets: [
			"Prestar, manter e melhorar o serviço",
			"Autenticar usuários e controlar permissões",
			"Cobrar assinaturas e gerenciar o relacionamento comercial",
			"Viabilizar recebimentos da igreja e registro de contribuições",
			"Enviar comunicações operacionais (ex.: confirmação de e-mail, avisos de segurança, cobrança, alerta de novo pedido de aconselhamento — sem o texto da mensagem)",
			"Prevenir fraudes, abusos e incidentes de segurança",
			"Cumprir obrigações legais e responder a autoridades, quando exigido",
		],
	},
	{
		id: "bases-legais",
		title: "5. Bases legais (LGPD)",
		paragraphs: [
			"Conforme o caso, o tratamento pode se apoiar em: execução de contrato ou procedimentos preliminares; legítimo interesse (com avaliação de impacto quando cabível); cumprimento de obrigação legal/regulatória; e consentimento, quando exigido (por exemplo, certas comunicações de marketing).",
			"Dados de natureza religiosa ou pastoral tratados no contexto da igreja são, em regra, de responsabilidade da igreja como controladora, com bases legais que ela deve avaliar (inclusive consentimento quando aplicável).",
		],
	},
	{
		id: "compartilhamento",
		title: "6. Compartilhamento",
		paragraphs: [
			"Não vendemos dados pessoais. Podemos compartilhar dados com subprocessadores necessários à operação, por exemplo:",
			"Sempre que possível, exigimos que esses terceiros tratem os dados apenas para as finalidades contratadas e com segurança adequada.",
		],
		bullets: [
			"Stripe — cobranças de assinatura e recebimentos da igreja (Connect)",
			"Resend — e-mails transacionais (confirmação, redefinição de senha, alertas operacionais)",
			"Provedores de hospedagem e banco de dados (ex.: infraestrutura de nuvem / PostgreSQL gerenciado)",
			"Autoridades públicas, quando houver obrigação legal ou ordem válida",
		],
	},
	{
		id: "oracao-cuidado",
		title: "7. Oração e aconselhamento",
		paragraphs: [
			"Pedidos de oração podem ser publicados com o nome oculto para a comunidade. O responsável da igreja no sistema (owner) ainda pode identificar o autor, para moderação e cuidado pastoral.",
			"Pedidos de aconselhamento ou visita ficam visíveis no app para o destinatário escolhido. O e-mail de aviso não inclui o texto da mensagem. Esses recursos não criam sigilo profissional nem substituem atendimento clínico, jurídico ou pastoral presencial.",
		],
	},
	{
		id: "cookies",
		title: "8. Cookies e sessões",
		paragraphs: [
			"Usamos cookies e tecnologias semelhantes essenciais para login, sessão e segurança. Cookies opcionais de analytics ou marketing, se forem adotados no futuro, serão informados e, quando exigido, sujeitos a preferências do usuário.",
		],
	},
	{
		id: "retencao",
		title: "9. Retenção e exclusão",
		paragraphs: [
			`Mantemos dados pelo tempo necessário para prestar o serviço, cumprir obrigações legais, resolver disputas e exercer direitos. Cadastros de membros removidos no painel permanecem soft-deleted por até ${MEMBER_RETENTION_DAYS} dias e, depois disso, são anonimizados de forma definitiva, salvo retenção legal (por exemplo, registros financeiros, em que a PII do doador é anonimizada e os valores/identificadores operacionais podem ser mantidos).`,
			`Após o encerramento da conta da igreja ou exclusão da conta de usuário, retemos os dados por ${MEMBER_RETENTION_DAYS} dias (com possibilidade de cancelar o encerramento da igreja nesse prazo) e, em seguida, excluímos ou anonimizamos, salvo retenção legal.`,
			"A igreja, como controladora dos dados de membros e doadores, pode exportar e solicitar exclusão pelos fluxos do produto (exportação de membros, pacote da igreja, dados da conta). O suporte permanece disponível para casos excepcionais.",
		],
	},
	{
		id: "direitos",
		title: "10. Direitos do titular",
		paragraphs: [
			"Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade (quando aplicável), informação sobre compartilhamentos, revogação de consentimento e oposição a tratamentos em hipóteses legais.",
			`Para exercer direitos sobre dados da igreja: contate a própria igreja. Para dados de conta/assinatura da plataforma, ou para apoio operacional: ${legalMeta.supportEmail}. Podemos pedir confirmação de identidade antes de atender.`,
		],
	},
	{
		id: "seguranca",
		title: "11. Segurança",
		paragraphs: [
			"Adotamos medidas técnicas e organizacionais seguras (como criptografia em trânsito, controle de acesso e backups na infraestrutura). Em caso de incidente relevante, seguiremos as obrigações legais de comunicação.",
		],
	},
	{
		id: "menores",
		title: "12. Crianças e adolescentes",
		paragraphs: [
			"O produto pode conter dados de menores quando a igreja os cadastra (inclusive por importação). A igreja é a controladora e responsável por obter as autorizações e bases legais adequadas.",
			"Para liberar login no painel a um menor de 18 anos (receber como membro ativo), o produto exige o registro de consentimento parental: identificação do responsável e aceite do texto de autorização, com data e usuário que registrou. A ficha pastoral do menor pode ser mantida sem esse passo.",
			"Pedidos de aconselhamento/visita exigem idade mínima de 18 anos. Importação de menores como membros ativos é bloqueada — importe como visitante, registre o consentimento e depois receba.",
			"Se soubermos de tratamento irregular envolvendo menores, poderemos restringir o uso ou solicitar correção à igreja.",
		],
	},
	{
		id: "internacional",
		title: "13. Transferências internacionais",
		paragraphs: [
			"Alguns fornecedores (por exemplo Stripe e Resend) podem processar dados fora do Brasil. Nesses casos, buscamos salvaguardas compatíveis com a LGPD (contratuais e/ou mecanismos previstos na legislação).",
		],
	},
	{
		id: "alteracoes-privacidade",
		title: "14. Alterações desta política",
		paragraphs: [
			"Podemos atualizar esta Política de Privacidade. A data da última atualização aparece no topo da página. Mudanças relevantes poderão ser comunicadas por e-mail ou aviso no produto.",
		],
	},
	{
		id: "contato-privacidade",
		title: "15. Contato",
		paragraphs: [
			`Canal de privacidade e proteção de dados: ${legalMeta.dpoEmail}.`,
			`Encarregado (DPO): ${legalMeta.dpoName} — ${legalMeta.dpoEmail}.`,
			`${legalMeta.legalName} — CNPJ ${legalMeta.cnpj} (nome fantasia ${legalMeta.tradeName}). ${legalAddressLine}`,
			`O tratamento de dados da igreja como controladora e da plataforma como operadora também é regido pelo Adendo LGPD (DPA), versão ${DPA_VERSION}, disponível em /dpa.`,
		],
	},
];

export const dpaSections: LegalSection[] = [
	{
		id: "objeto",
		title: "1. Objeto",
		paragraphs: [
			`Este Adendo de Proteção de Dados (DPA) integra os Termos de Uso do ${legalMeta.productName} e regula o tratamento de dados pessoais em que a igreja (ou organização religiosa) atua como controladora e ${legalCompanySummary} (“operadora” ou “nós”) processa dados sob instrução da igreja para prestar o software.`,
			`Versão deste adendo: ${DPA_VERSION}.`,
		],
	},
	{
		id: "papeis",
		title: "2. Papéis",
		paragraphs: [
			"Controladora: a igreja que cadastra e decide sobre dados de membros, voluntários, visitantes, menores, doadores, pedidos de oração e aconselhamento/visita, escalas e demais conteúdos pastorais/operacionais no produto.",
			`Operadora: ${legalMeta.legalName}, que hospeda e opera a plataforma, tratando esses dados apenas para prestar o serviço contratado, com segurança adequada e conforme este adendo e a Política de Privacidade.`,
			`Dados da conta da igreja e da assinatura do ${legalMeta.productName} (ex.: responsável, e-mail, plano): em regra, a plataforma atua como controladora.`,
		],
	},
	{
		id: "instrucoes",
		title: "3. Instruções e finalidades",
		paragraphs: [
			"A operadora trata dados pessoais da controladora somente para: (a) prestar, manter e melhorar o serviço; (b) autenticar usuários e controlar permissões; (c) viabilizar cobranças, recebimentos e registros necessários; (d) prevenir abusos e incidentes; (e) cumprir obrigações legais.",
			"A controladora é responsável por bases legais adequadas (inclusive consentimento parental quando aplicável) e por orientações lícitas à operadora.",
		],
	},
	{
		id: "subprocessadores",
		title: "4. Subprocessadores",
		paragraphs: [
			"A operadora pode utilizar subprocessadores necessários à operação, incluindo:",
		],
		bullets: [
			"Stripe — cobranças de assinatura e recebimentos (Connect)",
			"Resend — e-mails transacionais",
			"Provedores de hospedagem e banco de dados (infraestrutura de nuvem / PostgreSQL gerenciado)",
		],
	},
	{
		id: "seguranca-incidentes",
		title: "5. Segurança e incidentes",
		paragraphs: [
			"A operadora aplica medidas técnicas e organizacionais razoáveis (criptografia em trânsito, controle de acesso, backups).",
			"Em incidente de segurança relevante envolvendo dados tratados sob este adendo, a operadora informará a controladora em prazo razoável e cooperará no atendimento às obrigações legais aplicáveis.",
		],
	},
	{
		id: "retencao-exclusao",
		title: "6. Retenção e exclusão",
		paragraphs: [
			`Membros removidos e contas encerradas seguem retenção operacional de ${MEMBER_RETENTION_DAYS} dias, após a qual a operadora anonimiza ou exclui dados pessoais, preservando registros financeiros anonimizados quando houver obrigação legal.`,
			"Ao término do contrato ou encerramento definitivo, a controladora pode exportar dados pelos fluxos do produto. Após a janela de retenção, a operadora conclui a anonimização/exclusão conforme a Política de Privacidade.",
			"Backups de infraestrutura podem persistir por período limitado técnico após a exclusão lógica; não são usados para restabelecer tratamento ativo.",
		],
	},
	{
		id: "direitos-titulares",
		title: "7. Direitos dos titulares",
		paragraphs: [
			"Pedidos de titulares relativos a dados da igreja devem ser dirigidos prioritariamente à controladora. A operadora apoia a controladora com meios técnicos razoáveis (exportação, exclusão/anonimização) pelos fluxos do produto e canais oficiais.",
			`Contato da operadora / DPO: ${legalMeta.dpoName} — ${legalMeta.dpoEmail}.`,
		],
	},
	{
		id: "vigencia",
		title: "8. Vigência",
		paragraphs: [
			"Este adendo vigorará enquanto a igreja utilizar o serviço. Alterações relevantes serão versionadas (DPA_VERSION) e poderão exigir novo aceite pelo responsável da igreja.",
		],
	},
];
