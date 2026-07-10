import {
  normalizeRosterRoleValue,
  ROSTER_ROLE_LEGACY_LABELS,
  ROSTER_ROLE_PRESETS,
} from "@/lib/ministries/roster";

const EXTRA_SERVICE_FUNCTION_PATTERNS = [
  /vocal/i,
  /teclad/i,
  /viol[aã]o/i,
  /guitar/i,
  /bater/i,
  /baixo/i,
  /m[ií]dia/i,
  /proje/i,
  /\bsom\b/i,
  /recep/i,
  /volunt/i,
  /saxof/i,
  /violino/i,
  /pads/i,
  /loops/i,
] as const;

/** Detecta nomes que parecem função de escala, não cargo de liderança. */
export function looksLikeServiceFunctionName(name: string): boolean {
  const trimmed = name.trim();

  if (!trimmed) {
    return false;
  }

  const normalized = normalizeRosterRoleValue(trimmed);
  const matchesPreset = [...ROSTER_ROLE_PRESETS, ...ROSTER_ROLE_LEGACY_LABELS].some(
    (item) =>
      item.id === normalized ||
      item.label.toLowerCase() === trimmed.toLowerCase(),
  );

  if (matchesPreset) {
    return true;
  }

  return EXTRA_SERVICE_FUNCTION_PATTERNS.some((pattern) =>
    pattern.test(trimmed),
  );
}
