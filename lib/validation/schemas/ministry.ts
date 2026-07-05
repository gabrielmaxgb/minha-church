import { z } from "zod";

export const createMinistrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o ministério.")
    .min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string(),
  hasRoster: z.boolean(),
});

export type CreateMinistryFormValues = z.infer<typeof createMinistrySchema>;
