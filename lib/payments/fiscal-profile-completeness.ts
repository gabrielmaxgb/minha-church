import { isValidCnpj, isValidCpf } from "@/lib/validation/shared";
import type { FiscalDocumentType, FiscalProfile } from "@/lib/api/payments";

export type FiscalConnectRequiredField =
  | "documentNumber"
  | "legalName"
  | "responsibleName"
  | "responsibleDocument";

export interface FiscalConnectRequiredItem {
  field: FiscalConnectRequiredField;
  label: string;
}

export interface FiscalConnectFieldStatus extends FiscalConnectRequiredItem {
  done: boolean;
}

/** Subset usado pelo checklist ao vivo (form draft ou perfil salvo). */
export type FiscalConnectDraft = {
  documentType: FiscalDocumentType;
  documentNumber: string;
  legalName: string;
  responsibleName: string;
  responsibleDocument?: string | null;
  contactPhone?: string | null;
  city?: string | null;
  state?: string | null;
};

function labelsFor(documentType: FiscalDocumentType | undefined) {
  const isCpf = documentType === "cpf";
  return {
    documentNumber: isCpf ? "CPF" : "CNPJ",
    legalName: isCpf ? "Nome da igreja / responsável" : "Razão social",
    responsibleName: "Responsável legal",
    responsibleDocument: "CPF do responsável",
  } as const;
}

function requiredFields(
  documentType: FiscalDocumentType | undefined,
): FiscalConnectRequiredField[] {
  const base: FiscalConnectRequiredField[] = [
    "documentNumber",
    "legalName",
    "responsibleName",
  ];

  if (documentType !== "cpf") {
    base.push("responsibleDocument");
  }

  return base;
}

function isFieldDone(
  field: FiscalConnectRequiredField,
  profile: FiscalConnectDraft,
): boolean {
  switch (field) {
    case "documentNumber":
      return profile.documentType === "cnpj"
        ? isValidCnpj(profile.documentNumber)
        : isValidCpf(profile.documentNumber);
    case "legalName":
      return profile.legalName.trim().length >= 2;
    case "responsibleName":
      return profile.responsibleName.trim().length >= 2;
    case "responsibleDocument":
      return Boolean(
        profile.responsibleDocument?.trim() &&
          isValidCpf(profile.responsibleDocument),
      );
    default:
      return false;
  }
}

/** Status de cada campo obrigatório (para checklist com checkbox). */
export function listFiscalFieldStatusForConnect(
  profile: FiscalConnectDraft | FiscalProfile | null | undefined,
): FiscalConnectFieldStatus[] {
  const documentType = profile?.documentType;
  const labels = labelsFor(documentType);
  const required = requiredFields(documentType);

  if (!profile) {
    return required.map((field) => ({
      field,
      label: labels[field],
      done: false,
    }));
  }

  return required.map((field) => ({
    field,
    label: labels[field],
    done: isFieldDone(field, profile),
  }));
}

/** Identidade fiscal mínima no app — o que o Stripe não devolve depois. */
export function listMissingFiscalFieldsForConnect(
  profile: FiscalConnectDraft | FiscalProfile | null | undefined,
): FiscalConnectRequiredItem[] {
  return listFiscalFieldStatusForConnect(profile)
    .filter((item) => !item.done)
    .map(({ field, label }) => ({ field, label }));
}

export function isFiscalProfileReadyForConnect(
  profile: FiscalConnectDraft | FiscalProfile | null | undefined,
): boolean {
  return listMissingFiscalFieldsForConnect(profile).length === 0;
}

export function isOwnerOnboardingMinimumComplete(
  profile: FiscalConnectDraft | FiscalProfile | null | undefined,
): boolean {
  if (!isFiscalProfileReadyForConnect(profile)) {
    return false;
  }

  const phone = (profile?.contactPhone ?? "").replace(/\D/g, "");
  const city = (profile?.city ?? "").trim();
  const state = (profile?.state ?? "").trim();

  return (
    phone.length >= 10 &&
    phone.length <= 11 &&
    city.length >= 2 &&
    /^[A-Za-z]{2}$/.test(state)
  );
}
