import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowDown, Box, Boxes, Braces, Circle, Database, GitBranch, Globe2, Layers3, Server, Workflow } from "lucide-react";
import type { ArchitectureNode } from "@/domain/types";
import { cn } from "@/lib/cn";

const iconMap = { application: Globe2, service: Server, database: Database, queue: Workflow, event: Workflow, api: Braces, actor: Boxes, "external-system": Globe2, component: Layers3, entity: Box } as const;

function Handles({ all = false }: { all?: boolean }) {
  return <><Handle type="target" position={Position.Left} className="!size-2 !border-2 !border-white !bg-pink-500" /><Handle type="source" position={Position.Right} className="!size-2 !border-2 !border-white !bg-pink-500" />{all && <><Handle type="target" position={Position.Top} id="top-target" className="!size-2 !border-2 !border-white !bg-pink-500" /><Handle type="source" position={Position.Bottom} id="bottom-source" className="!size-2 !border-2 !border-white !bg-pink-500" /></>}</>;
}

function EntityNode({ data, selected }: NodeProps<ArchitectureNode>) {
  return <div className={cn("relative min-w-[260px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all", selected ? "border-pink-500 ring-4 ring-pink-100" : "border-slate-200 hover:border-pink-300")}><Handles all /><div className="flex items-center gap-2 border-b border-pink-100 bg-pink-50 px-3 py-2.5"><div className="grid size-7 place-items-center rounded-md bg-pink-500 text-white"><Database size={14} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-900">{data.label}</div><div className="text-[9px] uppercase tracking-[0.12em] text-pink-600">كيان · ERD</div></div><span className="font-mono text-[9px] text-slate-500">{data.fieldCount ?? 0} حقول</span></div><div className="divide-y divide-slate-100">{(data.fields ?? []).map((field) => <div key={field.name} className="flex items-center gap-2 px-3 py-2 text-[10px]"><span className={cn("grid size-4 place-items-center rounded text-[8px]", field.required ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-400")}>{field.required ? "◆" : "·"}</span><span className="flex-1 font-medium text-slate-700">{field.name}</span><span className="font-mono text-slate-400">{field.type}</span></div>)}</div></div>;
}

function FlowNode({ data, selected }: NodeProps<ArchitectureNode>) {
  const Icon = iconMap[data.type];
  const kind = data.flowKind ?? "action";
  const kindLabel = { start: "بداية", end: "نهاية", action: "إجراء", service: "خدمة", decision: "قرار" }[kind];
  const shape = kind === "start" || kind === "end" ? "rounded-full" : kind === "decision" ? "rounded-xl border-dashed" : "rounded-xl";
  return <div className={cn("relative min-w-[220px] border bg-white px-4 py-3 shadow-sm transition-all", shape, selected ? "border-pink-500 ring-4 ring-pink-100" : "border-slate-200 hover:border-pink-300")}><Handles /><div className="flex items-center gap-2"><div className={cn("grid size-7 place-items-center rounded-full", kind === "end" ? "bg-slate-800 text-white" : "bg-pink-500 text-white")}><Icon size={14} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-900">{data.label}</div><div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-pink-600">{kindLabel}</div></div>{kind === "decision" && <GitBranch size={14} className="text-pink-500" />}</div><div className="mt-2 text-[10px] leading-5 text-slate-500">{data.description}</div></div>;
}

function WorkflowNode({ data, selected }: NodeProps<ArchitectureNode>) {
  const Icon = iconMap[data.type];
  const statusLabel = { ready: "جاهز", active: "قيد التنفيذ", blocked: "متوقف", done: "مكتمل" }[data.status ?? "active"];
  return <div className={cn("relative min-w-[250px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all", selected ? "border-pink-500 ring-4 ring-pink-100" : "border-slate-200 hover:border-pink-300")}><Handles /><div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5"><div className="grid size-7 place-items-center rounded-md bg-pink-500 text-white"><Icon size={14} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-900">{data.label}</div><div className="text-[9px] text-slate-500">مسؤول: {data.lane ?? "الفريق"}</div></div><span className={cn("rounded-full px-2 py-0.5 text-[9px]", data.status === "done" ? "bg-slate-100 text-slate-600" : "bg-pink-50 text-pink-600")}>{statusLabel}</span></div><div className="px-3 py-3 text-[10px] leading-5 text-slate-500">{data.description}</div><div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2 text-[9px] text-slate-400"><Circle size={8} className="fill-pink-500 text-pink-500" /> خطوة ضمن سير العمل <ArrowDown size={10} className="mr-auto" /></div></div>;
}

export function ArchitectureNodeCard(props: NodeProps<ArchitectureNode>) {
  if (props.data.diagramType === "erd" || props.data.type === "entity") return <EntityNode {...props} />;
  if (props.data.diagramType === "workflow") return <WorkflowNode {...props} />;
  if (props.data.diagramType === "flowchart" || props.data.diagramType === "process") return <FlowNode {...props} />;

  const Icon = iconMap[props.data.type];
  return <div className={cn("relative min-w-[238px] overflow-hidden rounded-lg border bg-white shadow-sm transition-all", props.selected ? "border-pink-500 ring-4 ring-pink-100" : "border-slate-200 hover:border-pink-300")}><Handles /><div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2.5"><span className="grid size-7 place-items-center rounded-md bg-pink-500 text-white"><Icon size={14} /></span><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-900">{props.data.label}</div><div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-slate-500">{props.data.type}</div></div></div><div className="px-3 py-3 text-[11px] leading-relaxed text-slate-500">{props.data.description}</div></div>;
}
