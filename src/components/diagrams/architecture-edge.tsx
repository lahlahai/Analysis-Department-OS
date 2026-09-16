import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { ArchitectureEdge } from "@/domain/types";

export function ArchitectureEdgeLine({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: EdgeProps<ArchitectureEdge>) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return <>
    <BaseEdge path={path} markerEnd={markerEnd} style={{ stroke: data?.relationshipType === "event" ? "#ff0071" : "#b8bec8", strokeWidth: 1.5, strokeDasharray: data?.relationshipType === "dependency" ? "5 4" : undefined }} />
    {data?.label && <EdgeLabelRenderer><div className="nodrag nopan pointer-events-none absolute rounded border border-white/10 bg-slate-950/90 px-1.5 py-0.5 font-mono text-[9px] text-slate-400" style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>{data.label}</div></EdgeLabelRenderer>}
  </>;
}
