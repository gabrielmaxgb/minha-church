import { z } from "zod";

import type { MemberFormValues } from "@/lib/members/form";

import { isValidCpf, isValidEmail } from "../shared";

const memberStatusSchema = z.enum(["visitor", "active", "inactive"]);
const genderSchema = z.enum(["male", "female", ""]);
const maritalStatusSchema = z.enum([
	"single",
	"married",
	"divorced",
	"widowed",
	"",
]);

export const memberFormSchema = z.object({
	name: z.string(),
	email: z.string(),
	cpf: z.string(),
	phone: z.string(),
	phoneSecondary: z.string(),
	birthDate: z.string(),
	gender: genderSchema,
	maritalStatus: maritalStatusSchema,
	weddingAnniversary: z.string(),
	street: z.string(),
	number: z.string(),
	complement: z.string(),
	neighborhood: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	status: memberStatusSchema,
	visitorSince: z.string(),
	baptismDate: z.string(),
	membershipDate: z.string(),
	familyId: z.string(),
}) satisfies z.ZodType<MemberFormValues>;

export function createMemberFormSchema(
  options: { requireLogin?: boolean } = {},
) {
  return memberFormSchema.superRefine((data, ctx) => {
    const requireLogin =
      options.requireLogin ?? data.status === "active";
		if (!data.name.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Informe o nome da pessoa.",
				path: ["name"],
			});
		} else if (data.name.trim().length < 2) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nome deve ter pelo menos 2 caracteres.",
				path: ["name"],
			});
		}

		const hasEmail = Boolean(data.email.trim());
		const hasCpf = Boolean(data.cpf.trim());

		if (requireLogin && !hasEmail && !hasCpf) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Informe e-mail ou CPF para liberar o acesso ao sistema.",
				path: ["email"],
			});
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Informe e-mail ou CPF para liberar o acesso ao sistema.",
				path: ["cpf"],
			});
		}

		if (hasEmail && !isValidEmail(data.email)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "E-mail inválido.",
				path: ["email"],
			});
		}

		if (hasCpf && !isValidCpf(data.cpf)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "CPF inválido.",
				path: ["cpf"],
			});
		}

		if (data.state.trim() && data.state.trim().length !== 2) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Use a sigla do estado com 2 letras (ex: SP).",
				path: ["state"],
			});
		}

		if (data.zipCode.trim()) {
			const digits = data.zipCode.replace(/\D/g, "");

			if (digits.length !== 8) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "CEP deve ter 8 dígitos.",
					path: ["zipCode"],
				});
			}
		}

		if (
			data.birthDate &&
			data.membershipDate &&
			data.birthDate > data.membershipDate
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Data de membro não pode ser anterior ao nascimento.",
				path: ["membershipDate"],
			});
		}
	});
}
