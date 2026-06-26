export interface FaqItem {
  question: string;
  answer: string;
}

export const generalFaq: FaqItem[] = [
  {
    question: "Preciso instalar algo?",
    answer:
      "Não. O Minha Church funciona 100% no navegador — acesse de qualquer computador, tablet ou celular, sem instalação.",
  },
  {
    question: "Posso importar meus membros de uma planilha?",
    answer:
      "Sim. Você pode importar membros via planilha Excel ou CSV. Nossa equipe também ajuda na migração de outros sistemas.",
  },
  {
    question: "Os dados da minha igreja são seguros?",
    answer:
      "Sim. Utilizamos criptografia, backups automáticos e seguimos as diretrizes da LGPD. Veja mais detalhes na página de Segurança.",
  },
  {
    question: "Como funciona o período gratuito?",
    answer:
      "Você testa todas as funcionalidades por 14 dias, sem cartão. Depois escolhe a faixa de membros e o ciclo de cobrança (mensal ou anual).",
  },
  {
    question: "Funciona para igrejas pequenas?",
    answer:
      "Sim. O Minha Church foi pensado para igrejas de todos os tamanhos — desde comunidades com poucas dezenas de membros até grandes congregações multi-campus.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim. Não há fidelidade. Você pode cancelar quando quiser e exportar seus dados antes de encerrar a conta.",
  },
];

export const billingFaq: FaqItem[] = [
  {
    question: "Preciso de cartão de crédito para começar?",
    answer:
      "Não. O teste de 14 dias é gratuito e não exige cartão de crédito.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito, boleto bancário e PIX — no ciclo mensal ou anual.",
  },
  {
    question: "Existe desconto no plano anual?",
    answer:
      "Sim. No plano anual você economiza o equivalente a 2 meses em relação ao pagamento mensal.",
  },
  {
    question: "O preço inclui todas as funcionalidades?",
    answer:
      "Sim. Todas as faixas incluem as mesmas funcionalidades — a diferença é apenas a quantidade de membros cadastrados.",
  },
  {
    question: "O que acontece se minha igreja crescer?",
    answer:
      "Quando você ultrapassar o limite da faixa atual, avisamos e você migra para a próxima. A cobrança é ajustada proporcionalmente.",
  },
  {
    question: "Posso mudar de mensal para anual depois?",
    answer:
      "Sim. Você pode alternar entre cobrança mensal e anual a qualquer momento pelo painel da conta.",
  },
];
