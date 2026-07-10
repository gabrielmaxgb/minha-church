import type {
  Gender,
  MaritalStatus,
  Member,
  MemberStatus,
} from "@/types/members";

export interface MemberFormValues {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneSecondary: string;
  birthDate: string;
  gender: Gender | "";
  maritalStatus: MaritalStatus | "";
  weddingAnniversary: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  status: MemberStatus;
  visitorSince: string;
  baptismDate: string;
  membershipDate: string;
  familyId: string;
}

export interface CreateMemberPayload {
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  phoneSecondary?: string;
  birthDate?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  weddingAnniversary?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: MemberStatus;
  visitorSince?: string;
  baptismDate?: string;
  membershipDate?: string;
  familyId?: string;
}

export interface UpdateMemberPayload {
  name?: string;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  weddingAnniversary?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status?: MemberStatus;
  visitorSince?: string | null;
  baptismDate?: string | null;
  membershipDate?: string | null;
  familyId?: string | null;
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.split("T")[0] ?? "";
}

function optionalString(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed || undefined;
}

function nullableString(value: string): string | null {
  const trimmed = value.trim();

  return trimmed || null;
}

export function emptyMemberFormValues(
  status: MemberStatus = "visitor",
): MemberFormValues {
  return {
    name: "",
    email: "",
    cpf: "",
    phone: "",
    phoneSecondary: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    weddingAnniversary: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    status,
    visitorSince: "",
    baptismDate: "",
    membershipDate: "",
    familyId: "",
  };
}

export function memberToFormValues(member: Member): MemberFormValues {
  return {
    name: member.name,
    email: member.email ?? "",
    cpf: member.cpf ?? "",
    phone: member.phone ?? "",
    phoneSecondary: member.phoneSecondary ?? "",
    birthDate: toDateInputValue(member.birthDate),
    gender: member.gender ?? "",
    maritalStatus: member.maritalStatus ?? "",
    weddingAnniversary: toDateInputValue(member.weddingAnniversary),
    street: member.street ?? "",
    number: member.number ?? "",
    complement: member.complement ?? "",
    neighborhood: member.neighborhood ?? "",
    city: member.city ?? "",
    state: member.state ?? "",
    zipCode: member.zipCode ?? "",
    status: member.status,
    visitorSince: toDateInputValue(member.visitorSince),
    baptismDate: toDateInputValue(member.baptismDate),
    membershipDate: toDateInputValue(member.membershipDate),
    familyId: member.familyId ?? "",
  };
}

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function formValuesToCreatePayload(
  values: MemberFormValues,
): CreateMemberPayload {
  return {
    name: values.name.trim(),
    email: optionalString(values.email),
    cpf: optionalString(normalizeCpf(values.cpf)) || undefined,
    phone: optionalString(values.phone),
    phoneSecondary: optionalString(values.phoneSecondary),
    birthDate: optionalString(values.birthDate),
    gender: values.gender || undefined,
    maritalStatus: values.maritalStatus || undefined,
    weddingAnniversary:
      values.maritalStatus === "married"
        ? optionalString(values.weddingAnniversary)
        : undefined,
    street: optionalString(values.street),
    number: optionalString(values.number),
    complement: optionalString(values.complement),
    neighborhood: optionalString(values.neighborhood),
    city: optionalString(values.city),
    state: optionalString(values.state),
    zipCode: optionalString(values.zipCode),
    status: values.status,
    visitorSince: optionalString(values.visitorSince),
    baptismDate: optionalString(values.baptismDate),
    membershipDate: optionalString(values.membershipDate),
    familyId: optionalString(values.familyId),
  };
}

export function formValuesToUpdatePayload(
  values: MemberFormValues,
): UpdateMemberPayload {
  return {
    name: values.name.trim(),
    email: nullableString(values.email),
    cpf: nullableString(normalizeCpf(values.cpf)),
    phone: nullableString(values.phone),
    phoneSecondary: nullableString(values.phoneSecondary),
    birthDate: nullableString(values.birthDate),
    gender: values.gender || null,
    maritalStatus: values.maritalStatus || null,
    weddingAnniversary:
      values.maritalStatus === "married"
        ? nullableString(values.weddingAnniversary)
        : null,
    street: nullableString(values.street),
    number: nullableString(values.number),
    complement: nullableString(values.complement),
    neighborhood: nullableString(values.neighborhood),
    city: nullableString(values.city),
    state: nullableString(values.state),
    zipCode: nullableString(values.zipCode),
    status: values.status,
    visitorSince: nullableString(values.visitorSince),
    baptismDate: nullableString(values.baptismDate),
    membershipDate: nullableString(values.membershipDate),
    familyId: nullableString(values.familyId),
  };
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Masculino",
  female: "Feminino",
  other: "Outro",
  prefer_not_to_say: "Prefiro não informar",
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: "Solteiro(a)",
  married: "Casado(a)",
  divorced: "Divorciado(a)",
  widowed: "Viúvo(a)",
};

export const MEMBER_STATUS_FORM_LABELS: Record<MemberStatus, string> = {
  visitor: "Visitante",
  active: "Membro ativo",
  inactive: "Inativo",
};
