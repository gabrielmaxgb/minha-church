/**
 * Textos legais públicos.
 * Revisão jurídica recomendada antes de considerar definitivo.
 * Endereço completo: completar quando for publicar no site (não veio no CNPJ colado).
 */

export const legalMeta = {
  productName: "Minha Church",
  legalName: "G MAX G DE BESSA DEV",
  tradeName: "GABRIEL MAX",
  cnpj: "40.887.745/0001-39",
  companySize: "ME",
  openedAtLabel: "17 de fevereiro de 2021",
  supportEmail: "gmaxgomes@gmail.com",
  lastUpdatedLabel: "16 de julho de 2026",
  lastUpdatedIso: "2026-07-16",
} as const;

export const legalCompanySummary = `${legalMeta.legalName}, nome fantasia ${legalMeta.tradeName}, inscrita no CNPJ sob o nº ${legalMeta.cnpj}`;

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
      `Microempresa (ME), com data de abertura em ${legalMeta.openedAtLabel}. Contato: ${legalMeta.supportEmail}.`,
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
      `A igreja (ou organização religiosa) que usa o ${legalMeta.productName} é responsável pelo conteúdo e pelos dados que cadastra — inclusive dados de membros, voluntários e visitantes.`,
      `O ${legalMeta.productName} presta o serviço de software (hospedagem e operação da plataforma). Não substitui aconselhamento pastoral, jurídico, contábil ou fiscal da igreja.`,
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
      "Após o cancelamento ou encerramento da conta, o acesso ao painel pode ser interrompido. Recomendamos exportar os dados que precisar antes de encerrar. Prazos de retenção e exclusão de dados pessoais estão descritos na Política de Privacidade.",
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
      `Prestador: ${legalMeta.legalName} — CNPJ ${legalMeta.cnpj}.`,
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
      "Dados de membros, voluntários, escalas, eventos, comunicações e demais informações cadastradas pela igreja no dia a dia: a igreja é a controladora; nós atuamos como operadores, processando esses dados sob instrução da igreja para prestar o serviço.",
      `Pedidos de titulares sobre dados da igreja devem, em primeiro lugar, ser feitos à própria igreja. Podemos apoiar a igreja no atendimento. Contato da plataforma: ${legalMeta.supportEmail}.`,
    ],
  },
  {
    id: "dados-coletados",
    title: "3. Quais dados coletamos",
    paragraphs: [
      "Dependendo do uso do produto, podemos tratar:",
    ],
    bullets: [
      "Dados de conta e perfil: nome, e-mail, telefone, senha (armazenada de forma segura), funções e permissões",
      "Dados da igreja: nome, endereço/contato, informações fiscais necessárias a recebimentos (quando configurados)",
      "Dados de membros e operação: fichas, ministérios, disponibilidade e escalas, eventos, inscrições, avisos e registros de uso do painel",
      "Dados de pagamento: tratados em grande parte pelo processador (ex.: Stripe); podemos receber status, identificadores e comprovantes necessários à operação",
      "Dados técnicos: endereço IP, logs de acesso, tipo de dispositivo/navegador e cookies essenciais de sessão",
    ],
  },
  {
    id: "finalidades",
    title: "4. Para que usamos os dados",
    paragraphs: [
      "Usamos dados pessoais para:",
    ],
    bullets: [
      "Prestar, manter e melhorar o serviço",
      "Autenticar usuários e controlar permissões",
      "Cobrar assinaturas e gerenciar o relacionamento comercial",
      "Enviar comunicações operacionais (ex.: confirmação de e-mail, avisos de segurança, cobrança)",
      "Prevenir fraudes, abusos e incidentes de segurança",
      "Cumprir obrigações legais e responder a autoridades, quando exigido",
    ],
  },
  {
    id: "bases-legais",
    title: "5. Bases legais (LGPD)",
    paragraphs: [
      "Conforme o caso, o tratamento pode se apoiar em: execução de contrato ou procedimentos preliminares; legítimo interesse (com avaliação de impacto quando cabível); cumprimento de obrigação legal/regulatória; e consentimento, quando exigido (por exemplo, certas comunicações de marketing).",
    ],
  },
  {
    id: "compartilhamento",
    title: "6. Compartilhamento",
    paragraphs: [
      "Não vendemos dados pessoais. Podemos compartilhar dados com:",
      "Sempre que possível, exigimos que esses terceiros tratem os dados apenas para as finalidades contratadas e com segurança adequada.",
    ],
    bullets: [
      "Prestadores de infraestrutura e operações (hospedagem, e-mail transacional, monitoramento), sob contrato e necessidade",
      "Processadores de pagamento (ex.: Stripe), para cobranças e recebimentos",
      "Autoridades públicas, quando houver obrigação legal ou ordem válida",
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies e sessões",
    paragraphs: [
      "Usamos cookies e tecnologias semelhantes essenciais para login, sessão e segurança. Cookies opcionais de analytics ou marketing, se forem adotados no futuro, serão informados e, quando exigido, sujeitos a preferências do usuário.",
    ],
  },
  {
    id: "retencao",
    title: "8. Retenção e exclusão",
    paragraphs: [
      "Mantemos dados pelo tempo necessário para prestar o serviço, cumprir obrigações legais, resolver disputas e exercer direitos. Após o encerramento da conta, podemos reter dados por prazo adicional limitado (por exemplo, obrigações fiscais ou defesa em processos), e em seguida excluí-los ou anonimizá-los, salvo retenção legal.",
      "A igreja, como controladora dos dados de membros, pode solicitar exclusão ou exportação conforme os fluxos do produto e o suporte.",
    ],
  },
  {
    id: "direitos",
    title: "9. Direitos do titular",
    paragraphs: [
      "Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade (quando aplicável), informação sobre compartilhamentos, revogação de consentimento e oposição a tratamentos em hipóteses legais.",
      `Para exercer direitos: contate a igreja (dados dela no produto) ou escreva para ${legalMeta.supportEmail}. Podemos pedir confirmação de identidade antes de atender.`,
    ],
  },
  {
    id: "seguranca",
    title: "10. Segurança",
    paragraphs: [
      "Adotamos medidas técnicas e organizacionais razoáveis (como criptografia em trânsito, controle de acesso e backups). Nenhum sistema é 100% imune a riscos; em caso de incidente relevante, seguiremos as obrigações legais de comunicação.",
    ],
  },
  {
    id: "menores",
    title: "11. Crianças e adolescentes",
    paragraphs: [
      "O produto pode conter dados de menores quando a igreja os cadastra. A igreja é responsável por obter as autorizações e bases legais adequadas. Se soubermos de tratamento irregular envolvendo menores, poderemos restringir o uso ou solicitar correção à igreja.",
    ],
  },
  {
    id: "internacional",
    title: "12. Transferências internacionais",
    paragraphs: [
      "Alguns fornecedores podem processar dados fora do Brasil. Nesses casos, buscamos salvaguardas compatíveis com a LGPD (contratuais e/ou mecanismos previstos na legislação).",
    ],
  },
  {
    id: "alteracoes-privacidade",
    title: "13. Alterações desta política",
    paragraphs: [
      "Podemos atualizar esta Política de Privacidade. A data da última atualização aparece no topo da página. Mudanças relevantes poderão ser comunicadas por e-mail ou aviso no produto.",
    ],
  },
  {
    id: "contato-privacidade",
    title: "14. Contato",
    paragraphs: [
      `Privacidade e proteção de dados: ${legalMeta.supportEmail}.`,
      `${legalMeta.legalName} — CNPJ ${legalMeta.cnpj} (nome fantasia ${legalMeta.tradeName}).`,
      "Quando houver encarregado (DPO) formalmente nomeado, seus dados de contato serão publicados nesta página.",
    ],
  },
];
