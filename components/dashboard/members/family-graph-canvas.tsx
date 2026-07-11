"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Heart, Trash2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  FamilyGraphMember,
  MemberRelation,
  MemberRelationType,
} from "@/types/members";

interface FamilyGraphCanvasProps {
  members: FamilyGraphMember[];
  relations: MemberRelation[];
  canEdit: boolean;
  isBusy?: boolean;
  onCreateRelation: (payload: {
    fromMemberId: string;
    toMemberId: string;
    type: MemberRelationType;
  }) => Promise<void> | void;
  onDeleteRelation: (relationId: string) => Promise<void> | void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  generation: number;
}

const BASE_WIDTH = 1100;
const MIN_HEIGHT = 560;
const PAD_X = 96;
const PAD_Y = 80;
const NODE_W = 112;
const NODE_H = 96;
/** Vertical distance between generation centers — leaves room for edge markers. */
const ROW_GAP = 220;
/** Gap between siblings / unrelated people in a row. */
const COL_GAP = 96;
/** Slightly tighter gap between spouses, still room for the ♥. */
const SPOUSE_GAP = 72;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function restName(name: string) {
  return name.trim().split(/\s+/).slice(1).join(" ");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Build generation ranks from parent edges; spouses share a generation. */
function layoutNodes(
  members: FamilyGraphMember[],
  relations: MemberRelation[],
): { positions: NodePosition[]; height: number; width: number } {
  if (members.length === 0) {
    return { positions: [], height: MIN_HEIGHT, width: BASE_WIDTH };
  }

  const ids = members.map((m) => m.id);
  const idSet = new Set(ids);

  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const spouseOf = new Map<string, string>();

  for (const id of ids) {
    parentsOf.set(id, []);
    childrenOf.set(id, []);
  }

  for (const rel of relations) {
    if (!idSet.has(rel.fromMemberId) || !idSet.has(rel.toMemberId)) continue;

    if (rel.type === "parent") {
      parentsOf.get(rel.toMemberId)?.push(rel.fromMemberId);
      childrenOf.get(rel.fromMemberId)?.push(rel.toMemberId);
    } else if (rel.type === "spouse") {
      spouseOf.set(rel.fromMemberId, rel.toMemberId);
      spouseOf.set(rel.toMemberId, rel.fromMemberId);
    }
  }

  const generation = new Map<string, number>();
  const visiting = new Set<string>();

  function rank(id: string): number {
    const cached = generation.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;
    visiting.add(id);

    const parents = parentsOf.get(id) ?? [];
    let g = 0;
    if (parents.length > 0) {
      g = Math.max(...parents.map(rank)) + 1;
    }

    visiting.delete(id);
    generation.set(id, g);
    return g;
  }

  for (const id of ids) rank(id);

  // Spouses align to the same generation (prefer the lower/earlier one).
  for (const [a, b] of spouseOf) {
    const ga = generation.get(a) ?? 0;
    const gb = generation.get(b) ?? 0;
    const shared = Math.min(ga, gb);
    generation.set(a, shared);
    generation.set(b, shared);
  }

  // Re-propagate children after spouse alignment.
  let changed = true;
  let guard = 0;
  while (changed && guard < 8) {
    changed = false;
    guard += 1;
    for (const id of ids) {
      const parents = parentsOf.get(id) ?? [];
      if (parents.length === 0) continue;
      const next = Math.max(...parents.map((p) => generation.get(p) ?? 0)) + 1;
      if (next > (generation.get(id) ?? 0)) {
        generation.set(id, next);
        changed = true;
        const spouse = spouseOf.get(id);
        if (spouse) {
          const sg = generation.get(spouse) ?? 0;
          if (next < sg) generation.set(spouse, next);
          else if (next > sg) generation.set(id, sg);
        }
      }
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

  // Order each row: keep spouses adjacent; prefer parent-centroid for children.
  for (const g of gens) {
    const row = byGen.get(g) ?? [];
    const placed = new Set<string>();
    const ordered: string[] = [];

    const score = (id: string) => {
      const parents = parentsOf.get(id) ?? [];
      if (parents.length === 0) return 0;
      return (
        parents.reduce((sum, p) => {
          const pg = generation.get(p) ?? 0;
          const prow = byGen.get(pg) ?? [];
          const idx = prow.indexOf(p);
          return sum + (idx >= 0 ? idx : 0);
        }, 0) / parents.length
      );
    };

    row.sort((a, b) => score(a) - score(b) || a.localeCompare(b));

    for (const id of row) {
      if (placed.has(id)) continue;
      const spouse = spouseOf.get(id);
      if (spouse && row.includes(spouse) && !placed.has(spouse)) {
        // Put lower id first for stability, but keep pair together.
        if (id < spouse) {
          ordered.push(id, spouse);
        } else {
          ordered.push(spouse, id);
        }
        placed.add(id);
        placed.add(spouse);
      } else {
        ordered.push(id);
        placed.add(id);
      }
    }

    byGen.set(g, ordered);
  }

  const maxGen = gens.length > 0 ? Math.max(...gens) : 0;
  const height = Math.max(
    MIN_HEIGHT,
    PAD_Y * 2 + (maxGen + 1) * NODE_H + maxGen * (ROW_GAP - NODE_H),
  );

  // Measure each row with spouse-aware gaps, then size the canvas to fit.
  function rowWidth(row: string[]): number {
    if (row.length === 0) return 0;
    let w = NODE_W;
    for (let i = 0; i < row.length - 1; i += 1) {
      const a = row[i];
      const b = row[i + 1];
      const gap =
        spouseOf.get(a) === b || spouseOf.get(b) === a ? SPOUSE_GAP : COL_GAP;
      w += gap + NODE_W;
    }
    return w;
  }

  const widestRow = Math.max(...gens.map((g) => rowWidth(byGen.get(g) ?? [])), 0);
  const width = Math.max(BASE_WIDTH, widestRow + PAD_X * 2);

  const positions: NodePosition[] = [];

  for (const g of gens) {
    const row = byGen.get(g) ?? [];
    const totalWidth = rowWidth(row);
    let x = (width - totalWidth) / 2 + NODE_W / 2;
    const y = PAD_Y + NODE_H / 2 + g * ROW_GAP;

    row.forEach((id, index) => {
      positions.push({
        id,
        x,
        y,
        generation: g,
      });

      if (index < row.length - 1) {
        const next = row[index + 1];
        const gap =
          spouseOf.get(id) === next || spouseOf.get(next) === id
            ? SPOUSE_GAP
            : COL_GAP;
        x += NODE_W + gap;
      }
    });
  }

  return { positions, height, width };
}

function edgeEndpoints(
  from: NodePosition,
  to: NodePosition,
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  // Keep a visible segment even when cards are close — never eat more than ~35% per side.
  const inset = Math.min(52, dist * 0.35);

  return {
    start: { x: from.x + ux * inset, y: from.y + uy * inset },
    end: { x: to.x - ux * inset, y: to.y - uy * inset },
  };
}

function curvedPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  soft = true,
): string {
  if (!soft) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;
  const lift = Math.min(28, dist * 0.1);
  const cx = mx + (Math.abs(dy) > Math.abs(dx) ? (dx / dist) * lift * 0.15 : 0);
  const cy = my;

  return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
}

function pathMid(
  start: { x: number; y: number },
  end: { x: number; y: number },
  nudge = 0,
): { x: number; y: number } {
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  if (!nudge) return { x: mx, y: my };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;
  // Perpendicular offset so crossing edges don't stack markers.
  return {
    x: mx - (dy / dist) * nudge,
    y: my + (dx / dist) * nudge,
  };
}

export function FamilyGraphCanvas({
  members,
  relations,
  canEdit,
  isBusy,
  onCreateRelation,
  onDeleteRelation,
}: FamilyGraphCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingPair, setPendingPair] = useState<{
    fromId: string;
    toId: string;
  } | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const { positions, height, width } = useMemo(
    () => layoutNodes(members, relations),
    [members, relations],
  );
  const positionById = useMemo(
    () => new Map(positions.map((node) => [node.id, node])),
    [positions],
  );
  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  );

  function resetSelection() {
    setSelectedId(null);
    setPendingPair(null);
    setSelectedRelationId(null);
    setError(null);
  }

  function handleNodeClick(memberId: string) {
    if (!canEdit || isBusy) return;
    setSelectedRelationId(null);
    setError(null);

    if (!selectedId) {
      setSelectedId(memberId);
      setPendingPair(null);
      return;
    }

    if (selectedId === memberId) {
      resetSelection();
      return;
    }

    setPendingPair({ fromId: selectedId, toId: memberId });
  }

  async function chooseRelation(type: MemberRelationType) {
    if (!pendingPair) return;

    try {
      setError(null);
      await onCreateRelation({
        fromMemberId: pendingPair.fromId,
        toMemberId: pendingPair.toId,
        type,
      });
      resetSelection();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o vínculo.",
      );
    }
  }

  async function handleDeleteSelectedRelation() {
    if (!selectedRelationId) return;

    try {
      setError(null);
      await onDeleteRelation(selectedRelationId);
      resetSelection();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível remover o vínculo.",
      );
    }
  }

  if (members.length === 0) {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-domain-members/25 bg-domain-members-subtle/40 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-domain-members-subtle text-domain-members-foreground">
          <Users className="size-6" aria-hidden />
        </div>
        <p className="mt-4 text-base font-medium text-foreground">
          Ninguém nesta família ainda
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Vincule membros à família no cadastro para montar o grafo.
        </p>
      </div>
    );
  }

  const fromMember = pendingPair ? memberById.get(pendingPair.fromId) : null;
  const toMember = pendingPair ? memberById.get(pendingPair.toId) : null;
  const selectedRelation = selectedRelationId
    ? relations.find((relation) => relation.id === selectedRelationId)
    : null;

  const hint = !canEdit
    ? "Só visualização — quem edita membros pode criar vínculos."
    : pendingPair
      ? "Como a primeira pessoa se relaciona com a segunda?"
      : selectedId
        ? "Agora toque na outra pessoa."
        : "Toque em alguém, depois em outra pessoa.";

  const step = !canEdit ? 0 : pendingPair ? 2 : selectedId ? 1 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {canEdit && (
            <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    step >= n
                      ? "bg-domain-members"
                      : "bg-domain-members/20",
                  )}
                />
              ))}
            </div>
          )}
          <p className="truncate text-sm text-muted-foreground">{hint}</p>
        </div>
        {(selectedId || pendingPair || selectedRelationId) && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={resetSelection}
            disabled={isBusy}
            className="shrink-0"
          >
            <X className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-surface-elevated shadow-xs">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--domain-members) 16%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--domain-ministries) 10%, transparent), transparent 50%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />

        <div className="relative w-full overflow-x-auto">
          <div
            className="relative mx-auto"
            style={{
              width: "100%",
              minWidth: width,
              minHeight: height,
              aspectRatio: `${width} / ${height}`,
            }}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <marker
                  id="graph-arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M0,0 L7,3.5 L0,7 Z"
                    fill="var(--domain-members)"
                    opacity="0.85"
                  />
                </marker>
              </defs>

              {relations.map((relation) => {
                const from = positionById.get(relation.fromMemberId);
                const to = positionById.get(relation.toMemberId);
                if (!from || !to) return null;

                const isSpouse = relation.type === "spouse";
                const isSelected = selectedRelationId === relation.id;
                const { start, end } = edgeEndpoints(from, to);

                return (
                  <path
                    key={relation.id}
                    d={curvedPath(start, end, !isSpouse)}
                    fill="none"
                    stroke={
                      isSpouse
                        ? "var(--domain-ministries)"
                        : "var(--domain-members)"
                    }
                    strokeWidth={isSelected ? 3.25 : isSpouse ? 2.75 : 2.25}
                    strokeOpacity={isSelected ? 1 : isSpouse ? 0.85 : 0.7}
                    strokeLinecap="round"
                    markerEnd={isSpouse ? undefined : "url(#graph-arrow)"}
                  />
                );
              })}

              {pendingPair &&
                (() => {
                  const from = positionById.get(pendingPair.fromId);
                  const to = positionById.get(pendingPair.toId);
                  if (!from || !to) return null;
                  const { start, end } = edgeEndpoints(from, to);
                  return (
                    <path
                      d={curvedPath(start, end)}
                      fill="none"
                      stroke="var(--attention)"
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      strokeOpacity={0.95}
                      strokeLinecap="round"
                    />
                  );
                })()}
            </svg>

            {relations.map((relation) => {
              const from = positionById.get(relation.fromMemberId);
              const to = positionById.get(relation.toMemberId);
              if (!from || !to) return null;

              const isSpouse = relation.type === "spouse";
              const isSelected = selectedRelationId === relation.id;
              const { start, end } = edgeEndpoints(from, to);
              const parentEdges = relations.filter((r) => r.type === "parent");
              const parentIdx = isSpouse
                ? 0
                : parentEdges.findIndex((r) => r.id === relation.id);
              const nudge = isSpouse
                ? 0
                : (parentIdx - (parentEdges.length - 1) / 2) * 22;
              const mid = pathMid(start, end, nudge);

              return (
                <button
                  key={`label-${relation.id}`}
                  type="button"
                  disabled={!canEdit || isBusy}
                  title={
                    isSpouse
                      ? "Cônjuges — toque para remover"
                      : "Filiação — toque para remover"
                  }
                  onClick={() => {
                    setSelectedId(null);
                    setPendingPair(null);
                    setSelectedRelationId(relation.id);
                  }}
                  className={cn(
                    "absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-xs transition-transform",
                    isSpouse
                      ? "border-domain-ministries/25 bg-white text-domain-ministries-foreground"
                      : "border-domain-members/25 bg-white text-domain-members-foreground",
                    isSelected && "scale-110 ring-2 ring-foreground/10",
                    canEdit && "hover:scale-110",
                    !canEdit && "cursor-default",
                  )}
                  style={{
                    left: `${(mid.x / width) * 100}%`,
                    top: `${(mid.y / height) * 100}%`,
                    width: `${(32 / width) * 100}%`,
                    aspectRatio: "1",
                  }}
                >
                  {isSpouse ? (
                    <Heart className="size-[40%] fill-current" />
                  ) : (
                    <span
                      className="text-[clamp(10px,1.4vw,14px)] font-light leading-none"
                      aria-hidden
                    >
                      ↓
                    </span>
                  )}
                </button>
              );
            })}

            {positions.map((node, index) => {
              const member = memberById.get(node.id);
              if (!member) return null;

              const isSelected = selectedId === node.id;
              const inPending =
                pendingPair?.fromId === node.id ||
                pendingPair?.toId === node.id;
              const active = isSelected || inPending;
              const surname = restName(member.name);

              return (
                <motion.button
                  key={node.id}
                  type="button"
                  disabled={!canEdit || isBusy}
                  onClick={() => handleNodeClick(node.id)}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border bg-white/95 px-[2%] py-[1.5%] text-center shadow-xs backdrop-blur-sm transition-[box-shadow,border-color,transform] duration-200",
                    active
                      ? "border-domain-members shadow-popover ring-[3px] ring-domain-members/20"
                      : "border-black/[0.06] hover:border-domain-members/35 hover:shadow-popover",
                    canEdit && "cursor-pointer",
                    !canEdit && "cursor-default",
                  )}
                  style={{
                    left: `${(node.x / width) * 100}%`,
                    top: `${(node.y / height) * 100}%`,
                    width: `${(NODE_W / width) * 100}%`,
                    height: `${(NODE_H / height) * 100}%`,
                  }}
                >
                  <span
                    className={cn(
                      "flex aspect-square w-[38%] max-w-11 items-center justify-center rounded-full text-[clamp(10px,1.1vw,13px)] font-semibold tracking-wide",
                      active
                        ? "bg-domain-members text-white"
                        : "bg-domain-members-subtle text-domain-members-foreground",
                    )}
                  >
                    {initials(member.name)}
                  </span>
                  <span className="min-w-0 w-full">
                    <span className="block truncate text-[clamp(11px,1.2vw,13px)] font-medium leading-tight text-foreground">
                      {firstName(member.name)}
                    </span>
                    {surname ? (
                      <span className="mt-0.5 block truncate text-[clamp(9px,1vw,10px)] leading-tight text-muted-foreground">
                        {surname}
                      </span>
                    ) : null}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {pendingPair && fromMember && toMember && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-3 bottom-3 z-20 mx-auto max-w-md overflow-hidden rounded-2xl border border-border/60 bg-white/98 shadow-popover backdrop-blur-md sm:inset-x-4 sm:bottom-4"
          >
            <div className="border-b border-border/50 bg-domain-members-subtle/40 px-4 py-3 text-center">
              <p className="text-sm font-medium text-foreground">
                {firstName(fromMember.name)}
                <span className="mx-2 font-normal text-muted-foreground">
                  →
                </span>
                {firstName(toMember.name)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Ordem do toque
              </p>
            </div>

            <div className="grid gap-1 p-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void chooseRelation("spouse")}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-domain-ministries-subtle/70"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-domain-ministries-subtle text-domain-ministries-foreground">
                  <Heart className="size-3.5 fill-current" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  São cônjuges
                </span>
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => void chooseRelation("parent")}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-domain-members-subtle/80"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-domain-members-subtle text-[11px] font-semibold text-domain-members-foreground">
                  →
                </span>
                <span className="text-sm font-medium text-foreground">
                  {firstName(fromMember.name)} é pai/mãe de{" "}
                  {firstName(toMember.name)}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {selectedRelation && canEdit && !pendingPair && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-3 bottom-3 z-20 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white/98 px-4 py-3 shadow-popover backdrop-blur-md sm:inset-x-4 sm:bottom-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedRelation.type === "spouse" ? "Cônjuges" : "Filiação"}
              </p>
              <p className="text-xs text-muted-foreground">
                Remover este vínculo?
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void handleDeleteSelectedRelation()}
            >
              <Trash2 className="size-3.5" />
              Remover
            </Button>
          </motion.div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
