import { z } from "zod";

import { isValidCpf, isValidEmail, normalizeCpf } from "../shared";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail ou CPF.")
    .superRefine((value, ctx) => {
      if (value.includes("@")) {
        if (!isValidEmail(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "E-mail inválido.",
          });
        }

        return;
      }

      const digits = normalizeCpf(value);

      if (digits.length === 11) {
        if (!isValidCpf(digits)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF inválido.",
          });
        }

        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um e-mail ou CPF válido.",
      });
    }),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A confirmação da senha não confere.",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = loginSchema.pick({ identifier: true });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A confirmação da senha não confere.",
        path: ["confirmPassword"],
      });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
