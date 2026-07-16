import type { Metadata } from "next";

import { LegalDocumentContent } from "@/components/marketing/legal-document-content";
import { legalMeta, termsOfUseSections } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: `Regras de uso do ${legalMeta.productName}: conta, planos, responsabilidades e cancelamento.`,
};

export default function TermosPage() {
  return (
    <LegalDocumentContent
      title="Termos de Uso"
      description={`Estas são as regras para usar o ${legalMeta.productName} — conta, planos, uso aceitável e responsabilidades da igreja e da plataforma.`}
      sections={termsOfUseSections}
      relatedHref={PUBLIC_ROUTES.privacy}
      relatedLabel="Política de Privacidade"
    />
  );
}
