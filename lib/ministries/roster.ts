export type EventAvailabilityStatus = "available" | "unavailable";

export type RosterAvailabilityPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

/** Presets comuns para funções na escala (louvor, mídia, recepção, etc.). */
export const ROSTER_ROLE_PRESETS = [
  { id: "reception", label: "Recepção" },
  { id: "media", label: "Mídia" },
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

export type RosterRolePresetId = (typeof ROSTER_ROLE_PRESETS)[number]["id"];

export const ROSTER_AVAILABILITY_PERIODS: Array<{
  id: RosterAvailabilityPeriod;
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

export function formatRosterRole(id: string): string {
  return ROSTER_ROLE_PRESETS.find((item) => item.id === id)?.label ?? id;
}

export function normalizeRosterRoleValue(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const preset = ROSTER_ROLE_PRESETS.find(
    (item) =>
      item.id === trimmed ||
      item.id === trimmed.toLowerCase() ||
      item.label.toLowerCase() === trimmed.toLowerCase(),
  );

  return preset?.id ?? trimmed;
}

export function normalizeRosterRoleList(values: string[]): string[] {
  const normalized = values
    .map(normalizeRosterRoleValue)
    .filter(Boolean);

  return [...new Set(normalized)];
}

export function rosterRolesEqual(left: string[], right: string[]): boolean {
  const leftNormalized = normalizeRosterRoleList(left).sort();
  const rightNormalized = normalizeRosterRoleList(right).sort();

  if (leftNormalized.length !== rightNormalized.length) {
    return false;
  }

  return leftNormalized.every((value, index) => value === rightNormalized[index]);
}

export function isRosterRoleSelected(
  values: string[],
  presetId: RosterRolePresetId | string,
): boolean {
  const preset = ROSTER_ROLE_PRESETS.find((item) => item.id === presetId);
  const target = preset?.id ?? normalizeRosterRoleValue(String(presetId));

  return normalizeRosterRoleList(values).includes(target);
}

export function addRosterRole(values: string[], value: string): string[] {
  const normalized = normalizeRosterRoleValue(value);

  if (!normalized || isRosterRoleSelected(values, normalized)) {
    return values;
  }

  return [...values, normalized];
}

export function memberCanFillEventRole(
  memberRoleLabels: string[],
  slotLabel: string,
): boolean {
  const target = normalizeRosterRoleValue(slotLabel);

  return normalizeRosterRoleList(memberRoleLabels).some(
    (role) => normalizeRosterRoleValue(role) === target,
  );
}

export function needsRosterFunctions(values: string[]): boolean {
  return normalizeRosterRoleList(values).length === 0;
}

export function removeRosterRole(values: string[], value: string): string[] {
  const target = normalizeRosterRoleValue(value);

  return values.filter(
    (item) => normalizeRosterRoleValue(item) !== target,
  );
}

export const ROSTER_SLOT_MIN_REQUIRED_COUNT = 1;
export const ROSTER_SLOT_MAX_REQUIRED_COUNT = 50;

export interface RosterSlotPlanItem {
  label: string;
  requiredCount: number;
}

export function clampRosterRequiredCount(value: number): number {
  const parsed = Number.isFinite(value) ? Math.trunc(value) : 1;

  return Math.min(
    ROSTER_SLOT_MAX_REQUIRED_COUNT,
    Math.max(ROSTER_SLOT_MIN_REQUIRED_COUNT, parsed || 1),
  );
}

export function normalizeRosterSlotPlan(
  items: Array<{ label: string; requiredCount?: number }>,
): RosterSlotPlanItem[] {
  const seen = new Set<string>();
  const result: RosterSlotPlanItem[] = [];

  for (const raw of items) {
    const label = normalizeRosterRoleValue(raw.label);

    if (!label) {
      continue;
    }

    const key = label.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({
      label,
      requiredCount: clampRosterRequiredCount(raw.requiredCount ?? 1),
    });
  }

  return result;
}

export function rosterSlotsToPlan(
  slots: Array<{ label: string; requiredCount?: number }>,
): RosterSlotPlanItem[] {
  return normalizeRosterSlotPlan(
    slots.map((slot) => ({
      label: slot.label,
      requiredCount: slot.requiredCount ?? 1,
    })),
  );
}

export function rosterSlotPlanEqual(
  left: RosterSlotPlanItem[],
  right: RosterSlotPlanItem[],
): boolean {
  const leftNormalized = normalizeRosterSlotPlan(left);
  const rightNormalized = normalizeRosterSlotPlan(right);

  if (leftNormalized.length !== rightNormalized.length) {
    return false;
  }

  return leftNormalized.every((item, index) => {
    const other = rightNormalized[index];

    return (
      item.label === other.label &&
      item.requiredCount === other.requiredCount
    );
  });
}

export function addRosterSlotPlanItem(
  plan: RosterSlotPlanItem[],
  label: string,
  requiredCount = 1,
): RosterSlotPlanItem[] {
  const normalized = normalizeRosterRoleValue(label);

  if (!normalized) {
    return plan;
  }

  if (isRosterRoleSelected(plan.map((item) => item.label), normalized)) {
    return plan;
  }

  return [
    ...plan,
    {
      label: normalized,
      requiredCount: clampRosterRequiredCount(requiredCount),
    },
  ];
}

export function removeRosterSlotPlanItem(
  plan: RosterSlotPlanItem[],
  label: string,
): RosterSlotPlanItem[] {
  const target = normalizeRosterRoleValue(label);

  return plan.filter((item) => normalizeRosterRoleValue(item.label) !== target);
}

export function updateRosterSlotPlanCount(
  plan: RosterSlotPlanItem[],
  label: string,
  requiredCount: number,
): RosterSlotPlanItem[] {
  const target = normalizeRosterRoleValue(label);

  return plan.map((item) =>
    normalizeRosterRoleValue(item.label) === target
      ? { ...item, requiredCount: clampRosterRequiredCount(requiredCount) }
      : item,
  );
}

export function countRequiredRosterPositions(
  slots: Array<{ requiredCount: number }>,
): number {
  return slots.reduce((total, slot) => total + slot.requiredCount, 0);
}

export function countFilledRosterPositions(
  slots: Array<{ assignedCount?: number; assignments?: unknown[] }>,
): number {
  return slots.reduce((total, slot) => {
    if (typeof slot.assignedCount === "number") {
      return total + slot.assignedCount;
    }

    return total + (slot.assignments?.length ?? 0);
  }, 0);
}

export function slotHasVacancy(
  slot: { requiredCount: number; assignedCount?: number },
): boolean {
  return (slot.assignedCount ?? 0) < slot.requiredCount;
}

export function isRosterFullyStaffed(
  slots: Array<{ requiredCount: number; assignedCount?: number }>,
): boolean {
  if (slots.length === 0) {
    return false;
  }

  return slots.every((slot) => (slot.assignedCount ?? 0) >= slot.requiredCount);
}

/** @deprecated Use ROSTER_ROLE_PRESETS */
export const WORSHIP_INSTRUMENTS = ROSTER_ROLE_PRESETS;

/** @deprecated Use formatRosterRole */
export function formatWorshipInstrument(id: string): string {
  return formatRosterRole(id);
}

/** @deprecated Use RosterAvailabilityPeriod */
export type WorshipAvailabilityPeriod = RosterAvailabilityPeriod;

/** @deprecated Use ROSTER_AVAILABILITY_PERIODS */
export const WORSHIP_AVAILABILITY_PERIODS = ROSTER_AVAILABILITY_PERIODS;
