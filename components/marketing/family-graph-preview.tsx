"use client";

import "@xyflow/react/dist/style.css";

import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import {
  NODE_H,
  NODE_W,
  computeFamilyLayout,
  firstName,
  initials,
  restName,
} from "@/lib/members/family-graph-layout";
import {
  bundledRelationIds,
  detectFamilyUnits,
  familyUnitConnectorPath,
  peerConnectorPath,
  soloAscendantPath,
  type GraphNodeBox,
} from "@/lib/members/family-graph-genealogy";
import { cn } from "@/lib/utils";
import type {
  FamilyGraphMember,
  MemberRelation,
  MemberRelationType,
} from "@/types/members";
import {
  ASCENDANT_RELATION_TYPES,
  MEMBER_RELATION_LABELS,
  UNDIRECTED_RELATION_TYPES,
} from "@/types/members";

/** Pai + casal + 2 filhos — como no uso real. */
const DEMO_MEMBERS: FamilyGraphMember[] = [
  { id: "m-antonio", name: "Antônio Souza", status: "active" },
  { id: "m-roberto", name: "Roberto Souza", status: "active" },
  { id: "m-marina", name: "Marina Costa", status: "active" },
  { id: "m-ana", name: "Ana Souza", status: "active" },
  { id: "m-pedro", name: "Pedro Souza", status: "active" },
];

