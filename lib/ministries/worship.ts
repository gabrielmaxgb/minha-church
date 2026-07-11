export type MinistryArchetype = "none" | "worship";

export type EventAvailabilityStatus = "available" | "unavailable";

export const WORSHIP_INSTRUMENTS = [
  { id: "vocal", label: "Vocal" },
  { id: "backing_vocal", label: "Backing vocal" },
  { id: "acoustic_guitar", label: "Violão" },
  { id: "electric_guitar", label: "Guitarra" },
  { id: "bass", label: "Baixo" },
  { id: "drums", label: "Bateria" },
  { id: "keys", label: "Teclado" },
  { id: "pads", label: "Pads / loops" },
  { id: "violin", label: "Violino" },
  { id: "saxophone", label: "Saxofone" },
  { id: "other", label: "Outro" },
] as const;

export type WorshipInstrumentId = (typeof WORSHIP_INSTRUMENTS)[number]["id"];

export type WorshipAvailabilityPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export const WORSHIP_AVAILABILITY_PERIODS: Array<{
  id: WorshipAvailabilityPeriod;
  label: string;
  description: string;
}> = [
  {
    id: "weekly",
    label: "Semanal",
    description: "Eventos desta semana (segunda a domingo)",
  },
  {
    id: "monthly",
    label: "Mensal",
    description: "Todos os eventos do mês atual",
  },
  {
    id: "quarterly",
    label: "Trimestral",
    description: "Eventos do trimestre atual",
  },
  {
    id: "semiannual",
    label: "Semestral",
    description: "Eventos dos próximos 6 meses",
  },
  {
    id: "annual",
    label: "Anual",
    description: "Eventos do ano inteiro",
  },
];

export function formatWorshipInstrument(id: string): string {
  return (
    WORSHIP_INSTRUMENTS.find((item) => item.id === id)?.label ?? id
  );
}
