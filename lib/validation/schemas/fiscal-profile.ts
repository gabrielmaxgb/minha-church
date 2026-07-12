import { z } from "zod";

import { isValidCnpj, isValidCpf } from "@/lib/validation/shared";

/**
 * Identidade fiscal da igreja no Minha Church.
 * Endereço/contato ficam com o Stripe no onboarding.
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
  })
  .superRefine((data, ctx) => {
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
    } else if (
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
  });

export type FiscalProfileFormValues = z.infer<typeof fiscalProfileSchema>;