const DEMO_RELATIONS: MemberRelation[] = [
  {
    id: "r-pai-roberto",
    fromMemberId: "m-antonio",
    toMemberId: "m-roberto",
    type: "parent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-spouse",
    fromMemberId: "m-roberto",
    toMemberId: "m-marina",
    type: "spouse",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-parent-ana-r",
    fromMemberId: "m-roberto",
    toMemberId: "m-ana",
    type: "parent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-parent-ana-m",
    fromMemberId: "m-marina",
    toMemberId: "m-ana",
    type: "parent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-parent-pedro-r",
    fromMemberId: "m-roberto",
    toMemberId: "m-pedro",
    type: "parent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-parent-pedro-m",
    fromMemberId: "m-marina",
    toMemberId: "m-pedro",
    type: "parent",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "r-sibling",
    fromMemberId: "m-ana",
    toMemberId: "m-pedro",
    type: "sibling",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const RELATION_COLORS: Record<MemberRelationType, string> = {
  parent: "var(--relation-parent)",
  spouse: "var(--relation-spouse)",
  sibling: "var(--relation-sibling)",
  grandparent: "var(--relation-grandparent)",
  step_parent: "var(--relation-step-parent)",
  parent_in_law: "var(--relation-parent-in-law)",
  uncle: "var(--relation-uncle)",
};

const LEGEND: { type: MemberRelationType; label: string }[] = [
  { type: "parent", label: MEMBER_RELATION_LABELS.parent },
  { type: "spouse", label: MEMBER_RELATION_LABELS.spouse },
  { type: "sibling", label: MEMBER_RELATION_LABELS.sibling },
];

const SELECTED_ID = "m-ana";

const FICHE_PEEK = [
  { name: "Marina Costa", role: "Mãe" },
  { name: "Roberto Souza", role: "Pai" },
  { name: "Pedro Souza", role: "Irmão" },
] as const;

const handleClassName =
  "!h-2 !w-2 !min-w-0 !border-0 !bg-transparent !opacity-0";

type MemberNodeData = {
  member: FamilyGraphMember;
  active: boolean;
};

type MemberFlowNode = Node<MemberNodeData, "member">;

type RelationEdgeData = {
  relationType: MemberRelationType;
  kind: "peer" | "solo-parent";
};

type FamilyUnitEdgeData = {
  parentIds: string[];
  childIds: string[];
};

type RelationFlowEdge = Edge<RelationEdgeData, "relation">;
type FamilyUnitFlowEdge = Edge<FamilyUnitEdgeData, "familyUnit">;
type PreviewEdge = RelationFlowEdge | FamilyUnitFlowEdge;

function MemberNode({ data }: NodeProps<MemberFlowNode>) {
  const { member, active } = data;
  const surname = restName(member.name);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-center backdrop-blur-sm transition-[box-shadow,border-color]",
        active
          ? "border-domain-members/50 bg-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--domain-members)_22%,transparent),0_12px_28px_-12px_rgba(40,48,36,0.35)]"
          : "border-black/6 bg-white/90 shadow-xs",
      )}
      style={{ width: NODE_W, height: NODE_H }}
    >
      {active ? (
        <motion.span
          className="pointer-events-none absolute -inset-1 rounded-[1.15rem] border border-domain-members/35"
          aria-hidden
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.02, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
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
            ? "bg-domain-members text-white"
            : "bg-domain-members-subtle text-domain-members-foreground",
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

function boxFromNode(node: {
  id: string;
  position: { x: number; y: number };
  measured?: { width?: number; height?: number };
}): GraphNodeBox {
  return {
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width ?? NODE_W,
    height: node.measured?.height ?? NODE_H,
  };
}

function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<RelationFlowEdge>) {
  const relationType = data?.relationType ?? "parent";
  const kind = data?.kind ?? "solo-parent";
  const color = RELATION_COLORS[relationType];
  const source = { x: sourceX, y: sourceY };
  const target = { x: targetX, y: targetY };

  const edgePath =
    kind === "peer"
      ? peerConnectorPath(source, target)
      : soloAscendantPath(source, target);

  return (
    <>
      <BaseEdge
        id={`${id}-halo`}
        path={edgePath}
        style={{
          stroke: "rgba(255,255,255,0.92)",
          strokeWidth: 5.5,
          strokeLinecap: "round",
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: kind === "peer" ? 2.75 : 2.5,
          strokeLinecap: "round",
        }}
      />
    </>
  );
}

function FamilyUnitEdge({ id, data }: EdgeProps<FamilyUnitFlowEdge>) {
  const parentIds = data?.parentIds ?? [];
  const childIds = data?.childIds ?? [];
  const color = RELATION_COLORS.parent;

  const nodes = useStore((state) => state.nodes);
  const edgePath = useMemo(() => {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const parents = parentIds
      .map((parentId) => byId.get(parentId))
      .filter(Boolean)
      .map((node) => boxFromNode(node!));
    const children = childIds
      .map((childId) => byId.get(childId))
      .filter(Boolean)
      .map((node) => boxFromNode(node!));
    return familyUnitConnectorPath(parents, children);
  }, [nodes, parentIds, childIds]);

  if (!edgePath) return null;

  return (
    <>
      <BaseEdge
        id={`${id}-halo`}
        path={edgePath}
        style={{
          stroke: "rgba(255,255,255,0.92)",
          strokeWidth: 5.5,
          strokeLinecap: "round",
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: 2.5,
          strokeLinecap: "round",
        }}
      />
    </>
  );
}

const nodeTypes = { member: MemberNode };
const edgeTypes = {
  relation: RelationEdge,
  familyUnit: FamilyUnitEdge,
};

function FamilyGraphPreviewCanvas() {
  const { nodes, edges } = useMemo(() => {
    const layout = computeFamilyLayout(DEMO_MEMBERS, DEMO_RELATIONS);
    const byId = new Map(layout.map((item) => [item.id, item]));

    const nextNodes: MemberFlowNode[] = DEMO_MEMBERS.map((member) => {
      const pos = byId.get(member.id);
      return {
        id: member.id,
        type: "member",
        position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
        data: { member, active: member.id === SELECTED_ID },
        draggable: false,
        selectable: false,
      };
    });

    const units = detectFamilyUnits(DEMO_RELATIONS);
    const bundled = bundledRelationIds(units);

    const nextEdges: PreviewEdge[] = [];

    for (const unit of units) {
      const [firstParent] = unit.parentIds;
      const [firstChild] = unit.childIds;
      if (!firstParent || !firstChild) continue;
      nextEdges.push({
        id: unit.id,
        type: "familyUnit",
        source: firstParent,
        target: firstChild,
        sourceHandle: "b",
        targetHandle: "t",
        data: {
          parentIds: unit.parentIds,
          childIds: unit.childIds,
        },
        selectable: false,
        focusable: false,
      });
    }

    for (const relation of DEMO_RELATIONS) {
      if (bundled.has(relation.id)) continue;

      const isPeer = UNDIRECTED_RELATION_TYPES.has(relation.type);
      const isAscendant = ASCENDANT_RELATION_TYPES.has(relation.type);

      let source = relation.fromMemberId;
      let target = relation.toMemberId;
      let sourceHandle = "b";
      let targetHandle = "t";

      if (isPeer) {
        const fromPos = byId.get(relation.fromMemberId);
        const toPos = byId.get(relation.toMemberId);
        if (fromPos && toPos && fromPos.x > toPos.x) {
          source = relation.toMemberId;
          target = relation.fromMemberId;
        }
        sourceHandle = "r";
        targetHandle = "l";
      } else if (isAscendant) {
        sourceHandle = "b";
        targetHandle = "t";
      }

      nextEdges.push({
        id: relation.id,
        type: "relation",
        source,
        target,
        sourceHandle,
        targetHandle,
        data: {
          relationType: relation.type,
          kind: isPeer ? "peer" : "solo-parent",
        },
        selectable: false,
        focusable: false,
      });
    }

    return { nodes: nextNodes, edges: nextEdges };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_48%_40%,color-mix(in_srgb,var(--domain-members)_16%,transparent),transparent_58%)]"
        aria-hidden
      />
      <ReactFlow<MemberFlowNode, PreviewEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch={false}
        preventScrolling={false}
        minZoom={0.35}
        maxZoom={1.2}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent!"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.1}
          color="color-mix(in srgb, var(--domain-members) 18%, transparent)"
        />
      </ReactFlow>
    </div>
  );
}

function GraphLegend() {
  return (
    <div className="pointer-events-none absolute top-3 left-3 z-20 sm:top-4 sm:left-4">
      <div className="rounded-2xl border border-border/50 bg-white/90 px-3 py-2.5 shadow-xs backdrop-blur-md">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Vínculos
        </p>
        <ul className="mt-2 space-y-1.5">
          {LEGEND.map((item) => (
            <li
              key={item.type}
              className="flex items-center gap-2.5 text-[11px] text-foreground"
            >
              <span
                className="block h-1 w-5 shrink-0 rounded-full"
                style={{ backgroundColor: RELATION_COLORS[item.type] }}
                aria-hidden
              />
              <span className="leading-tight">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MemberFichePeek() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
      className="pointer-events-none absolute right-3 bottom-3 z-20 w-[min(100%,16.5rem)] sm:right-4 sm:bottom-4"
      aria-label="Ficha de Ana Souza"
    >
      <div className="overflow-hidden rounded-2xl border border-domain-members/25 bg-white/95 shadow-popover backdrop-blur-md">
        <div className="border-b border-border/50 bg-domain-members-subtle/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-domain-members text-[12px] font-semibold tracking-wide text-white">
              AS
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                Ana Souza
              </p>
              <p className="truncate text-[11px] text-domain-members-foreground">
                Selecionada no grafo
              </p>
            </div>
          </div>
        </div>
        <ul className="divide-y divide-border/40 px-1 py-1">
          {FICHE_PEEK.map((person) => (
            <li
              key={person.name}
              className="flex items-center gap-2 px-2.5 py-1.5"
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-domain-members-subtle text-[9px] font-semibold tracking-wide text-domain-members-foreground"
                aria-hidden
              >
                {initials(person.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">
                {person.name}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {person.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.aside>
  );
}

/**
 * Marketing frame — the family graph is the hero; fiche is a supporting peek.
 */
export function FamilyGraphPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-domain-members/25 bg-card shadow-popover",
        className,
      )}
      aria-label="Prévia do grafo de família no Minha Church"
    >
      <div
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-domain-members/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-domain-members/10 blur-3xl"
        aria-hidden
      />

      <header className="relative flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-domain-members-foreground uppercase">
            Grafo familiar
          </p>
          <h3 className="font-display mt-0.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Família Souza
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-domain-members/20 bg-domain-members-subtle px-2.5 py-1 text-[11px] font-medium tabular-nums text-domain-members-foreground">
            {DEMO_MEMBERS.length} pessoas
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground">
            {DEMO_RELATIONS.length} vínculos
          </span>
        </div>
      </header>

      <div className="relative h-[28rem] sm:h-[34rem]">
        <ReactFlowProvider>
          <FamilyGraphPreviewCanvas />
        </ReactFlowProvider>
        <GraphLegend />
        <MemberFichePeek />
      </div>
    </div>
  );
}
