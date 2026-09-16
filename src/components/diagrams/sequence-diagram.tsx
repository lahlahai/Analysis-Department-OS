"use client";

import { ArrowDown, ArrowLeft, ArrowRight, Circle } from "lucide-react";
import type { ArchitectureEdge, ArchitectureNode } from "@/domain/types";

interface SequenceDiagramProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  diagramName: string;
  onNodeSelect: (id: string) => void;
  onEdgeSelect: (id: string) => void;
}

export function SequenceDiagramView({ nodes, edges, diagramName, onNodeSelect, onEdgeSelect }: SequenceDiagramProps) {
  const nodeIndex = new Map(nodes.map((node, index) => [node.id, index]));
  const visibleEdges = edges.filter((edge) => nodeIndex.has(edge.source) && nodeIndex.has(edge.target));
  const participantCount = Math.max(nodes.length, 1);

  return <div className="h-full overflow-auto bg-slate-50 pt-20" dir="rtl"><div className="relative min-h-full min-w-[1760px] px-8 pb-16"><div className="mb-2 flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">{diagramName}</div><div className="mt-1 text-[10px] text-slate-500">المشاركون في الأعلى · تسلسل الطلب من الأعلى إلى الأسفل</div></div><div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-[10px] text-cyan-800">{visibleEdges.length} مراحل تنفيذ</div></div>
    <div className="relative mt-5" dir="ltr"><div className="grid grid-cols-8 gap-4">{nodes.map((node) => <button key={node.id} type="button" onClick={() => onNodeSelect(node.id)} className="relative z-10 min-h-[118px] rounded-xl border border-slate-200 bg-white p-3 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md" dir="rtl"><div className="flex items-start gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-pink-500 text-white"><Circle size={12} className="fill-current" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{node.data.label}</span><span className="mt-1 block text-[9px] text-pink-600">مشارك في الطلب</span></span></div><span className="mt-3 block line-clamp-2 text-[10px] leading-5 text-slate-500">{node.data.description}</span></button>)}</div>
      <div className="pointer-events-none absolute inset-x-0 top-[126px] bottom-0" aria-hidden="true">{nodes.map((node, index) => <div key={node.id} className="absolute bottom-0 top-0 w-px bg-slate-300" style={{ left: `calc(${((index + 0.5) / participantCount) * 100}% - 1px)` }} />)}</div>
      <div className="relative mt-7 space-y-3" dir="rtl">{visibleEdges.map((edge, index) => { const sourceIndex = nodeIndex.get(edge.source) ?? 0; const targetIndex = nodeIndex.get(edge.target) ?? 0; const source = nodes[sourceIndex]; const target = nodes[targetIndex]; const start = ((Math.min(sourceIndex, targetIndex) + 0.5) / participantCount) * 100; const end = ((Math.max(sourceIndex, targetIndex) + 0.5) / participantCount) * 100; const forward = targetIndex > sourceIndex; return <button key={edge.id} type="button" onClick={() => onEdgeSelect(edge.id)} className="relative block min-h-[76px] w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-right shadow-sm transition hover:border-pink-300 hover:bg-pink-50/50" dir="rtl"><span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-cyan-50 text-[10px] font-semibold text-cyan-700">{index + 1}</span><span className="mr-8 flex items-center gap-2 text-xs font-semibold text-slate-800"><span>{source?.data.label}</span><ArrowDown size={13} className="text-slate-400" /><span>{target?.data.label}</span></span><span className="mr-8 mt-1 block text-[10px] text-slate-500">{edge.label ?? "انتقال الطلب"}</span><span className="pointer-events-none absolute inset-x-8 top-[42px] h-px bg-pink-400"><span className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-pink-500" style={forward ? { right: "-1px" } : { left: "-1px", transform: "translateY(-50%) rotate(225deg)" }} /><span className="absolute -top-4 rounded bg-white px-1 text-[9px] text-slate-400" style={{ left: `${(start + end) / 2}%`, transform: "translateX(-50%)" }}>{forward ? <ArrowRight size={11} /> : <ArrowLeft size={11} />}</span></span></button>; })}</div>
    </div>
  </div></div>;
}
