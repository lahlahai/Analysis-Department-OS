import ELK from "elkjs/lib/elk.bundled.js";
import type { ArchitectureEdge, ArchitectureNode } from "./types";

const elk = new ELK();

export type LayoutDirection = "RIGHT" | "DOWN";

export async function autoLayout(nodes: ArchitectureNode[], edges: ArchitectureEdge[], direction: LayoutDirection = "RIGHT"): Promise<ArchitectureNode[]> {
  const graph = await elk.layout({
    id: "workspace",
    layoutOptions: { "elk.algorithm": "layered", "elk.direction": direction, "elk.spacing.nodeNode": "72", "elk.layered.spacing.nodeNodeBetweenLayers": "110" },
    children: nodes.map((node) => ({ id: node.id, width: node.measured?.width ?? 260, height: node.measured?.height ?? 132 })),
    edges: edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  });
  const positions = new Map((graph.children ?? []).map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }]));
  return nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position }));
}
