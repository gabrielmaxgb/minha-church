import type { Metadata } from "next";

import { LegalDocumentContent } from "@/components/marketing/legal-document-content";
import { dpaSections, legalMeta } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Adendo LGPD (DPA)",
  description: `Acordo de tratamento de dados entre a igreja (controladora) e o ${legalMeta.productName} (operadora).`,
};

export default function DpaPage() {
  return (
    <LegalDocumentContent
      title="Adendo LGPD (DPA)"
      description={`Acordo de tratamento de dados pessoais: a igreja como controladora e o ${legalMeta.productName} como operadora.`}
      sections={dpaSections}
      relatedHref={PUBLIC_ROUTES.privacy}
      relatedLabel="Política de Privacidade"
    />
  );
}
