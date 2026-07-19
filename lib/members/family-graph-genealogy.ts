/**
 * Genealogy-style connectors — parents meet on a shared trunk, then a
 * horizontal rail fans out to children (Ancestry / MyHeritage / genogram).
 *
 * Avoids the classic “X” of independent parent→child curves.
 */

import {
  pointsToRoundedPath,
  type RoutePoint,
} from "@/lib/members/family-graph-edge-route";
import type { MemberRelation } from "@/types/members";
import { ASCENDANT_RELATION_TYPES } from "@/types/members";

export type GraphNodeBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FamilyUnit = {
  id: string;
  parentIds: string[];
  childIds: string[];
  /** Ascendant relation ids covered by this unit’s connector. */
  bundledAscendantIds: string[];
  /** Sibling ties between the unit’s children (implied by the rail). */
  bundledSiblingIds: string[];
};

function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

/**
 * Detect nuclear family units: a spouse pair (or co-parents) + their children.
 */
export function detectFamilyUnits(relations: MemberRelation[]): FamilyUnit[] {
  const spousePairs = new Map<string, [string, string]>();
  for (const relation of relations) {
    if (relation.type !== "spouse") continue;
    const key = pairKey(relation.fromMemberId, relation.toMemberId);
    spousePairs.set(key, [relation.fromMemberId, relation.toMemberId]);
  }

  const ascendants = relations.filter((relation) =>
    ASCENDANT_RELATION_TYPES.has(relation.type),
  );

  // Infer co-parents who both link to the same child, even without a spouse edge.
  const parentsByChild = new Map<string, Set<string>>();
  for (const relation of ascendants) {
    const bucket =
      parentsByChild.get(relation.toMemberId) ?? new Set<string>();
    bucket.add(relation.fromMemberId);
    parentsByChild.set(relation.toMemberId, bucket);
  }
  for (const parents of parentsByChild.values()) {
    const ids = [...parents];
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]!;
        const b = ids[j]!;
        const key = pairKey(a, b);
        if (!spousePairs.has(key)) spousePairs.set(key, [a, b]);
      }
    }
  }

  const units: FamilyUnit[] = [];
  let unitIndex = 0;

  for (const [a, b] of spousePairs.values()) {
    const childIds = [
      ...new Set(
        ascendants
          .filter(
            (relation) =>
              relation.fromMemberId === a || relation.fromMemberId === b,
          )
          .map((relation) => relation.toMemberId),
      ),
    ].sort();

    if (childIds.length === 0) continue;

    const childSet = new Set(childIds);
    const bundledAscendantIds = ascendants
      .filter(
        (relation) =>
          (relation.fromMemberId === a || relation.fromMemberId === b) &&
          childSet.has(relation.toMemberId),
      )
      .map((relation) => relation.id);

    const bundledSiblingIds = relations
      .filter(
        (relation) =>
          relation.type === "sibling" &&
          childSet.has(relation.fromMemberId) &&
          childSet.has(relation.toMemberId),
      )
      .map((relation) => relation.id);

    units.push({
      id: `unit-${unitIndex++}-${pairKey(a, b)}`,
      parentIds: [a, b],
      childIds,
      bundledAscendantIds,
      bundledSiblingIds,
    });
  }

  return units;
}

export function bundledRelationIds(units: FamilyUnit[]): Set<string> {
  const ids = new Set<string>();
  for (const unit of units) {
    for (const id of unit.bundledAscendantIds) ids.add(id);
    for (const id of unit.bundledSiblingIds) ids.add(id);
  }
  return ids;
}

function bottomCenter(box: GraphNodeBox): RoutePoint {
  return { x: box.x + box.width / 2, y: box.y + box.height };
}

function topCenter(box: GraphNodeBox): RoutePoint {
  return { x: box.x + box.width / 2, y: box.y };
}

function appendSubpath(
  d: string,
  points: RoutePoint[],
  radius: number,
): string {
  const next = pointsToRoundedPath(points, radius);
  if (!next) return d;
  return d ? `${d} ${next}` : next;
}

/** Geometry shared by the unit connector and per-edge hit paths. */
export function familyUnitGeometry(
  parents: GraphNodeBox[],
  children: GraphNodeBox[],
  options?: { joinGap?: number },
): {
  parentBottoms: RoutePoint[];
  childTops: RoutePoint[];
  coupleMidX: number;
  joinY: number;
  railY: number;
  railLeft: number;
  railRight: number;
} | null {
  if (parents.length === 0 || children.length === 0) return null;

  const joinGap = options?.joinGap ?? 24;

  const parentBottoms = [...parents]
    .map(bottomCenter)
    .sort((a, b) => a.x - b.x);
  const childTops = [...children].map(topCenter).sort((a, b) => a.x - b.x);

  const coupleMidX =
    parentBottoms.length === 1
      ? parentBottoms[0]!.x
      : (parentBottoms[0]!.x + parentBottoms[parentBottoms.length - 1]!.x) / 2;

  const parentBottomY = Math.max(...parentBottoms.map((p) => p.y));
  const childTopY = Math.min(...childTops.map((c) => c.y));
  const rawGap = childTopY - parentBottomY;

  // Keep join + rail strictly between generations, with room to breathe.
  const usableGap = Math.max(rawGap, joinGap * 3);
  const joinY = parentBottomY + Math.min(joinGap, usableGap * 0.22);
  let railY = parentBottomY + usableGap * 0.5;

  // Never let the rail sit on / past a child top (causes floating stubs).
  const maxRail = childTopY - 16;
  const minRail = joinY + 16;
  railY = Math.min(maxRail, Math.max(minRail, railY));

  // Rail always spans the trunk AND every child — this is what was missing
  // for a single offset child (trunk at midX, drop at child.x, no bridge).
  const childXs = childTops.map((c) => c.x);
  const railLeft = Math.min(coupleMidX, ...childXs);
  const railRight = Math.max(coupleMidX, ...childXs);

  return {
    parentBottoms,
    childTops,
    coupleMidX,
    joinY,
    railY,
    railLeft,
    railRight,
  };
}

