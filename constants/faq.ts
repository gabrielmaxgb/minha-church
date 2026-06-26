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
      "O plano Gratuito é permanente para igrejas com até 50 membros. Nos planos pagos, você pode testar todos os recursos por 14 dias sem cartão de crédito.",
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
      "Não. O plano Gratuito não exige cartão. Nos planos pagos, o teste de 14 dias também é sem cartão.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer:
      "Sim. Você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito, boleto bancário e PIX para planos mensais e anuais.",
  },
  {
    question: "Existe desconto no plano anual?",
    answer:
      "Sim. No plano anual você economiza o equivalente a 2 meses em relação ao pagamento mensal.",
  },
  {
    question: "O que acontece se eu ultrapassar o limite de membros?",
    answer:
      "Avisamos quando você estiver próximo do limite. Você pode fazer upgrade para um plano superior ou entrar em contato conosco.",
  },
];
