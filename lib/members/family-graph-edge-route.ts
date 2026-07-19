/**
 * Orthogonal edge routing that contours around node rectangles.
 *
 * Same idea used by draw.io / Miro / ERD tools: treat cards as obstacles and
 * find a Manhattan (H/V) path through the free gutters between them — never
 * through a card, never "solved" by painting the stroke on top of a card.
 */

export type RoutePoint = { x: number; y: number };

export type RouteRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DEFAULT_GRID = 16;
const DEFAULT_PADDING = 14;
const DEFAULT_CORNER = 12;

function overlapsCell(
  cx: number,
  cy: number,
  grid: number,
  rect: RouteRect,
  padding: number,
): boolean {
  const left = rect.x - padding;
  const top = rect.y - padding;
  const right = rect.x + rect.width + padding;
  const bottom = rect.y + rect.height + padding;
  const cellLeft = cx * grid;
  const cellTop = cy * grid;
  const cellRight = cellLeft + grid;
  const cellBottom = cellTop + grid;
  return !(
    cellRight <= left ||
    cellLeft >= right ||
    cellBottom <= top ||
    cellTop >= bottom
  );
}

function cellOf(point: RoutePoint, grid: number): { cx: number; cy: number } {
  return {
    cx: Math.round(point.x / grid),
    cy: Math.round(point.y / grid),
  };
}

function keyOf(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

/**
 * A* on a coarse grid with 4-directional moves. Cells overlapping padded
 * obstacles are blocked (start/end stay walkable so handles remain reachable).
 */
function findGridPath(
  start: RoutePoint,
  end: RoutePoint,
  obstacles: RouteRect[],
  grid: number,
  padding: number,
): RoutePoint[] | null {
  const startCell = cellOf(start, grid);
  const endCell = cellOf(end, grid);
  const startKey = keyOf(startCell.cx, startCell.cy);
  const endKey = keyOf(endCell.cx, endCell.cy);

  if (startKey === endKey) {
    return [start, end];
  }

  let minX = Math.min(start.x, end.x);
  let minY = Math.min(start.y, end.y);
  let maxX = Math.max(start.x, end.x);
  let maxY = Math.max(start.y, end.y);
  for (const rect of obstacles) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }
  const margin = grid * 10;
  const minCx = Math.floor((minX - margin) / grid);
  const minCy = Math.floor((minY - margin) / grid);
  const maxCx = Math.ceil((maxX + margin) / grid);
  const maxCy = Math.ceil((maxY + margin) / grid);

  const blocked = new Set<string>();
  for (let cx = minCx; cx <= maxCx; cx++) {
    for (let cy = minCy; cy <= maxCy; cy++) {
      const k = keyOf(cx, cy);
      if (k === startKey || k === endKey) continue;
      for (const rect of obstacles) {
        if (overlapsCell(cx, cy, grid, rect, padding)) {
          blocked.add(k);
          break;
        }
      }
    }
  }

  type Node = { cx: number; cy: number; g: number; f: number };
  const open = new Map<string, Node>();
  const closed = new Set<string>();
  const cameFrom = new Map<string, string>();
  const heuristic = (cx: number, cy: number) =>
    Math.abs(cx - endCell.cx) + Math.abs(cy - endCell.cy);

  open.set(startKey, {
    cx: startCell.cx,
    cy: startCell.cy,
    g: 0,
    f: heuristic(startCell.cx, startCell.cy),
  });

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  let steps = 0;
  const MAX_STEPS = 10000;
  let reached = false;

  while (open.size > 0 && steps < MAX_STEPS) {
    steps++;
    let bestKey: string | null = null;
    let best: Node | null = null;
    for (const [k, node] of open) {
      if (!best || node.f < best.f) {
        best = node;
        bestKey = k;
      }
    }
    if (!best || !bestKey) break;
    open.delete(bestKey);
    closed.add(bestKey);

    if (bestKey === endKey) {
      reached = true;
      break;
    }

    for (const [dx, dy] of dirs) {
      const nx = best.cx + dx;
      const ny = best.cy + dy;
      if (nx < minCx || nx > maxCx || ny < minCy || ny > maxCy) continue;
      const nk = keyOf(nx, ny);
      if (closed.has(nk) || blocked.has(nk)) continue;
      const g = best.g + 1;
      const existing = open.get(nk);
      if (existing && existing.g <= g) continue;
      cameFrom.set(nk, bestKey);
      open.set(nk, {
        cx: nx,
        cy: ny,
        g,
        f: g + heuristic(nx, ny),
      });
    }
  }

  if (!reached) return null;

  const cells: { cx: number; cy: number }[] = [];
  let cursor: string | null = endKey;
  while (cursor) {
    const [cx, cy] = cursor.split(",").map(Number) as [number, number];
    cells.push({ cx, cy });
    cursor = cameFrom.get(cursor) ?? null;
  }
  cells.reverse();

  const points: RoutePoint[] = cells.map((cell) => ({
    x: cell.cx * grid + grid / 2,
    y: cell.cy * grid + grid / 2,
  }));

  points[0] = { ...start };
  points[points.length - 1] = { ...end };

  return simplifyOrthogonal(points);
}

