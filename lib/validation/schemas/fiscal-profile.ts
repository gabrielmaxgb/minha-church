import { z } from "zod";

import { isValidCnpj, isValidCpf } from "@/lib/validation/shared";

/**
 * Identidade fiscal + contato mínimo da igreja.
 * KYC/banco ficam no Stripe.
 */
export const fiscalProfileSchema = z
  .object({
    documentType: z.enum(["cnpj", "cpf"]),
    documentNumber: z.string().trim().min(1, "Informe o documento."),
    legalName: z
      .string()
      .trim()
      .min(2, "Informe a razão social ou nome da igreja."),
    responsibleName: z
      .string()
      .trim()
      .min(2, "Informe o nome do responsável."),
    responsibleDocument: z.string().trim().optional().or(z.literal("")),
    confirmNoCnpj: z.boolean().optional(),
    contactPhone: z.string().trim().min(1, "Informe o WhatsApp do responsável."),
    city: z.string().trim().min(2, "Informe a cidade."),
    state: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, "Informe a UF."),
  })
  .superRefine((data, ctx) => {
    const phoneDigits = data.contactPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefone inválido. Use DDD + número.",
        path: ["contactPhone"],
      });
    }

    if (data.documentType === "cnpj" && !isValidCnpj(data.documentNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido.",
        path: ["documentNumber"],
      });
    }

    if (data.documentType === "cpf" && !isValidCpf(data.documentNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido.",
        path: ["documentNumber"],
      });
    }

    if (data.documentType === "cnpj") {
      if (!data.responsibleDocument?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o CPF do responsável.",
          path: ["responsibleDocument"],
        });
      } else if (!isValidCpf(data.responsibleDocument)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF do responsável inválido.",
          path: ["responsibleDocument"],
        });
      }
    } else {
      if (!data.confirmNoCnpj) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Confirme que a igreja não possui CNPJ para continuar com CPF.",
          path: ["confirmNoCnpj"],
        });
      }

      if (
        data.responsibleDocument &&
        data.responsibleDocument.trim() &&
        !isValidCpf(data.responsibleDocument)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF do responsável inválido.",
          path: ["responsibleDocument"],
        });
      }
    }
  });

export type FiscalProfileFormValues = z.infer<typeof fiscalProfileSchema>;
