import type { FamilyGraphMember, MemberRelation } from "@/types/members";

export const NODE_W = 150;
export const NODE_H = 92;
/** Vertical distance between generation centers. */
const ROW_GAP = 240;
/** Gap between unrelated people / separate households in a row. */
const COL_GAP = 96;
/** Gap between spouses — room for a clear short bond. */
const SPOUSE_GAP = 88;
/** Gap within a sibling cluster. */
const SIBLING_GAP = 88;
const PAD_X = 48;
const PAD_Y = 48;

/** Ascendant edges: from is older generation than to, by this many steps. */
const GENERATION_DELTA: Partial<Record<MemberRelation["type"], number>> = {
	parent: 1,
	step_parent: 1,
	parent_in_law: 1,
	uncle: 1,
	grandparent: 2,
};

export interface FamilyNodeLayout {
	id: string;
	/** Top-left position for React Flow. */
	x: number;
	y: number;
	generation: number;
}

export function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] ?? name;
}

export function restName(name: string): string {
	return name.trim().split(/\s+/).slice(1).join(" ");
}

export function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

/**
 * Genealogical layout:
 * - parent / step / in-law / uncle → older generation above
 * - grandparent → two generations above
 * - spouse + sibling → same generation, clustered
 */
export function computeFamilyLayout(
	members: FamilyGraphMember[],
	relations: MemberRelation[],
): FamilyNodeLayout[] {
	if (members.length === 0) {
		return [];
	}

	const ids = members.map((m) => m.id);
	const idSet = new Set(ids);

	/** child → list of { ancestorId, delta } */
	const ascendantsOf = new Map<string, { id: string; delta: number }[]>();
	const spouseOf = new Map<string, string>();
	const siblingsOf = new Map<string, Set<string>>();

	for (const id of ids) {
		ascendantsOf.set(id, []);
		siblingsOf.set(id, new Set());
	}

	for (const rel of relations) {
		if (!idSet.has(rel.fromMemberId) || !idSet.has(rel.toMemberId)) continue;

		const delta = GENERATION_DELTA[rel.type];
		if (delta !== undefined) {
			ascendantsOf.get(rel.toMemberId)?.push({
				id: rel.fromMemberId,
				delta,
			});
			continue;
		}

		if (rel.type === "spouse") {
			spouseOf.set(rel.fromMemberId, rel.toMemberId);
			spouseOf.set(rel.toMemberId, rel.fromMemberId);
			continue;
		}

		if (rel.type === "sibling") {
			siblingsOf.get(rel.fromMemberId)?.add(rel.toMemberId);
			siblingsOf.get(rel.toMemberId)?.add(rel.fromMemberId);
		}
	}

	// Expand sibling clusters transitively within the family.
	let siblingGrew = true;
	while (siblingGrew) {
		siblingGrew = false;
		for (const id of ids) {
			const mine = siblingsOf.get(id)!;
			for (const sib of [...mine]) {
				for (const other of siblingsOf.get(sib) ?? []) {
					if (other !== id && !mine.has(other)) {
						mine.add(other);
						siblingGrew = true;
					}
				}
			}
		}
	}

	const generation = new Map<string, number>();
	const visiting = new Set<string>();

	function rank(id: string): number {
		const cached = generation.get(id);
		if (cached !== undefined) return cached;
		if (visiting.has(id)) return 0;
		visiting.add(id);

		const ascendants = ascendantsOf.get(id) ?? [];
		let g = 0;
		if (ascendants.length > 0) {
			g = Math.max(
				...ascendants.map(({ id: ancestor, delta }) => rank(ancestor) + delta),
			);
		}

		visiting.delete(id);
		generation.set(id, g);
		return g;
	}

	for (const id of ids) rank(id);

	// Spouses/siblings share a generation. Use MAX so a ranked child
	// pulls an unranked partner/sibling down — never collapses children up to 0.
	for (const [a, b] of spouseOf) {
		const shared = Math.max(generation.get(a) ?? 0, generation.get(b) ?? 0);
		generation.set(a, shared);
		generation.set(b, shared);
	}

	for (const id of ids) {
		const cluster = [id, ...(siblingsOf.get(id) ?? [])];
		const shared = Math.max(
			...cluster.map((memberId) => generation.get(memberId) ?? 0),
		);
		for (const memberId of cluster) {
			generation.set(memberId, shared);
		}
	}

	// Re-propagate children after spouse/sibling alignment.
	let changed = true;
	let guard = 0;
	while (changed && guard < 12) {
		changed = false;
		guard += 1;

		for (const id of ids) {
			const ascendants = ascendantsOf.get(id) ?? [];
			if (ascendants.length === 0) continue;
			const next = Math.max(
				...ascendants.map(
					({ id: ancestor, delta }) => (generation.get(ancestor) ?? 0) + delta,
				),
			);
			if (next > (generation.get(id) ?? 0)) {
				generation.set(id, next);
				changed = true;
			}
		}

		for (const [a, b] of spouseOf) {
			const shared = Math.max(generation.get(a) ?? 0, generation.get(b) ?? 0);
			if (
				(generation.get(a) ?? 0) !== shared ||
				(generation.get(b) ?? 0) !== shared
			) {
				generation.set(a, shared);
				generation.set(b, shared);
				changed = true;
			}
		}

		for (const id of ids) {
			const cluster = [id, ...(siblingsOf.get(id) ?? [])];
			const shared = Math.max(
				...cluster.map((memberId) => generation.get(memberId) ?? 0),
			);
			for (const memberId of cluster) {
				if ((generation.get(memberId) ?? 0) !== shared) {
					generation.set(memberId, shared);
					changed = true;
				}
			}
		}
	}

	// Normalize so the top generation is 0.
	const minGen = Math.min(...ids.map((id) => generation.get(id) ?? 0));
	if (minGen !== 0) {
		for (const id of ids) {
			generation.set(id, (generation.get(id) ?? 0) - minGen);
		}
	}

	const byGen = new Map<number, string[]>();
	for (const id of ids) {
		const g = generation.get(id) ?? 0;
		const row = byGen.get(g) ?? [];
		row.push(id);
		byGen.set(g, row);
	}

	const gens = [...byGen.keys()].sort((a, b) => a - b);

	for (const g of gens) {
		const row = byGen.get(g) ?? [];
		const rowMembers = new Set(row);
		const placed = new Set<string>();
		const ordered: string[] = [];

		const score = (id: string) => {
			const ascendants = ascendantsOf.get(id) ?? [];
			if (ascendants.length === 0) return 0;
			return (
				ascendants.reduce((sum, { id: ancestor }) => {
					const ag = generation.get(ancestor) ?? 0;
					const arow = byGen.get(ag) ?? [];
					const idx = arow.indexOf(ancestor);
					return sum + (idx >= 0 ? idx : 0);
				}, 0) / ascendants.length
			);
		};

		row.sort((a, b) => score(a) - score(b) || a.localeCompare(b));

		/**
		 * Order a household cluster so siblings stay contiguous and spouses
		 * attach on the outside — never between siblings
		 * (e.g. Camila · Bruno ♥ Eduarda, not Bruno ♥ Eduarda · Camila).
		 */
		function orderHouseholdCluster(seed: string): string[] {
			const cluster = new Set<string>([seed]);
			const stack = [seed];
			while (stack.length > 0) {
				const current = stack.pop()!;
				const partner = spouseOf.get(current);
				if (partner && rowMembers.has(partner) && !cluster.has(partner)) {
					cluster.add(partner);
					stack.push(partner);
				}
				for (const sibling of siblingsOf.get(current) ?? []) {
					if (rowMembers.has(sibling) && !cluster.has(sibling)) {
						cluster.add(sibling);
						stack.push(sibling);
					}
				}
			}

			const siblingCore = new Set<string>();
			for (const id of cluster) {
				for (const sibling of siblingsOf.get(id) ?? []) {
					if (cluster.has(sibling)) {
						siblingCore.add(id);
						siblingCore.add(sibling);
					}
				}
			}

			if (siblingCore.size === 0) {
				const out: string[] = [];
				const seen = new Set<string>();
				const sorted = [...cluster].sort(
					(a, b) => score(a) - score(b) || a.localeCompare(b),
				);
				for (const id of sorted) {
					if (seen.has(id)) continue;
					const partner = spouseOf.get(id);
					if (partner && cluster.has(partner) && !seen.has(partner)) {
						out.push(id, partner);
						seen.add(id);
						seen.add(partner);
					} else {
						out.push(id);
						seen.add(id);
					}
				}
				return out;
			}

			// Put married siblings on the edges of the block so spouses attach
			// outside and never split the sibling line.
			const married: string[] = [];
			const unmarried: string[] = [];
			for (const id of [...siblingCore].sort(
				(a, b) => score(a) - score(b) || a.localeCompare(b),
			)) {
				const partner = spouseOf.get(id);
				if (partner && cluster.has(partner) && !siblingCore.has(partner)) {
					married.push(id);
				} else {
					unmarried.push(id);
				}
			}

			const leftMarried: string[] = [];
			const rightMarried: string[] = [];
			married.forEach((id, index) => {
				if (index % 2 === 0) {
					rightMarried.push(id);
				} else {
					leftMarried.unshift(id);
				}
			});

			const block = [...leftMarried, ...unmarried, ...rightMarried];
			const result = [...block];

			for (const person of leftMarried) {
				const partner = spouseOf.get(person);
				if (!partner || result.includes(partner)) continue;
				const index = result.indexOf(person);
				if (index >= 0) result.splice(index, 0, partner);
			}

			for (const person of [...rightMarried].reverse()) {
				const partner = spouseOf.get(person);
				if (!partner || result.includes(partner)) continue;
				const index = result.indexOf(person);
				if (index >= 0) result.splice(index + 1, 0, partner);
			}

			for (const id of cluster) {
				if (!result.includes(id)) {
					result.push(id);
				}
			}

			return result;
		}

		for (const id of row) {
			if (placed.has(id)) continue;

			for (const memberId of orderHouseholdCluster(id)) {
				ordered.push(memberId);
				placed.add(memberId);
			}
		}

		byGen.set(g, ordered);
	}

	function gapBetween(a: string, b: string): number {
		if (spouseOf.get(a) === b || spouseOf.get(b) === a) return SPOUSE_GAP;
		if (siblingsOf.get(a)?.has(b)) return SIBLING_GAP;
		return COL_GAP;
	}

	function rowWidth(row: string[]): number {
		if (row.length === 0) return 0;
		let w = NODE_W;
		for (let i = 0; i < row.length - 1; i += 1) {
			w += gapBetween(row[i]!, row[i + 1]!) + NODE_W;
		}
		return w;
	}

	const widestRow = Math.max(
		...gens.map((g) => rowWidth(byGen.get(g) ?? [])),
		0,
	);
	const canvasWidth = widestRow + PAD_X * 2;

	const layout: FamilyNodeLayout[] = [];

	for (const g of gens) {
		const row = byGen.get(g) ?? [];
		const totalWidth = rowWidth(row);
		let x = (canvasWidth - totalWidth) / 2;
		const y = PAD_Y + g * ROW_GAP;

		row.forEach((id, index) => {
			layout.push({ id, x, y, generation: g });

			if (index < row.length - 1) {
				x += NODE_W + gapBetween(id, row[index + 1]!);
			}
		});
	}

	return layout;
}
