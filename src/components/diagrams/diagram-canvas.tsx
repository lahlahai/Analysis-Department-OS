"use client";

import { useState } from "react";
import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider, type Connection, type OnEdgesChange, type OnNodesChange } from "@xyflow/react";
import { ArrowDown, ArrowRight, LayoutDashboard, Maximize2 } from "lucide-react";
import type { ArchitectureEdge, ArchitectureNode, DiagramType } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { ArchitectureEdgeLine } from "./architecture-edge";
import { ArchitectureNodeCard } from "./architecture-node";
import { DiagramToolbar } from "./diagram-toolbar";
import { SequenceDiagramView } from "./sequence-diagram";

const nodeTypes = { architecture: ArchitectureNodeCard };
const edgeTypes = { "architecture-edge": ArchitectureEdgeLine };

interface DiagramCanvasProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  onNodesChange: OnNodesChange<ArchitectureNode>;
  onEdgesChange: OnEdgesChange<ArchitectureEdge>;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (id: string) => void;
  onEdgeSelect: (id: string) => void;
  onAutoLayout: (direction: "RIGHT" | "DOWN") => void;
  diagramType: DiagramType;
  diagramName: string;
  onOpenEditor: () => void;
}

export function DiagramCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeSelect, onEdgeSelect, onAutoLayout, diagramType, diagramName, onOpenEditor }: DiagramCanvasProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [tool, setTool] = useState<"select" | "hand">("select");
  return <ReactFlowProvider><div className="relative h-full min-h-0 w-full bg-[#0b1018]">
    <DiagramToolbar diagramType={diagramType} onAutoLayout={onAutoLayout} onOpenEditor={onOpenEditor} showGrid={showGrid} onToggleGrid={() => setShowGrid((value) => !value)} snapToGrid={snapToGrid} onToggleSnap={() => setSnapToGrid((value) => !value)} tool={tool} onToolChange={setTool} />
    {diagramType === "sequence" ? <SequenceDiagramView nodes={nodes} edges={edges} diagramName={diagramName} onNodeSelect={onNodeSelect} onEdgeSelect={onEdgeSelect} /> : <>
    <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950/90 p-1 shadow-xl backdrop-blur">
      <Button size="sm" variant="ghost" title="تخطيط أفقي" onClick={() => onAutoLayout("RIGHT")}><LayoutDashboard size={13} />تخطيط تلقائي</Button>
      <Button size="icon" variant="ghost" title="تخطيط أفقي" onClick={() => onAutoLayout("RIGHT")}><ArrowRight size={13} /></Button>
      <Button size="icon" variant="ghost" title="تخطيط رأسي" onClick={() => onAutoLayout("DOWN")}><ArrowDown size={13} /></Button>
    </div>
    <div className="absolute right-4 top-4 z-10 rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-right shadow-sm"><div className="text-xs font-semibold text-slate-800">{diagramName}</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-pink-600">{diagramType} · {nodes.length} عقد · {edges.length} روابط</div></div>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => onNodeSelect(node.id)} onEdgeClick={(_, edge) => onEdgeSelect(edge.id)} fitView snapToGrid={snapToGrid} snapGrid={[16, 16]} panOnDrag={tool === "hand"} selectionOnDrag={tool === "select"} nodesConnectable={tool === "select"} edgesFocusable={tool === "select"} proOptions={{ hideAttribution: true }} defaultEdgeOptions={{ type: "architecture-edge" }} minZoom={0.25} maxZoom={1.6}>
      {showGrid && <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#cbd5e1" />}
      <Controls showInteractive={false} className="!overflow-hidden !rounded-lg !border-white/10 !bg-slate-950 [&>button]:!border-white/10 [&>button]:!bg-slate-950 [&>button]:!fill-slate-400" />
    </ReactFlow></>}
    {diagramType !== "sequence" && <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-md border border-white/10 bg-slate-950/80 px-2.5 py-1.5 font-mono text-[9px] text-slate-500"><Maximize2 size={11} />اسحب العقدة لتحديث JSON</div>}
  </div></ReactFlowProvider>;
}