/**
 * Full nuclear-family connector: cradle → trunk → rail → drops.
 * Always continuous — even with one child not centered under the couple.
 */
export function familyUnitConnectorPath(
  parents: GraphNodeBox[],
  children: GraphNodeBox[],
  options?: { cornerRadius?: number; joinGap?: number },
): string {
  const radius = options?.cornerRadius ?? 10;
  const geo = familyUnitGeometry(parents, children, {
    joinGap: options?.joinGap,
  });
  if (!geo) return "";

  const {
    parentBottoms,
    childTops,
    coupleMidX,
    joinY,
    railY,
    railLeft,
    railRight,
  } = geo;

  let d = "";

  // Cradle: each parent drops and meets on the join bar.
  for (const parent of parentBottoms) {
    d = appendSubpath(
      d,
      [
        { x: parent.x, y: parent.y },
        { x: parent.x, y: joinY },
        { x: coupleMidX, y: joinY },
      ],
      radius,
    );
  }

  // Trunk down to the rail.
  d = appendSubpath(
    d,
    [
      { x: coupleMidX, y: joinY },
      { x: coupleMidX, y: railY },
    ],
    radius,
  );

  // Rail always bridges trunk ↔ every child (fixes the offset-single-child gap).
  if (railRight - railLeft > 0.5) {
    d = appendSubpath(
      d,
      [
        { x: railLeft, y: railY },
        { x: railRight, y: railY },
      ],
      radius,
    );
  }

  // Vertical drop onto each child.
  for (const child of childTops) {
    d = appendSubpath(
      d,
      [
        { x: child.x, y: railY },
        { x: child.x, y: child.y },
      ],
      radius,
    );
  }

  return d;
}

/**
 * Single ascendant edge that still converges through the unit trunk/rail
 * (keeps one selectable edge per relation while looking bundled).
 */
export function genealogyAscendantPath(
  source: RoutePoint,
  target: RoutePoint,
  unit: {
    parentBottoms: RoutePoint[];
    childTops: RoutePoint[];
  },
  options?: { cornerRadius?: number; joinGap?: number },
): string {
  const radius = options?.cornerRadius ?? 10;
  const joinGap = options?.joinGap ?? 24;

  const parentBottoms = [...unit.parentBottoms].sort((a, b) => a.x - b.x);
  const childTops = [...unit.childTops].sort((a, b) => a.x - b.x);

  if (parentBottoms.length === 0 || childTops.length === 0) {
    return soloAscendantPath(source, target, { cornerRadius: radius });
  }

  // Rebuild boxes from points so geometry stays in sync with the unit stroke.
  const fakeParents: GraphNodeBox[] = parentBottoms.map((p, i) => ({
    id: `p-${i}`,
    x: p.x - 1,
    y: p.y - 1,
    width: 2,
    height: 1,
  }));
  const fakeChildren: GraphNodeBox[] = childTops.map((c, i) => ({
    id: `c-${i}`,
    x: c.x - 1,
    y: c.y,
    width: 2,
    height: 1,
  }));

  const geo = familyUnitGeometry(fakeParents, fakeChildren, { joinGap });
  if (!geo) {
    return soloAscendantPath(source, target, { cornerRadius: radius });
  }

  return pointsToRoundedPath(
    [
      source,
      { x: source.x, y: geo.joinY },
      { x: geo.coupleMidX, y: geo.joinY },
      { x: geo.coupleMidX, y: geo.railY },
      { x: target.x, y: geo.railY },
      target,
    ],
    radius,
  );
}

/** Clean orthogonal elbow for a lone parent→child (no co-parent unit). */
export function soloAscendantPath(
  source: RoutePoint,
  target: RoutePoint,
  options?: { cornerRadius?: number },
): string {
  const radius = options?.cornerRadius ?? 10;
  const midY = source.y + (target.y - source.y) / 2;
  return pointsToRoundedPath(
    [source, { x: source.x, y: midY }, { x: target.x, y: midY }, target],
    radius,
  );
}

/** Short horizontal bar between peers (spouse / sibling). */
export function peerConnectorPath(
  source: RoutePoint,
  target: RoutePoint,
  options?: { cornerRadius?: number },
): string {
  const radius = options?.cornerRadius ?? 8;
  if (Math.abs(source.y - target.y) < 8) {
    return pointsToRoundedPath([source, target], radius);
  }
  const midX = source.x + (target.x - source.x) / 2;
  return pointsToRoundedPath(
    [source, { x: midX, y: source.y }, { x: midX, y: target.y }, target],
    radius,
  );
}
