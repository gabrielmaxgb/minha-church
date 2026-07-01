import { z } from "zod";

import { isValidEmail } from "../shared";

export function createProfileSchema(emailRequired: boolean) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Nome deve ter pelo menos 2 caracteres."),
      email: z.string(),
      phone: z.string(),
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
    });
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;
