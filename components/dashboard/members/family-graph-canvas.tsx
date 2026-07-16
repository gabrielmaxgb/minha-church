"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { RotateCcw, Trash2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routeAroundObstacles } from "@/lib/members/family-graph-edge-route";
import {
  NODE_H,
  NODE_W,
  computeFamilyLayout,
  firstName,
  initials,
  restName,
} from "@/lib/members/family-graph-layout";
import type {
  FamilyGraphMember,
  MemberRelation,
  MemberRelationType,
} from "@/types/members";
import {
  ASCENDANT_RELATION_TYPES,
  MEMBER_RELATION_LABELS,
  UNDIRECTED_RELATION_TYPES,
  relationChoiceLabel,
} from "@/types/members";

const RELATION_CHOICES: MemberRelationType[] = [
  "spouse",
  "sibling",
  "parent",
  "grandparent",
  "step_parent",
  "parent_in_law",
  "uncle",
];

/**
 * Relation colors for data viz (distinct parentesco hues — not product domains).
 */
const RELATION_COLORS: Record<MemberRelationType, string> = {
  parent: "var(--relation-parent)",
  spouse: "var(--relation-spouse)",
  sibling: "var(--relation-sibling)",
  grandparent: "var(--relation-grandparent)",
  step_parent: "var(--relation-step-parent)",
  parent_in_law: "var(--relation-parent-in-law)",
  uncle: "var(--relation-uncle)",
};

const RELATION_LEGEND: {
  type: MemberRelationType;
  label: string;
}[] = [
  { type: "parent", label: "Pai/mãe → filho(a)" },
  { type: "spouse", label: "Cônjuges" },
  { type: "sibling", label: "Irmãos(ãs)" },
  { type: "grandparent", label: "Avô/avó → neto(a)" },
  { type: "step_parent", label: "Padrasto/madrasta" },
  { type: "parent_in_law", label: "Sogro/sogra" },
  { type: "uncle", label: "Tio/tia → sobrinho(a)" },
];

function relationStroke(type: MemberRelationType): string {
  return RELATION_COLORS[type];
}

function RelationColorSwatch({
  type,
  className,
}: {
  type: MemberRelationType;
  className?: string;
}) {
  const dashed = type === "step_parent" || type === "uncle";
  return (
    <span
      className={cn("block h-1.5 w-7 shrink-0 rounded-full", className)}
      style={{
        backgroundColor: dashed ? "transparent" : relationStroke(type),
        borderTop: dashed ? `2.5px dashed ${relationStroke(type)}` : undefined,
        height: dashed ? 0 : undefined,
        marginTop: dashed ? 4 : undefined,
      }}
      aria-hidden
    />
  );
}

interface FamilyGraphCanvasProps {
  familyId: string;
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

type NodePos = { x: number; y: number };

/* -------------------------------------------------------------------------- */
/* Position persistence (per family, localStorage)                            */
/* -------------------------------------------------------------------------- */

function storageKey(familyId: string): string {
  return `mc:familyGraph:positions:${familyId}`;
}

function loadPositions(familyId: string): Record<string, NodePos> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(familyId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, NodePos>;
    }
  } catch {
    // Ignora cache corrompido.
  }
  return {};
}

function persistPositions(familyId: string, positions: Record<string, NodePos>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(familyId),
      JSON.stringify(positions),
    );
  } catch {
    // Ignora quota/erros de storage.
  }
}

/* -------------------------------------------------------------------------- */
/* Custom node                                                                */
/* -------------------------------------------------------------------------- */

type MemberNodeData = {
  member: FamilyGraphMember;
  active: boolean;
  canEdit: boolean;
};

type MemberFlowNode = Node<MemberNodeData, "member">;

const handleClassName =
  "!h-2 !w-2 !min-w-0 !border-0 !bg-transparent !opacity-0";

