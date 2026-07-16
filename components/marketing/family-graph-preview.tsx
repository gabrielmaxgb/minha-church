"use client";

import "@xyflow/react/dist/style.css";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { ArrowLeft, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NODE_H,
  NODE_W,
  computeFamilyLayout,
  firstName,
  initials,
  restName,
} from "@/lib/members/family-graph-layout";
import { cn } from "@/lib/utils";
import type {
  FamilyGraphMember,
  MemberRelation,
  MemberRelationType,
} from "@/types/members";
import {
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

const handleClassName =
  "!h-2 !w-2 !min-w-0 !border-0 !bg-transparent !opacity-0";

type MemberNodeData = {
  member: FamilyGraphMember;
  active: boolean;
};

type MemberFlowNode = Node<MemberNodeData, "member">;

type RelationEdgeData = {
  relationType: MemberRelationType;
};

type RelationFlowEdge = Edge<RelationEdgeData, "relation">;

function MemberNode({ data }: NodeProps<MemberFlowNode>) {
  const { member, active } = data;
  const surname = restName(member.name);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border bg-white/95 px-3 py-2 text-center shadow-xs backdrop-blur-sm",
        active
          ? "border-billing shadow-popover ring-[3px] ring-billing/20"
          : "border-black/6",
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

function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationFlowEdge>) {
  const relationType = data?.relationType ?? "parent";
  const color = RELATION_COLORS[relationType];
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: color,
        strokeWidth: UNDIRECTED_RELATION_TYPES.has(relationType) ? 2.5 : 2,
      }}
    />
  );
}

const nodeTypes = { member: MemberNode };
const edgeTypes = { relation: RelationEdge };

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
        data: { member, active: member.id === "m-ana" },
        draggable: false,
        selectable: false,
      };
    });

    const nextEdges: RelationFlowEdge[] = DEMO_RELATIONS.map((relation) => {
      const isPeer = UNDIRECTED_RELATION_TYPES.has(relation.type);
      return {
        id: relation.id,
        type: "relation",
        source: relation.fromMemberId,
        target: relation.toMemberId,
        sourceHandle: isPeer ? "r" : "b",
        targetHandle: isPeer ? "l" : "t",
        data: { relationType: relation.type },
        markerEnd: isPeer
          ? undefined
          : { type: MarkerType.ArrowClosed, width: 14, height: 14, color: RELATION_COLORS[relation.type] },
      };
    });

    return { nodes: nextNodes, edges: nextEdges };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-elevated">
      <ReactFlow<MemberFlowNode, RelationFlowEdge>
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
        fitViewOptions={{ padding: 0.22 }}
        proOptions={{ hideAttribution: true }}
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

      {/* Same floating chrome as /app/membros/familias */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-none flex min-w-0 items-center gap-2 rounded-2xl border border-border/60 bg-white/92 p-1.5 shadow-popover backdrop-blur-md">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Membros</span>
          </span>
          <div className="mx-1 h-6 w-px shrink-0 bg-border/70" aria-hidden />
          <div className="min-w-0 pr-2">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              Família Souza
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {DEMO_MEMBERS.length} pessoas
              <span className="mx-1 text-border">·</span>
              {DEMO_RELATIONS.length} vínculos
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          tabIndex={-1}
          className="pointer-events-none shrink-0 shadow-popover backdrop-blur-md"
        >
          <Users className="size-4" aria-hidden />
          Pessoas
          <span className="ml-0.5 rounded-full bg-domain-members-subtle px-1.5 text-xs font-semibold text-domain-members-foreground">
            {DEMO_MEMBERS.length}
          </span>
        </Button>
      </div>

      <div className="pointer-events-none absolute top-20 left-3 z-20 sm:top-18 sm:left-4">
        <div className="w-[min(100%,15.5rem)] rounded-2xl border border-border/60 bg-white/92 p-3 shadow-xs backdrop-blur-md">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Legenda
          </p>
          <ul className="mt-2 space-y-1.5">
            {LEGEND.map((item) => (
              <li
                key={item.type}
                className="flex items-center gap-2.5 text-xs text-foreground"
              >
                <span
                  className="block h-1.5 w-7 shrink-0 rounded-full"
                  style={{ backgroundColor: RELATION_COLORS[item.type] }}
                  aria-hidden
                />
                <span className="leading-tight">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-4 z-20 flex justify-center sm:inset-x-4 sm:justify-start sm:pl-66">
        <div className="flex max-w-[min(100%,28rem)] items-center gap-2 rounded-full border border-border/60 bg-white/90 px-3 py-1.5 shadow-xs backdrop-blur-md">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            Toque em uma pessoa para ver a ficha — e nos vínculos para entender
            a família.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * In-app family graph as it appears in the product (read-only marketing frame).
 */
export function FamilyGraphPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-[28rem] overflow-hidden rounded-2xl border border-border/70 shadow-popover sm:h-[32rem]",
        className,
      )}
      aria-label="Prévia do grafo de família no Minha Church"
    >
      <ReactFlowProvider>
        <FamilyGraphPreviewCanvas />
      </ReactFlowProvider>
    </div>
  );
}
