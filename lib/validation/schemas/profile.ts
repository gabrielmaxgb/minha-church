import { z } from "zod";

import { isValidEmail } from "../shared";

const genderSchema = z.enum(["male", "female", ""]);
const maritalStatusSchema = z.enum([
  "single",
  "married",
  "divorced",
  "widowed",
  "",
]);

export function createProfileSchema(emailRequired: boolean) {
  return z
    .object({
      name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
      email: z.string(),
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
    })
    .superRefine((data, ctx) => {
      if (emailRequired && !data.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe seu e-mail.",
          path: ["email"],
        });
      }

      if (data.email.trim() && !isValidEmail(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "E-mail inválido.",
          path: ["email"],
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
    });
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;