/** Drop collinear midpoints so the polyline is only corners + ends. */
function simplifyOrthogonal(points: RoutePoint[]): RoutePoint[] {
  if (points.length <= 2) return points;
  const out: RoutePoint[] = [points[0]!];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1]!;
    const cur = points[i]!;
    const next = points[i + 1]!;
    const colinear =
      (prev.x === cur.x && cur.x === next.x) ||
      (prev.y === cur.y && cur.y === next.y);
    if (!colinear) out.push(cur);
  }
  out.push(points[points.length - 1]!);
  return out;
}

function segmentHitsObstacle(
  a: RoutePoint,
  b: RoutePoint,
  obstacles: RouteRect[],
  padding: number,
): boolean {
  const samples = Math.max(
    2,
    Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8),
  );
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    for (const rect of obstacles) {
      if (
        x >= rect.x - padding &&
        x <= rect.x + rect.width + padding &&
        y >= rect.y - padding &&
        y <= rect.y + rect.height + padding
      ) {
        return true;
      }
    }
  }
  return false;
}

function pathHitsObstacles(
  points: RoutePoint[],
  obstacles: RouteRect[],
  padding: number,
): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    if (segmentHitsObstacle(points[i]!, points[i + 1]!, obstacles, padding)) {
      return true;
    }
  }
  return false;
}

/** Fast candidates: classic elbow routes through mid gutters. */
function candidateElbows(
  start: RoutePoint,
  end: RoutePoint,
  laneOffset: number,
): RoutePoint[][] {
  const midY = (start.y + end.y) / 2;
  const midX = (start.x + end.x) / 2 + laneOffset;
  return [
    [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end],
    [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end],
    [
      start,
      { x: start.x, y: start.y + 40 },
      { x: end.x + laneOffset, y: start.y + 40 },
      { x: end.x + laneOffset, y: end.y - 40 },
      { x: end.x, y: end.y - 40 },
      end,
    ],
    [
      start,
      { x: start.x + (end.x >= start.x ? 40 : -40), y: start.y },
      {
        x: start.x + (end.x >= start.x ? 40 : -40),
        y: end.y,
      },
      end,
    ],
    [
      start,
      { x: start.x, y: midY },
      { x: Math.min(start.x, end.x) - 80, y: midY },
      { x: Math.min(start.x, end.x) - 80, y: end.y },
      end,
    ],
    [
      start,
      { x: start.x, y: midY },
      { x: Math.max(start.x, end.x) + 80, y: midY },
      { x: Math.max(start.x, end.x) + 80, y: end.y },
      end,
    ],
  ];
}

export function pointsToRoundedPath(points: RoutePoint[], radius: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0]!;
    return `M ${p.x} ${p.y}`;
  }
  if (points.length === 2) {
    const a = points[0]!;
    const b = points[1]!;
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    const next = points[i + 1]!;
    const dx1 = cur.x - prev.x;
    const dy1 = cur.y - prev.y;
    const dx2 = next.x - cur.x;
    const dy2 = next.y - cur.y;
    const len1 = Math.hypot(dx1, dy1) || 1;
    const len2 = Math.hypot(dx2, dy2) || 1;
    const r = Math.min(radius, len1 / 2, len2 / 2);
    const before = {
      x: cur.x - (dx1 / len1) * r,
      y: cur.y - (dy1 / len1) * r,
    };
    const after = {
      x: cur.x + (dx2 / len2) * r,
      y: cur.y + (dy2 / len2) * r,
    };
    d += ` L ${before.x} ${before.y} Q ${cur.x} ${cur.y} ${after.x} ${after.y}`;
  }
  const last = points[points.length - 1]!;
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export function routeAroundObstacles(
  start: RoutePoint,
  end: RoutePoint,
  obstacles: RouteRect[],
  options?: {
    padding?: number;
    grid?: number;
    cornerRadius?: number;
    /** Nudge parallel edges that share a target. */
    laneOffset?: number;
  },
): string {
  const padding = options?.padding ?? DEFAULT_PADDING;
  const grid = options?.grid ?? DEFAULT_GRID;
  const cornerRadius = options?.cornerRadius ?? DEFAULT_CORNER;
  const laneOffset = options?.laneOffset ?? 0;

  // 1) Prefer a cheap elbow that already clears every obstacle.
  for (const candidate of candidateElbows(start, end, laneOffset)) {
    if (!pathHitsObstacles(candidate, obstacles, padding)) {
      return pointsToRoundedPath(simplifyOrthogonal(candidate), cornerRadius);
    }
  }

  // 2) Fall back to grid A* that walks the gutters around cards.
  const routed = findGridPath(start, end, obstacles, grid, padding);
  if (routed && routed.length >= 2) {
    return pointsToRoundedPath(routed, cornerRadius);
  }

  // 3) Last resort: elbow without obstacle check (should be rare).
  const fallback = candidateElbows(start, end, laneOffset)[0]!;
  return pointsToRoundedPath(fallback, cornerRadius);
}
