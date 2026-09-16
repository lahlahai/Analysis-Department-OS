"use client";

import { useReactFlow } from "@xyflow/react";
import { Code2, Grid3X3, Hand, LayoutTemplate, Magnet, Maximize2, MousePointer2, ZoomIn, ZoomOut } from "lucide-react";
import type { DiagramType } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiagramToolbarProps {
  diagramType: DiagramType;
  onAutoLayout: (direction: "RIGHT" | "DOWN") => void;
  onOpenEditor: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  tool: "select" | "hand";
  onToolChange: (tool: "select" | "hand") => void;
}

export function DiagramToolbar({ diagramType, onAutoLayout, onOpenEditor, showGrid, onToggleGrid, snapToGrid, onToggleSnap, tool, onToolChange }: DiagramToolbarProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  return <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-lg shadow-slate-200/60 backdrop-blur">
    <div className="flex items-center gap-0.5"><Button size="icon" variant={tool === "select" ? "primary" : "ghost"} title="تحديد" onClick={() => onToolChange("select")}><MousePointer2 size={14} /></Button><Button size="icon" variant={tool === "hand" ? "primary" : "ghost"} title="تحريك اللوحة" onClick={() => onToolChange("hand")}><Hand size={14} /></Button></div>
    <div className="mx-1 h-6 w-px bg-slate-200" />
    <Button size="icon" variant="ghost" title="تكبير" onClick={() => zoomIn({ duration: 250 })}><ZoomIn size={14} /></Button><Button size="icon" variant="ghost" title="تصغير" onClick={() => zoomOut({ duration: 250 })}><ZoomOut size={14} /></Button><Button size="icon" variant="ghost" title="ملاءمة العرض" onClick={() => fitView({ duration: 350, padding: 0.18 })}><Maximize2 size={14} /></Button>
    <div className="mx-1 h-6 w-px bg-slate-200" />
    <Button size="icon" variant={showGrid ? "primary" : "ghost"} title="الشبكة" onClick={onToggleGrid}><Grid3X3 size={14} /></Button><Button size="icon" variant={snapToGrid ? "primary" : "ghost"} title="الالتقاط للشبكة" onClick={onToggleSnap}><Magnet size={14} /></Button>
    <div className="mx-1 h-6 w-px bg-slate-200" />
    <Button size="sm" variant="ghost" title="تخطيط أفقي" onClick={() => onAutoLayout("RIGHT")}><LayoutTemplate size={14} />تخطيط</Button><Badge variant="secondary" className="hidden xl:inline-flex">{diagramType}</Badge><Button size="sm" variant="outline" onClick={onOpenEditor}><Code2 size={14} />تحرير JSON</Button>
  </div>;
}
