export type EventAvailabilityStatus = "available" | "unavailable";

export type RosterCandidateFilter =
  | "all"
  | "available"
  | "pending"
  | "unavailable";

export type RosterAssignableCandidate = {
  memberId: string;
  memberName: string;
  availabilityStatus: EventAvailabilityStatus | null;
  roleLabels: string[];
};

export function rankCandidateAvailability(
  status: EventAvailabilityStatus | null,
): number {
  if (status === "available") {
    return 0;
  }

  if (status === null) {
    return 1;
  }

  return 2;
}

export function matchesRosterCandidateFilter(
  status: EventAvailabilityStatus | null,
  filter: RosterCandidateFilter,
): boolean {
  switch (filter) {
    case "available":
      return status === "available";
    case "unavailable":
      return status === "unavailable";
    case "pending":
      return status === null;
    case "all":
    default:
      return true;
  }
}

export function matchesRosterCandidateSearch(
  candidate: Pick<RosterAssignableCandidate, "memberName">,
  query: string,
): boolean {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");

  if (!normalized) {
    return true;
  }

  return candidate.memberName.toLocaleLowerCase("pt-BR").includes(normalized);
}

/**
 * Lista o time completo (já vem do backend). Só aplica busca/filtro e
 * ordenação estável: disponível → sem resposta → indisponível, depois nome.
 */
export function prepareRosterAssignableCandidates(
  candidates: RosterAssignableCandidate[],
  options: {
    filter?: RosterCandidateFilter;
    search?: string;
  } = {},
): RosterAssignableCandidate[] {
  const filter = options.filter ?? "all";
  const search = options.search ?? "";

  return candidates
    .filter(
      (candidate) =>
        matchesRosterCandidateFilter(candidate.availabilityStatus, filter) &&
        matchesRosterCandidateSearch(candidate, search),
    )
    .slice()
    .sort(
      (a, b) =>
        rankCandidateAvailability(a.availabilityStatus) -
          rankCandidateAvailability(b.availabilityStatus) ||
        a.memberName.localeCompare(b.memberName, "pt-BR"),
    );
}
