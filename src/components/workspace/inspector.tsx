"use client";

import { Code2, ChevronRight } from "lucide-react";
import type { ArchitectureNode, Component, ComponentType, Entity, Relationship, RelationshipType, SoftwareModel } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InspectorProps {
  node?: ArchitectureNode;
  entity?: Entity;
  relationship?: Relationship;
  relationships: SoftwareModel["relationships"];
  onOpenJson: () => void;
  onUpdateComponent: (id: string, patch: Partial<Pick<Component, "name" | "description" | "type">> & { metadata?: Record<string, string> }) => void;
  onUpdateEntity: (id: string, patch: Partial<Pick<Entity, "name" | "description" | "fields">>) => void;
  onUpdateRelationship: (id: string, patch: Partial<Pick<Relationship, "label" | "type" | "direction">>) => void;
  onDeleteRelationship: () => void;
}

const componentTypes: ComponentType[] = ["application", "service", "database", "queue", "event", "api", "actor", "external-system", "component"];

export function Inspector({ node, entity, relationship, relationships, onOpenJson, onUpdateComponent, onUpdateEntity, onUpdateRelationship, onDeleteRelationship }: InspectorProps) {
  if (relationship && !node && !entity) return <div className="min-h-0 flex-1 overflow-auto text-slate-800"><div className="border-b border-slate-200 px-4 py-4"><div className="mb-4 flex items-center gap-2"><div className="grid size-8 place-items-center rounded-md border border-pink-200 bg-pink-50 text-pink-600">↔</div><div><div className="text-sm font-semibold text-slate-900">خصائص الرابط</div><div className="file-name text-[10px] text-slate-500" dir="ltr">{relationship.source} → {relationship.target}</div></div></div><label className="block text-xs font-medium text-slate-600">اسم الرابط<Input className="mt-1" value={relationship.label} onChange={(event) => onUpdateRelationship(relationship.id, { label: event.target.value })} /></label></div><div className="border-b border-slate-200 px-4 py-4"><label className="mb-3 block text-xs font-medium text-slate-600">نوع العلاقة<Select value={relationship.type} onValueChange={(value) => onUpdateRelationship(relationship.id, { type: value as RelationshipType })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["dependency", "data-flow", "relationship", "event", "calls", "contains", "uses", "extends", "implements"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></label><label className="block text-xs font-medium text-slate-600">الاتجاه<Select value={relationship.direction} onValueChange={(value) => onUpdateRelationship(relationship.id, { direction: value as Relationship["direction"] })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["forward", "both", "none"].map((direction) => <SelectItem key={direction} value={direction}>{direction}</SelectItem>)}</SelectContent></Select></label></div><div className="px-4 py-4"><Button className="w-full" variant="danger" onClick={onDeleteRelationship}>حذف الرابط</Button></div></div>;
  const isEntity = node?.data.type === "entity";
  const title = node?.data.label ?? entity?.name ?? "اختيار";
  const description = node?.data.description ?? entity?.description ?? "";

  return <div className="min-h-0 flex-1 overflow-auto text-slate-800">
    <div className="border-b border-slate-200 px-4 py-4">
      <div className="mb-3 flex items-center gap-2"><div className="grid size-8 place-items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 text-cyan-600"><Code2 size={15} /></div><div className="min-w-0"><div className="truncate font-mono text-[12px] font-semibold text-slate-800">{title}</div><div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">{isEntity ? "كيان" : "مكوّن"}</div></div></div>
      <label className="mb-3 block text-xs font-medium text-slate-600">الاسم<Input className="mt-1" value={title} onChange={(event) => node && (isEntity ? onUpdateEntity(node.id, { name: event.target.value }) : onUpdateComponent(node.id, { name: event.target.value }))} /></label>
      <label className="block text-xs font-medium text-slate-600">الوصف<Textarea className="mt-1" value={description} onChange={(event) => node && (isEntity ? onUpdateEntity(node.id, { description: event.target.value }) : onUpdateComponent(node.id, { description: event.target.value }))} /></label>
    </div>
    <div className="border-b border-slate-200 px-4 py-4">
      <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">الخصائص</span><Button size="sm" variant="outline" onClick={onOpenJson}><Code2 size={11} />فتح JSON</Button></div>
      {node && !isEntity && <><label className="mb-3 block text-xs font-medium text-slate-600">النوع<Select value={node.data.type} onValueChange={(value) => onUpdateComponent(node.id, { type: value as ComponentType })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{componentTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></label>{Object.entries(node.data.metadata).map(([key, value]) => <label key={key} className="mb-2 block text-xs font-medium text-slate-600">{key}<Input className="mt-1" value={value} onChange={(event) => onUpdateComponent(node.id, { metadata: { ...node.data.metadata, [key]: event.target.value } })} /></label>)}</>}
      {entity && isEntity && <div className="space-y-1.5">{entity.fields.map((field) => <div key={field.name} className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2 text-xs"><span className="font-medium text-slate-700">{field.name}</span><span className="text-slate-500">{field.type}{field.required ? " *" : ""}</span></div>)}</div>}
    </div>
    <div className="px-4 py-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">العلاقات</span><Badge variant="secondary">{relationships.length}</Badge></div>{relationships.map((relationship) => <div key={relationship.id} className="mb-2 rounded-md border border-slate-200 bg-slate-50 p-2.5"><div className="text-xs font-medium text-slate-700">{relationship.label}</div><div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500"><span>{relationship.source}</span><ChevronRight size={10} /><span>{relationship.target}</span></div><div className="mt-1 text-[10px] text-pink-600">{relationship.type}</div></div>)}</div>
  </div>;
}
