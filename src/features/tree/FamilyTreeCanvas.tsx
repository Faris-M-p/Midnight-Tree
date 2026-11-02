"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Member, Relationship } from "@/types/database";
import { memberLabel } from "@/types/database";
import { layoutFamilyTree } from "./layout";

type Props = {
  members: Member[];
  relationships: Relationship[];
};

function MemberNode({ data }: { data: { label: string; sub: string; placeholder: boolean } }) {
  return (
    <div
      className={`min-w-[180px] rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-950 ${
        data.placeholder
          ? "border-dashed border-neutral-400 text-neutral-500"
          : "border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{data.label}</div>
      <div className="text-xs text-neutral-500">{data.sub}</div>
    </div>
  );
}

const nodeTypes = { member: MemberNode };

export function FamilyTreeCanvas({ members, relationships }: Props) {
  const { nodes, edges } = useMemo(() => {
    const coords = layoutFamilyTree(members, relationships);
    const nodes: Node[] = members.map((m) => {
      const c = coords[m.id] ?? { x: 0, y: 0 };
      const year = m.date_of_birth?.slice(0, 4);
      const death = m.date_of_death?.slice(0, 4);
      const sub = [m.member_code, year ? (death ? `${year}–${death}` : `b. ${year}`) : null]
        .filter(Boolean)
        .join(" · ");
      return {
        id: m.id,
        type: "member",
        position: c,
        data: {
          label: memberLabel(m),
          sub,
          placeholder: m.member_type === "placeholder"
        },
        draggable: false
      };
    });

    const edges: Edge[] = [];
    for (const rel of relationships) {
      if (rel.relationship_status === "ended") continue;
      if (rel.relationship_type === "partner") {
        edges.push({
          id: `partner-${rel.id}`,
          source: rel.source_member_id,
          target: rel.target_member_id,
          type: "straight",
          style: { stroke: "#737373" },
          label: "partners"
        });
      }
      if (rel.relationship_type === "parent") {
        edges.push({
          id: `parent-${rel.id}`,
          source: rel.source_member_id,
          target: rel.target_member_id,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: { stroke: "#525252" }
        });
      }
    }

    return { nodes, edges };
  }, [members, relationships]);

  if (members.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-700">
        No members yet. Add a person to start the tree from anywhere.
      </div>
    );
  }

  return (
    <div className="h-[70vh] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
