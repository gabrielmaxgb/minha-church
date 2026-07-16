import type { Metadata } from "next";

import { LegalDocumentContent } from "@/components/marketing/legal-document-content";
import { legalMeta, privacyPolicySections } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como o ${legalMeta.productName} trata dados pessoais, em linha com a LGPD.`,
};

export default function PrivacidadePage() {
  return (
    <LegalDocumentContent
      title="Política de Privacidade"
      description={`Como coletamos, usamos e protegemos dados pessoais no ${legalMeta.productName}, incluindo o papel da igreja como controladora dos dados dos membros.`}
      sections={privacyPolicySections}
      relatedHref={PUBLIC_ROUTES.terms}
      relatedLabel="Termos de Uso"
    />
  );
}