function MemberNode({ data }: NodeProps<MemberFlowNode>) {
  const { member, active, canEdit } = data;
  const surname = restName(member.name);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border bg-white/95 px-3 py-2 text-center shadow-xs backdrop-blur-sm transition-[box-shadow,border-color] duration-200",
        active
          ? "border-billing shadow-popover ring-[3px] ring-billing/20"
          : "border-black/6 hover:border-billing/35 hover:shadow-popover",
        canEdit ? "cursor-pointer" : "cursor-default",
      )}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle
        id="t"
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={handleClassName}
      />
      <Handle
        id="l"
        type="target"
        position={Position.Left}
        isConnectable={false}
        className={handleClassName}
      />

      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-[13px] font-semibold tracking-wide",
          active
            ? "bg-billing text-white"
            : "bg-billing-subtle text-billing-foreground",
        )}
      >
        {initials(member.name)}
      </span>
      <span className="min-w-0 w-full">
        <span className="block truncate text-[13px] font-medium leading-tight text-foreground">
          {firstName(member.name)}
        </span>
        {surname ? (
          <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
            {surname}
          </span>
        ) : null}
      </span>

      <Handle
        id="b"
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={handleClassName}
      />
      <Handle
        id="r"
        type="source"
        position={Position.Right}
        isConnectable={false}
        className={handleClassName}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Custom edge                                                                */
/* -------------------------------------------------------------------------- */

type RelationEdgeData = {
  relationType: MemberRelationType;
  isSelected: boolean;
  /** Horizontal shift for the mid-segment so parallel ascendant lines fan out. */
  laneOffset?: number;
};

type RelationFlowEdge = Edge<RelationEdgeData, "relation">;

function RelationEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  data,
}: EdgeProps<RelationFlowEdge>) {
  const relationType = data?.relationType ?? "parent";
  const isPeer = UNDIRECTED_RELATION_TYPES.has(relationType);
  const isSelected = data?.isSelected ?? false;
  const laneOffset = data?.laneOffset ?? 0;
  const color = relationStroke(relationType);

  // Cards are obstacles — route through gutters, never through a member.
  const obstacles = useStore((state) =>
    state.nodes
      .filter((node) => node.id !== source && node.id !== target)
      .map((node) => ({
        x: node.position.x,
        y: node.position.y,
        width: NODE_W,
        height: NODE_H,
      })),
  );

  const edgePath = useMemo(
    () =>
      routeAroundObstacles(
        { x: sourceX, y: sourceY },
        { x: targetX, y: targetY },
        obstacles,
        { laneOffset, padding: 16, grid: 16, cornerRadius: 14 },
      ),
    [sourceX, sourceY, targetX, targetY, obstacles, laneOffset],
  );

  return (
    <>
      {/* Soft halo only for readability when two lines cross in a gutter. */}
      <BaseEdge
        id={`${id}-halo`}
        path={edgePath}
        style={{
          stroke: "rgba(255,255,255,0.9)",
          strokeWidth: isSelected ? 7 : 5.5,
          strokeLinecap: "round",
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={28}
        style={{
          stroke: color,
          strokeWidth: isSelected ? 3.5 : isPeer ? 3 : 2.75,
          strokeOpacity: 1,
          strokeLinecap: "round",
          strokeDasharray:
            relationType === "step_parent" || relationType === "uncle"
              ? "6 5"
              : undefined,
        }}
      />
    </>
  );
}

const nodeTypes = { member: MemberNode };
const edgeTypes = { relation: RelationEdge };

/* -------------------------------------------------------------------------- */
/* Inner flow                                                                 */
/* -------------------------------------------------------------------------- */

function FamilyGraphFlow({
  familyId,
  members,
  relations,
  canEdit,
  isBusy,
  onCreateRelation,
  onDeleteRelation,
}: FamilyGraphCanvasProps) {
  const { fitView } = useReactFlow();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingPair, setPendingPair] = useState<{
    fromId: string;
    toId: string;
  } | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(
    null,
  );
  const [layoutTick, setLayoutTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const positionsRef = useRef<Record<string, NodePos>>(loadPositions(familyId));

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<MemberFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationFlowEdge>([]);

  function resetSelection() {
    setSelectedId(null);
    setPendingPair(null);
    setSelectedRelationId(null);
    setError(null);
  }

  const handleSelectRelation = useCallback((relationId: string) => {
    setSelectedId(null);
    setPendingPair(null);
    setSelectedRelationId(relationId);
    setError(null);
  }, []);

  const handleEdgeClick = useCallback(
    (_event: unknown, edge: RelationFlowEdge) => {
      if (!canEdit || isBusy || edge.id === "pending-edge") return;
      handleSelectRelation(edge.id);
    },
    [canEdit, isBusy, handleSelectRelation],
  );

  // Rebuild nodes when the roster changes, preserving manual/saved positions.
  useEffect(() => {
    const layout = computeFamilyLayout(members, relations);
    const layoutById = new Map(layout.map((node) => [node.id, node]));
    const saved = positionsRef.current;

    // Seed positionsRef with layout so edge handles pick a soft curve on first paint.
    const seeded = { ...saved };
    for (const node of layout) {
      if (!seeded[node.id]) {
        seeded[node.id] = { x: node.x, y: node.y };
      }
    }
    positionsRef.current = seeded;

    setNodes((previous) => {
      const previousById = new Map(previous.map((node) => [node.id, node]));

      return members.map((member) => {
        const savedPos = seeded[member.id];
        const previousPos = previousById.get(member.id)?.position;
        const layoutPos = layoutById.get(member.id);
        const position =
          savedPos ??
          previousPos ??
          (layoutPos
            ? { x: layoutPos.x, y: layoutPos.y }
            : { x: 0, y: 0 });

        return {
          id: member.id,
          type: "member" as const,
          position,
          data: {
            member,
            active: false,
            canEdit,
          },
          draggable: canEdit,
        };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, relations, canEdit]);

  // Reflect selection state on nodes without recomputing layout.
  useEffect(() => {
    setNodes((previous) =>
      previous.map((node) => {
        const active =
          selectedId === node.id ||
          pendingPair?.fromId === node.id ||
          pendingPair?.toId === node.id;

        if (node.data.active === active && node.data.canEdit === canEdit) {
          return node;
        }

        return { ...node, data: { ...node.data, active, canEdit } };
      }),
    );
  }, [selectedId, pendingPair, canEdit, setNodes]);

  // Build edges from relations + pending preview.
  useEffect(() => {
    const positionOf = (id: string): NodePos | undefined => {
      const saved = positionsRef.current[id];
      if (saved) return saved;
      return undefined;
    };

    const validRelations = relations.filter(
      (relation) =>
        memberById.has(relation.fromMemberId) &&
        memberById.has(relation.toMemberId),
    );

    // Fan out ascendant lines that converge on the same child so distinct
    // ties (e.g. pai/mãe vs. tio/tia) run in parallel corridors instead of
    // stacking on top of one another into the same top handle.
    const LANE_GAP = 30;
    const laneByRelationId = new Map<string, number>();
    const ascendantByTarget = new Map<string, MemberRelation[]>();
    for (const relation of validRelations) {
      if (!ASCENDANT_RELATION_TYPES.has(relation.type)) continue;
      const bucket = ascendantByTarget.get(relation.toMemberId) ?? [];
      bucket.push(relation);
      ascendantByTarget.set(relation.toMemberId, bucket);
    }
    for (const bucket of ascendantByTarget.values()) {
      const ordered = [...bucket].sort((a, b) => {
        const ax = positionsRef.current[a.fromMemberId]?.x ?? 0;
        const bx = positionsRef.current[b.fromMemberId]?.x ?? 0;
        return ax - bx || a.id.localeCompare(b.id);
      });
      const mid = (ordered.length - 1) / 2;
      ordered.forEach((relation, index) => {
        laneByRelationId.set(relation.id, (index - mid) * LANE_GAP);
      });
    }

    const relationEdges: RelationFlowEdge[] = validRelations.map((relation) => {
        const isPeer = UNDIRECTED_RELATION_TYPES.has(relation.type);
        const isAscendant = ASCENDANT_RELATION_TYPES.has(relation.type);
        let source = relation.fromMemberId;
        let target = relation.toMemberId;
        let sourceHandle = "b";
        let targetHandle = "t";

        if (isPeer) {
          const fromPos = positionOf(relation.fromMemberId);
          const toPos = positionOf(relation.toMemberId);

          if (fromPos && toPos) {
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;

            if (Math.abs(dx) >= Math.abs(dy)) {
              if (fromPos.x <= toPos.x) {
                source = relation.fromMemberId;
                target = relation.toMemberId;
              } else {
                source = relation.toMemberId;
                target = relation.fromMemberId;
              }
              sourceHandle = "r";
              targetHandle = "l";
            } else if (fromPos.y <= toPos.y) {
              source = relation.fromMemberId;
              target = relation.toMemberId;
              sourceHandle = "b";
              targetHandle = "t";
            } else {
              source = relation.toMemberId;
              target = relation.fromMemberId;
              sourceHandle = "b";
              targetHandle = "t";
            }
          } else {
            sourceHandle = "r";
            targetHandle = "l";
          }
        } else if (isAscendant) {
          source = relation.fromMemberId;
          target = relation.toMemberId;
          sourceHandle = "b";
          targetHandle = "t";
        }

        return {
          id: relation.id,
          source,
          target,
          sourceHandle,
          targetHandle,
          type: "relation" as const,
          markerEnd: isPeer
            ? undefined
            : {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 16,
                color: relationStroke(relation.type),
              },
          data: {
            relationType: relation.type,
            isSelected: selectedRelationId === relation.id,
            laneOffset: laneByRelationId.get(relation.id) ?? 0,
          },
          selectable: canEdit,
          focusable: canEdit,
        };
      });

    if (pendingPair) {
      relationEdges.push({
        id: "pending-edge",
        source: pendingPair.fromId,
        target: pendingPair.toId,
        sourceHandle: "b",
        targetHandle: "t",
        type: "relation",
        animated: true,
        data: {
          relationType: "parent",
          isSelected: false,
        },
        style: { stroke: "var(--attention)", strokeDasharray: "6 6" },
        selectable: false,
      });
    }

    setEdges(relationEdges);
  }, [
    relations,
    memberById,
    selectedRelationId,
    pendingPair,
    canEdit,
    setEdges,
    layoutTick,
  ]);

  const handleNodeClick = useCallback<
    (event: unknown, node: MemberFlowNode) => void
  >(
    (_event, node) => {
      if (!canEdit || isBusy) return;
      setSelectedRelationId(null);
      setError(null);

      setSelectedId((current) => {
        if (!current) {
          setPendingPair(null);
          return node.id;
        }
        if (current === node.id) {
          setPendingPair(null);
          return null;
        }
        setPendingPair({ fromId: current, toId: node.id });
        return current;
      });
    },
    [canEdit, isBusy],
  );

  const handleNodeDragStop = useCallback<
    (event: unknown, node: MemberFlowNode) => void
  >(
    (_event, node) => {
      positionsRef.current = {
        ...positionsRef.current,
        [node.id]: { x: node.position.x, y: node.position.y },
      };
      persistPositions(familyId, positionsRef.current);
      setLayoutTick((tick) => tick + 1);
    },
    [familyId],
  );

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

  function handleAutoArrange() {
    const layout = computeFamilyLayout(members, relations);
    const next: Record<string, NodePos> = {};
    for (const node of layout) {
      next[node.id] = { x: node.x, y: node.y };
    }
    positionsRef.current = next;
    persistPositions(familyId, next);
    setNodes((previous) =>
      previous.map((node) => ({
        ...node,
        position: next[node.id] ?? node.position,
      })),
    );
    setLayoutTick((tick) => tick + 1);
    resetSelection();
    window.setTimeout(() => void fitView({ duration: 400, padding: 0.2 }), 0);
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
        : "Arraste para reposicionar. Toque em alguém para vincular, ou numa linha para remover.";

  const step = !canEdit ? 0 : pendingPair ? 2 : selectedId ? 1 : 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-elevated">
        <ReactFlow<MemberFlowNode, RelationFlowEdge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onNodeDragStop={handleNodeDragStop}
          onEdgeClick={handleEdgeClick}
          onPaneClick={resetSelection}
          nodesDraggable={canEdit && !isBusy}
          nodesConnectable={false}
          elementsSelectable
          edgesFocusable={canEdit}
          minZoom={0.3}
          maxZoom={1.6}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: false }}
          className="[&_.react-flow__handle]:cursor-pointer!"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.4}
            color="color-mix(in srgb, var(--foreground) 12%, transparent)"
          />
          <Controls
            showInteractive={false}
            className="rounded-xl! border! border-border/60! bg-white/95! shadow-xs!"
          />
        </ReactFlow>

        <div className="pointer-events-none absolute left-3 top-20 z-20 sm:left-4 sm:top-18">
          <div className="pointer-events-auto w-[min(100%,15.5rem)] rounded-2xl border border-border/60 bg-white/92 p-3 shadow-xs backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Legenda
            </p>
            <ul className="mt-2 space-y-1.5">
              {RELATION_LEGEND.map((item) => (
                <li
                  key={item.type}
                  className="flex items-center gap-2.5 text-xs text-foreground"
                >
                  <RelationColorSwatch type={item.type} />
                  <span className="leading-tight">{item.label}</span>
                </li>
              ))}
            </ul>
            {canEdit ? (
              <p className="mt-2.5 border-t border-border/50 pt-2 text-[10px] leading-relaxed text-muted-foreground">
                Toque numa linha para remover o vínculo.
              </p>
            ) : null}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-20 z-20 flex justify-center sm:inset-x-4 sm:bottom-4 sm:justify-start sm:pl-66">
          <div className="pointer-events-auto flex max-w-[min(100%,28rem)] items-center gap-2 rounded-full border border-border/60 bg-white/90 px-3 py-1.5 shadow-xs backdrop-blur-md">
            {canEdit && (
              <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
                {[0, 1, 2].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors",
                      step >= n ? "bg-billing" : "bg-billing/20",
                    )}
                  />
                ))}
              </div>
            )}
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {hint}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-3 z-20 flex flex-col items-end gap-1.5 sm:right-4">
          <div className="pointer-events-auto flex items-center gap-1.5">
            {canEdit && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAutoArrange}
                disabled={isBusy}
                title="Reorganizar automaticamente"
                className="bg-white/90 shadow-xs backdrop-blur-md"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reorganizar</span>
              </Button>
            )}
            {(selectedId || pendingPair || selectedRelationId) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetSelection}
                disabled={isBusy}
                className="bg-white/90 shadow-xs backdrop-blur-md"
              >
                <X className="size-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>
            )}
          </div>
        </div>

        {pendingPair && fromMember && toMember && (
          <div className="absolute inset-x-3 bottom-3 z-20 mx-auto max-h-[min(52dvh,420px)] max-w-md overflow-hidden rounded-2xl border border-border/60 bg-white/98 shadow-popover backdrop-blur-md sm:inset-x-4 sm:bottom-4">
            <div className="border-b border-border/50 bg-billing-subtle/40 px-4 py-3 text-center">
              <p className="text-sm font-medium text-foreground">
                {firstName(fromMember.name)}
                <span className="mx-2 font-normal text-muted-foreground">→</span>
                {firstName(toMember.name)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Ordem do toque · escolha o parentesco
              </p>
            </div>

            <div className="max-h-[min(40dvh,320px)] space-y-0.5 overflow-y-auto p-2">
              {RELATION_CHOICES.map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void chooseRelation(type)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30">
                    <RelationColorSwatch type={type} />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {relationChoiceLabel(
                      type,
                      fromMember.name,
                      toMember.name,
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRelation && canEdit && !pendingPair && (
          <div className="absolute inset-x-3 bottom-3 z-20 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white/98 px-4 py-3 shadow-popover backdrop-blur-md sm:inset-x-4 sm:bottom-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                {MEMBER_RELATION_LABELS[selectedRelation.type]}
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
          </div>
        )}

        {error && (
          <div className="absolute inset-x-3 top-16 z-30 mx-auto max-w-sm rounded-xl border border-destructive/30 bg-white/95 px-4 py-2.5 text-center text-sm text-destructive shadow-popover backdrop-blur-md sm:top-20">
            {error}
          </div>
        )}
    </div>
  );
}

export function FamilyGraphCanvas(props: FamilyGraphCanvasProps) {
  if (props.members.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-billing-subtle/40 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-billing-subtle text-billing-foreground">
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

  return (
    <ReactFlowProvider>
      <FamilyGraphFlow {...props} />
    </ReactFlowProvider>
  );
}
