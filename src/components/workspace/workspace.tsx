"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type OnEdgesChange, type OnNodesChange } from "@xyflow/react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleDot, Code2, Command, ExternalLink, FileCode2, FileJson, FileText, Folder, FolderPlus, GitBranch, LayoutPanelLeft, Link2, Package, Pencil, Plus, Search, Settings2, Trash2, WandSparkles, X } from "lucide-react";
import { diagramLayoutSchema } from "@/domain/schemas";
import { projectDiagram, serializeLayout } from "@/domain/diagram";
import { autoLayout } from "@/domain/layout";
import type { ArchitectureEdge, ArchitectureNode, Component, ComponentType, DiagramLayout, DiagramType, Entity, Relationship, SoftwareModel } from "@/domain/types";
import { validateJsonFile, validateModel } from "@/domain/validation";
import { loadFixtureWorkspace } from "@/lib/fixture";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTableEditor, emptyDataTableDocument } from "@/components/editor/data-table";
import { CodeEditor } from "@/components/editor/code-editor";
import { ChangeLogPanel } from "@/components/workspace/change-log-panel";
import { CitizenServicesPage, CitizenServicesSidebar } from "@/components/citizen-services/citizen-services-page";

const workspace = loadFixtureWorkspace();
const defaultLayout = workspace.layouts.find((layout) => layout.diagram.id === "erd") ?? workspace.layouts[0];
const defaultPath = ".software/diagrams/erd.json";
const initiallyEnabledDiagramTypes: DiagramType[] = ["erd", "flowchart", "workflow", "process", "sequence"];
const diagramCatalog: Array<{ type: DiagramType; label: string; description: string; enabled: boolean }> = [
  { type: "erd", label: "ERD", description: "كيانات وعلاقات البيانات", enabled: true },
  { type: "flowchart", label: "Flowchart", description: "تدفق الخطوات والقرارات", enabled: true },
  { type: "workflow", label: "Workflow", description: "سير العمل بين الأدوار والخدمات", enabled: true },
  { type: "process", label: "Process diagram", description: "مراحل العملية ومدخلاتها ومخرجاتها", enabled: true },
  { type: "architecture", label: "Architecture", description: "معمارية النظام", enabled: false },
  { type: "sequence", label: "Sequence", description: "تسلسل طلب المواطن بين الجهات", enabled: true },
  { type: "component", label: "Component", description: "تفاصيل المكوّنات", enabled: false },
];

function diagramIdFromPath(path: string) {
  return path.split("/").at(-1)?.replace(".json", "") as DiagramType;
}

const coreFolders = [".software", "diagrams", "docs"];

function folderForPath(path: string) {
  if (path.startsWith(".software/diagrams/")) return "diagrams";
  if (path.startsWith("docs/")) return "docs";
  if (path.startsWith(".software/")) return ".software";
  return path.split("/")[0] ?? "project";
}

function fileNameFromPath(path: string) { return path.split("/").at(-1) ?? path; }

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "new-diagram";
}

function folderPrefix(folder: string) { return folder === "diagrams" ? ".software/diagrams" : folder; }

function fileExtension(kind: "diagram" | "json" | "markdown") { return kind === "markdown" ? ".md" : ".json"; }

function normalizedFileName(value: string, kind: "diagram" | "json" | "markdown", existingExtension?: string) {
  const clean = value.trim().replace(/[\\/]/g, "-");
  if (!clean) return "";
  if (clean.includes(".")) return clean;
  return `${clean}${existingExtension ?? fileExtension(kind)}`;
}

function renameDiagramContent(content: string, nextId: string) {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return content;
    const record = parsed as Record<string, unknown>;
    if (!record.diagram || typeof record.diagram !== "object" || Array.isArray(record.diagram)) return content;
    return `${JSON.stringify({ ...record, diagram: { ...(record.diagram as Record<string, unknown>), id: nextId } }, null, 2)}\n`;
  } catch {
    return content;
  }
}

function fileIcon(path: string) {
  if (path.endsWith(".json")) return <FileJson size={14} className="text-amber-300" />;
  if (path.endsWith(".md")) return <FileText size={14} className="text-blue-300" />;
  return <FileCode2 size={14} />;
}

function pathLabel(path: string) { return path.split("/").at(-1) ?? path; }

interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
}

type QuickLinkScope = "general" | "file";

const defaultQuickLinks: QuickLink[] = [
  { id: "google-drive", title: "Google Drive", description: "الملفات والمراجع المشتركة", url: "https://drive.google.com/" },
  { id: "github", title: "GitHub", description: "المستودع وسجل التعديلات", url: "https://github.com/lahlahai/Analysis-Department-OS" },
  { id: "onedrive", title: "OneDrive", description: "مساحة ملفات إضافية للفريق", url: "https://onedrive.live.com/" },
];

const MIN_GENERAL_LINKS_RATIO = 15;
const MAX_GENERAL_LINKS_RATIO = 85;

function clampQuickLinksRatio(value: number) {
  return Math.min(MAX_GENERAL_LINKS_RATIO, Math.max(MIN_GENERAL_LINKS_RATIO, Math.round(value)));
}

function normalizeQuickLinkUrl(value: string) {
  const candidate = value.trim();
  if (!candidate) return null;
  const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function isValidQuickLink(value: unknown): value is QuickLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  return typeof link.id === "string" && typeof link.title === "string" && typeof link.description === "string" && typeof link.url === "string";
}

function MarkdownPreview({ text }: { text: string }) {
  return <div className="h-full overflow-auto bg-[#0d131c] px-8 py-7 text-sm text-slate-300"><div className="mx-auto max-w-3xl space-y-5 font-sans leading-7">{text.split("\n").map((line, index) => line.startsWith("# ") ? <h1 key={index} className="border-b border-white/10 pb-4 text-2xl font-semibold text-slate-100">{line.slice(2)}</h1> : line.startsWith("## ") ? <h2 key={index} className="pt-3 text-lg font-semibold text-slate-100">{line.slice(3)}</h2> : line.startsWith("- ") ? <div key={index} className="flex gap-2 pl-2"><span className="text-cyan-300">•</span><span>{line.slice(2)}</span></div> : /^\d+\. /.test(line) ? <div key={index} className="pl-2 text-slate-400">{line}</div> : line.trim() ? <p key={index}>{line.replaceAll("**", "")}</p> : <div key={index} className="h-1" />)}</div></div>;
}

interface QuickLinksPanelProps {
  id: string;
  title: string;
  links: QuickLink[];
  emptyText: string;
  onAdd: () => void;
  onEdit?: (link: QuickLink) => void;
  onRemove: (id: string) => void;
}

function QuickLinksPanel({ id, title, links, emptyText, onAdd, onEdit, onRemove }: QuickLinksPanelProps) {
  return <section className="quick-links-panel border-t border-white/10 px-3 py-3" aria-labelledby={id}>
    <div className="mb-2 flex items-center justify-between gap-2">
      <div id={id} className="flex min-w-0 items-center gap-2 font-mono text-[9px] font-semibold tracking-[0.08em] text-slate-700"><Link2 size={12} className="shrink-0 text-amber-700" /><span className="truncate">{title}</span></div>
      <button type="button" onClick={onAdd} className="grid size-5 shrink-0 place-items-center rounded text-slate-500 transition hover:bg-amber-50 hover:text-amber-800" title="إضافة رابط" aria-label="إضافة رابط"><Plus size={12} /></button>
    </div>
    <div className="quick-links-list space-y-1">
      {links.map((link) => <div key={link.id} className="quick-link-item group/quick-link flex items-center gap-1 rounded-md">
        <a href={link.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-right transition" title={link.url}>
          <span className="quick-link-icon grid size-7 shrink-0 place-items-center rounded-md"><ExternalLink size={12} /></span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold">{link.title}</span><span className="block truncate text-[9px]">{link.description}</span></span>
        </a>
        {onEdit && <button type="button" onClick={() => onEdit(link)} className="quick-link-edit grid size-6 shrink-0 place-items-center rounded opacity-0 transition group-hover/quick-link:opacity-100" title="تعديل الرابط" aria-label={`تعديل ${link.title}`}><Pencil size={11} /></button>}
        <button type="button" onClick={() => onRemove(link.id)} className="quick-link-remove grid size-6 shrink-0 place-items-center rounded opacity-0 transition group-hover/quick-link:opacity-100" title="حذف الرابط" aria-label={`حذف ${link.title}`}><Trash2 size={11} /></button>
      </div>)}
      {links.length === 0 && <p className="rounded-md border border-dashed border-slate-300 px-2 py-3 text-center text-[9px] leading-5 text-slate-500">{emptyText}</p>}
    </div>
  </section>;
}

export function Workspace() {
  const [model, setModel] = useState<SoftwareModel>(workspace.model);
  const [files, setFiles] = useState<Record<string, string>>(workspace.files);
  const [savedFiles, setSavedFiles] = useState<Record<string, string>>(workspace.files);
  const [layouts, setLayouts] = useState<DiagramLayout[]>(workspace.layouts);
  const [activePath, setActivePath] = useState("");
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>(["قسم التنظيم والتخطيط العمراني"]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [fileDialog, setFileDialog] = useState<"create" | "rename" | null>(null);
  const [folderDialog, setFolderDialog] = useState<"create" | "rename" | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [folderDraft, setFolderDraft] = useState("قسم التنظيم والتخطيط العمراني");
  const [fileKindDraft, setFileKindDraft] = useState<"diagram" | "json" | "markdown">("json");
  const [diagramTypeDraft, setDiagramTypeDraft] = useState<DiagramType>("flowchart");
  const [enabledDiagramTypes, setEnabledDiagramTypes] = useState<DiagramType[]>(initiallyEnabledDiagramTypes);
  const [showDiagramSettings, setShowDiagramSettings] = useState(false);
  const [canvasNodes, setCanvasNodes] = useState<ArchitectureNode[]>(() => projectDiagram(workspace.model, defaultLayout).nodes);
  const [canvasEdges, setCanvasEdges] = useState<ArchitectureEdge[]>(() => projectDiagram(workspace.model, defaultLayout).edges);
  const [selectedId, setSelectedId] = useState<string | null>("checkout-service");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showProblems, setShowProblems] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showQuickLinksPanel, setShowQuickLinksPanel] = useState(true);
  const [workspaceSection, setWorkspaceSection] = useState<"files" | "citizen-services">("files");
  const [citizenServiceFilter, setCitizenServiceFilter] = useState<"all" | "service" | "inquiry">("all");
  const [showCommand, setShowCommand] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isLayingOut, setIsLayingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(defaultQuickLinks);
  const [fileQuickLinks, setFileQuickLinks] = useState<Record<string, QuickLink[]>>({});
  const [quickLinksHydrated, setQuickLinksHydrated] = useState(false);
  const [quickLinksGeneralRatio, setQuickLinksGeneralRatio] = useState(20);
  const quickLinksResizeRef = useRef<{ startY: number; startRatio: number; height: number } | null>(null);
  const [quickLinkDialog, setQuickLinkDialog] = useState(false);
  const [quickLinkScope, setQuickLinkScope] = useState<QuickLinkScope>("general");
  const [quickLinkEditingId, setQuickLinkEditingId] = useState<string | null>(null);
  const [quickLinkDraft, setQuickLinkDraft] = useState({ title: "", description: "", url: "" });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("analysis-department-quick-links") ?? "null") as unknown;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(stored) && stored.every(isValidQuickLink)) setQuickLinks(stored);
      const storedFileLinks = JSON.parse(localStorage.getItem("analysis-department-file-links") ?? "null") as unknown;
      if (storedFileLinks && typeof storedFileLinks === "object" && !Array.isArray(storedFileLinks)) {
        const validFileLinks = Object.fromEntries(Object.entries(storedFileLinks).filter(([, links]) => Array.isArray(links) && links.every(isValidQuickLink)));
        setFileQuickLinks(validFileLinks);
      }
      const storedRatio = Number(localStorage.getItem("analysis-department-quick-links-ratio"));
      if (Number.isFinite(storedRatio)) {
        setQuickLinksGeneralRatio(clampQuickLinksRatio(storedRatio));
      }
    } catch {
      // Keep defaults when local storage is unavailable or malformed.
    }
    setQuickLinksHydrated(true);
  }, []);

  useEffect(() => {
    if (!quickLinksHydrated) return;
    localStorage.setItem("analysis-department-quick-links", JSON.stringify(quickLinks));
    localStorage.setItem("analysis-department-file-links", JSON.stringify(fileQuickLinks));
    localStorage.setItem("analysis-department-quick-links-ratio", String(quickLinksGeneralRatio));
  }, [quickLinks, fileQuickLinks, quickLinksGeneralRatio, quickLinksHydrated]);

  const activeLayout = useMemo(() => layouts.find((layout) => activePath === `.software/diagrams/${layout.diagram.id}.json`), [activePath, layouts]);
  const activeIsDiagram = Boolean(activeLayout);
  const modifiedPaths = useMemo(() => Object.keys(files).filter((path) => files[path] !== savedFiles[path]), [files, savedFiles]);
  const issues = useMemo(() => [...Object.entries(files).flatMap(([path, content]) => validateJsonFile(path, content)), ...validateModel(model, layouts)], [files, layouts, model]);
  const selectedNode = canvasNodes.find((node) => node.id === selectedId);
  const selectedEntity = selectedId ? model.entities.find((entity) => entity.id === selectedId) : undefined;
  const selectedRelationships = selectedId ? model.relationships.filter((item) => item.source === selectedId || item.target === selectedId) : [];
  const selectedRelationship = selectedEdgeId ? model.relationships.find((relationship) => relationship.id === selectedEdgeId) : undefined;
  const diagramFilePaths = Object.keys(files).filter((path) => path.startsWith(".software/diagrams/") && path.endsWith(".json"));
  const diagramTypeForPath = (path: string) => { const rawId = path.split("/").at(-1)?.replace(".json", "") ?? ""; return layouts.find((layout) => path === `.software/diagrams/${layout.diagram.id}.json`)?.diagram.type ?? (rawId === "flow" ? "flowchart" : rawId as DiagramType); };
  const visibleFileGroups = folders.map((label) => ({ label, files: Object.keys(files).filter((path) => folderForPath(path) === label && (label !== "diagrams" || enabledDiagramTypes.includes(diagramTypeForPath(path)))) }));
  const folderOptions = [...coreFolders, ...folders.filter((folder) => !coreFolders.includes(folder))];

  useEffect(() => {
    if (!activeLayout) return;
    const projected = projectDiagram(model, activeLayout);
    // The selected file is an external source of truth for the canvas projection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanvasNodes(projected.nodes);
    setCanvasEdges(projected.edges);
    setSelectedId(projected.nodes[0]?.id ?? null);
  }, [activeLayout, model]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === "s") { event.preventDefault(); saveChanges(); }
      if (modifier && event.key.toLowerCase() === "k") { event.preventDefault(); setShowCommand(true); }
      if (modifier && event.key.toLowerCase() === "p") { event.preventDefault(); setShowCommand(true); }
      if (event.key === "Escape") { setShowCommand(false); setTabContextMenu(null); }
      if (event.key === "Delete" && activeIsDiagram && selectedEdgeId) deleteSelectedEdge();
      else if (event.key === "Delete" && activeIsDiagram && selectedId) deleteSelected();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function writeLayout(nextNodes: ArchitectureNode[], nextEdges: ArchitectureEdge[]) {
    if (!activeLayout) return;
    const nextLayout: DiagramLayout = { ...activeLayout, nodes: nextNodes.map((node) => ({ id: node.id, position: node.position, width: node.width, height: node.height })), edges: nextEdges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })) };
    setLayouts((current) => current.map((layout) => layout.diagram.id === nextLayout.diagram.id ? nextLayout : layout));
    setFiles((current) => ({ ...current, [activePath]: serializeLayout(nextLayout, nextNodes) }));
  }

  function handleNodesChange(changes: Parameters<OnNodesChange<ArchitectureNode>>[0]) {
    setCanvasNodes((current) => {
      const next = applyNodeChanges(changes, current) as ArchitectureNode[];
      if (changes.some((change) => change.type === "position" || change.type === "remove")) writeLayout(next, canvasEdges.filter((edge) => next.some((node) => node.id === edge.source) && next.some((node) => node.id === edge.target)));
      return next;
    });
  }

  function handleEdgesChange(changes: Parameters<OnEdgesChange<ArchitectureEdge>>[0]) {
    setCanvasEdges((current) => {
      const next = applyEdgeChanges(changes, current) as ArchitectureEdge[];
      if (changes.some((change) => change.type === "remove")) writeLayout(canvasNodes, next);
      return next;
    });
  }

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    if (canvasEdges.some((edge) => edge.source === connection.source && edge.target === connection.target)) return;
    const baseId = `${connection.source}-to-${connection.target}`;
    const id = model.relationships.some((relationship) => relationship.id === baseId) ? `${baseId}-${Date.now()}` : baseId;
    const relationship: Relationship = { id, source: connection.source, target: connection.target, type: "dependency", label: "ارتباط جديد", direction: "forward" };
    const nextModel: SoftwareModel = { ...model, relationships: [...model.relationships, relationship] };
    const nextEdge = { id, source: connection.source, target: connection.target, type: "architecture-edge" as const, data: { label: relationship.label, relationshipType: relationship.type }, label: relationship.label, markerEnd: "arrowclosed" } as ArchitectureEdge;
    const nextEdges = addEdge(nextEdge, canvasEdges) as ArchitectureEdge[];
    setModel(nextModel);
    setFiles((current) => ({ ...current, ".software/relationships.json": `${JSON.stringify({ version: "1.0", relationships: nextModel.relationships }, null, 2)}\n` }));
    setCanvasEdges(nextEdges);
    writeLayout(canvasNodes, nextEdges);
    setSelectedId(null);
    setSelectedEdgeId(id);
  }

  function updateRelationship(id: string, patch: Partial<Pick<Relationship, "label" | "type" | "direction">>) {
    const nextModel: SoftwareModel = { ...model, relationships: model.relationships.map((relationship) => relationship.id === id ? { ...relationship, ...patch } : relationship) };
    setModel(nextModel);
    setFiles((current) => ({ ...current, ".software/relationships.json": `${JSON.stringify({ version: "1.0", relationships: nextModel.relationships }, null, 2)}\n` }));
    const updated = nextModel.relationships.find((relationship) => relationship.id === id);
    if (!updated) return;
    setCanvasEdges((current) => current.map((edge) => edge.id === id ? { ...edge, label: updated.label, animated: updated.type === "event", data: { ...edge.data, label: updated.label, relationshipType: updated.type } } : edge));
  }

  function deleteSelectedEdge() {
    if (!selectedEdgeId) return;
    const id = selectedEdgeId;
    const nextModel: SoftwareModel = { ...model, relationships: model.relationships.filter((relationship) => relationship.id !== id) };
    const nextLayouts = layouts.map((layout) => ({ ...layout, edges: layout.edges.filter((edge) => edge.id !== id) }));
    setModel(nextModel);
    setLayouts(nextLayouts);
    setFiles((current) => {
      const next: Record<string, string> = { ...current, ".software/relationships.json": `${JSON.stringify({ version: "1.0", relationships: nextModel.relationships }, null, 2)}\n` };
      nextLayouts.forEach((layout) => { next[`.software/diagrams/${layout.diagram.id}.json`] = `${JSON.stringify(layout, null, 2)}\n`; });
      return next;
    });
    setCanvasEdges((current) => current.filter((edge) => edge.id !== id));
    setSelectedEdgeId(null);
  }

  const handleAutoLayout = useCallback(async (direction: "RIGHT" | "DOWN") => {
    if (!activeLayout) return;
    setIsLayingOut(true);
    const next = await autoLayout(canvasNodes, canvasEdges, direction);
    setCanvasNodes(next);
    writeLayout(next, canvasEdges);
    setIsLayingOut(false);
    setNotice(`تم تطبيق التخطيط ${direction === "RIGHT" ? "الأفقي" : "الرأسي"}`);
    window.setTimeout(() => setNotice(null), 2400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayout, canvasEdges, canvasNodes]);

  function handleEditorChange(value: string) {
    setFiles((current) => ({ ...current, [activePath]: value }));
    if (!activeIsDiagram) return;
    let jsonValue: unknown;
    try { jsonValue = JSON.parse(value) as unknown; } catch { return; }
    const parsed = diagramLayoutSchema.safeParse(jsonValue);
    if (parsed.success) {
      setLayouts((current) => current.map((layout) => layout.diagram.id === parsed.data.diagram.id ? parsed.data : layout));
      const projected = projectDiagram(model, parsed.data);
      setCanvasNodes(projected.nodes);
      setCanvasEdges(projected.edges);
    }
  }

  function saveChanges() {
    const errors = issues.filter((issue) => issue.severity === "error");
    if (errors.length) { setShowProblems(true); setNotice(`أصلح ${errors.length} من أخطاء التحقق قبل الحفظ`); return; }
    setSavedFiles({ ...files });
    setNotice(modifiedPaths.length ? `تم حفظ ${modifiedPaths.length} ملف` : "لا توجد تغييرات");
    window.setTimeout(() => setNotice(null), 2400);
  }

  function deleteSelected() {
    if (!selectedId || !activeLayout) return;
    const nextNodes = canvasNodes.filter((node) => node.id !== selectedId);
    const nextEdges = canvasEdges.filter((edge) => edge.source !== selectedId && edge.target !== selectedId);
    setCanvasNodes(nextNodes); setCanvasEdges(nextEdges); writeLayout(nextNodes, nextEdges); setSelectedId(null);
  }

  function selectPath(path: string) {
    setActivePath(path);
    setOpenPaths((current) => current.includes(path) ? current : [...current, path]);
    setShowCommand(false);
    setEditorOpen(false);
  }

  function openQuickLinkDialog(scope: QuickLinkScope, link?: QuickLink) {
    if (scope === "file" && !activePath) {
      setNotice("افتح ملفاً أولاً لإضافة رابط مخصص له");
      return;
    }
    setQuickLinkScope(scope);
    setQuickLinkEditingId(link?.id ?? null);
    setQuickLinkDraft(link ? { title: link.title, description: link.description, url: link.url } : { title: "", description: "", url: "https://" });
    setQuickLinkDialog(true);
  }

  function submitQuickLink() {
    const title = quickLinkDraft.title.trim();
    const description = quickLinkDraft.description.trim();
    const url = normalizeQuickLinkUrl(quickLinkDraft.url);
    if (!title || !description || !url) {
      setNotice("أدخل اسم الرابط ووصفه ورابطاً صحيحاً");
      return;
    }
    const link = { id: quickLinkEditingId ?? `quick-link-${Date.now()}`, title, description, url };
    if (quickLinkScope === "general") {
      setQuickLinks((current) => quickLinkEditingId ? current.map((item) => item.id === quickLinkEditingId ? link : item) : [...current, link]);
    } else if (activePath) {
      setFileQuickLinks((current) => ({ ...current, [activePath]: quickLinkEditingId ? (current[activePath] ?? []).map((item) => item.id === quickLinkEditingId ? link : item) : [...(current[activePath] ?? []), link] }));
    }
    setQuickLinkEditingId(null);
    setQuickLinkDialog(false);
  }

  function removeQuickLink(scope: QuickLinkScope, id: string) {
    if (scope === "general") setQuickLinks((current) => current.filter((link) => link.id !== id));
    else if (activePath) setFileQuickLinks((current) => ({ ...current, [activePath]: (current[activePath] ?? []).filter((link) => link.id !== id) }));
  }

  function startQuickLinksResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const body = event.currentTarget.parentElement;
    if (!body) return;
    quickLinksResizeRef.current = { startY: event.clientY, startRatio: quickLinksGeneralRatio, height: body.getBoundingClientRect().height };
    const handleMove = (moveEvent: PointerEvent) => {
      const resizeState = quickLinksResizeRef.current;
      if (!resizeState || resizeState.height <= 0) return;
      const deltaRatio = ((moveEvent.clientY - resizeState.startY) / resizeState.height) * 100;
      setQuickLinksGeneralRatio(clampQuickLinksRatio(resizeState.startRatio + deltaRatio));
    };
    const handleUp = () => {
      quickLinksResizeRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleQuickLinksResizeKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setQuickLinksGeneralRatio((current) => clampQuickLinksRatio(current - 5));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setQuickLinksGeneralRatio((current) => clampQuickLinksRatio(current + 5));
    }
  }

  function openTabContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setTabContextMenu({ x: event.clientX, y: event.clientY });
  }

  function closeAllTabs() {
    setOpenPaths([]);
    setActivePath("");
    setSelectedId(null);
    setSelectedEdgeId(null);
    setEditorOpen(false);
    setTabContextMenu(null);
  }

  function closeFile(path: string) {
    const nextPaths = openPaths.filter((item) => item !== path);
    if (!nextPaths.length) return;
    setOpenPaths(nextPaths);
    if (activePath === path) setActivePath(nextPaths.at(-1) ?? defaultPath);
    setEditorOpen(false);
  }

  function toggleFolder(label: string) {
    setOpenFolders((current) => ({ ...current, [label]: !current[label] }));
  }

  function openCreateFile() {
    setEditingPath(null);
    setNameDraft("");
    setFolderDraft("قسم التنظيم والتخطيط العمراني");
    setFileKindDraft("json");
    setDiagramTypeDraft("flowchart");
    setFileDialog("create");
  }

  function openRenameFile(path: string) {
    setEditingPath(path);
    setNameDraft(fileNameFromPath(path));
    setFileDialog("rename");
  }

  function openCreateFolder() {
    setEditingFolder(null);
    setNameDraft("");
    setFolderDialog("create");
  }

  function openRenameFolder(folder: string) {
    if (coreFolders.includes(folder)) return;
    setEditingFolder(folder);
    setNameDraft(folder);
    setFolderDialog("rename");
  }

  function submitFolder() {
    const nextName = nameDraft.trim().replace(/[\\/]/g, "-");
    if (!nextName) return;
    if (folderDialog === "create") {
      if (folders.includes(nextName)) return;
      setFolders((current) => [...current, nextName]);
      setOpenFolders((current) => ({ ...current, [nextName]: true }));
    } else if (editingFolder && nextName !== editingFolder) {
      if (folders.includes(nextName)) return;
      const oldPrefix = folderPrefix(editingFolder);
      const newPrefix = folderPrefix(nextName);
      const renamePaths = (record: Record<string, string>) => Object.fromEntries(Object.entries(record).map(([path, value]) => [path.startsWith(`${oldPrefix}/`) ? `${newPrefix}/${path.slice(oldPrefix.length + 1)}` : path, value]));
      setFiles((current) => renamePaths(current));
      setSavedFiles((current) => renamePaths(current));
      setOpenPaths((current) => current.map((path) => path.startsWith(`${oldPrefix}/`) ? `${newPrefix}/${path.slice(oldPrefix.length + 1)}` : path));
      if (activePath.startsWith(`${oldPrefix}/`)) setActivePath(`${newPrefix}/${activePath.slice(oldPrefix.length + 1)}`);
      setFolders((current) => current.map((folder) => folder === editingFolder ? nextName : folder));
      setOpenFolders((current) => ({ ...current, [nextName]: current[editingFolder] ?? true }));
    }
    setFolderDialog(null);
  }

  function deleteFolder(folder: string) {
    if (coreFolders.includes(folder)) return;
    const prefix = `${folderPrefix(folder)}/`;
    const folderFiles = Object.keys(files).filter((path) => path.startsWith(prefix));
    if (folderFiles.length && !window.confirm(`حذف مجلد ${folder} وكل ملفاته؟`)) return;
    setFiles((current) => Object.fromEntries(Object.entries(current).filter(([path]) => !path.startsWith(prefix))));
    setSavedFiles((current) => Object.fromEntries(Object.entries(current).filter(([path]) => !path.startsWith(prefix))));
    setLayouts((current) => current.filter((layout) => !folderFiles.includes(`.software/diagrams/${layout.diagram.id}.json`)));
    setOpenPaths((current) => current.filter((path) => !path.startsWith(prefix)));
    if (activePath.startsWith(prefix)) setActivePath(defaultPath);
    setFolders((current) => current.filter((item) => item !== folder));
  }

  function deleteFile(path: string) {
    if (Object.keys(files).length <= 1 || !window.confirm(`حذف الملف ${fileNameFromPath(path)}؟`)) return;
    const nextFiles = Object.keys(files).filter((item) => item !== path);
    setFiles((current) => { const next = { ...current }; delete next[path]; return next; });
    setSavedFiles((current) => { const next = { ...current }; delete next[path]; return next; });
    setLayouts((current) => current.filter((layout) => `.software/diagrams/${layout.diagram.id}.json` !== path));
    const nextOpenPaths = openPaths.filter((item) => item !== path);
    const nextActivePath = activePath === path ? nextOpenPaths.at(-1) ?? nextFiles[0] ?? defaultPath : activePath;
    setOpenPaths(nextOpenPaths.length ? nextOpenPaths : [nextActivePath]);
    setActivePath(nextActivePath);
    setEditorOpen(false);
  }

  function submitFile() {
    if (fileDialog === "rename" && editingPath) {
      const oldPath = editingPath;
      const extension = fileNameFromPath(oldPath).match(/\.[^.]+$/)?.[0];
      const nextName = normalizedFileName(nameDraft, oldPath.includes("/diagrams/") ? "diagram" : oldPath.endsWith(".md") ? "markdown" : "json", extension);
      if (!nextName) return;
      const nextPath = `${folderPrefix(folderForPath(oldPath))}/${nextName}`;
      if (nextPath !== oldPath && files[nextPath] !== undefined) return;
      const isDiagramFile = oldPath.includes("/diagrams/");
      const nextId = nextName.replace(/\.json$/i, "");
      setFiles((current) => { const next = { ...current, [nextPath]: isDiagramFile ? renameDiagramContent(current[oldPath], nextId) : current[oldPath] }; delete next[oldPath]; return next; });
      setSavedFiles((current) => { const next = { ...current, [nextPath]: isDiagramFile ? renameDiagramContent(current[oldPath], nextId) : current[oldPath] }; delete next[oldPath]; return next; });
      setOpenPaths((current) => current.map((path) => path === oldPath ? nextPath : path));
      if (activePath === oldPath) setActivePath(nextPath);
      if (isDiagramFile && nextPath.includes("/diagrams/")) {
        const oldId = diagramIdFromPath(oldPath);
        setLayouts((current) => current.map((layout) => layout.diagram.id === oldId ? { ...layout, diagram: { ...layout.diagram, id: nextId } } : layout));
      }
    } else if (fileDialog === "create") {
      const targetFolder = folderDraft;
      const nextName = normalizedFileName(nameDraft, "json");
      if (!nextName) return;
      const nextPath = `${folderPrefix(targetFolder)}/${nextName}`;
      if (files[nextPath] !== undefined) return;
      setFiles((current) => ({ ...current, [nextPath]: emptyDataTableDocument() }));
      if (!folders.includes(targetFolder)) setFolders((current) => [...current, targetFolder]);
      setOpenFolders((current) => ({ ...current, [targetFolder]: true }));
      selectPath(nextPath);
    }
    setFileDialog(null);
  }

  function saveAndCloseEditor() {
    if (issues.some((issue) => issue.severity === "error")) { saveChanges(); return; }
    saveChanges();
    setEditorOpen(false);
  }

  function toggleDiagramType(type: DiagramType) {
    const item = diagramCatalog.find((diagram) => diagram.type === type);
    if (!item?.enabled) return;
    setEnabledDiagramTypes((current) => {
      const next = current.includes(type) ? current.filter((value) => value !== type) : [...current, type];
      if (!next.includes(diagramTypeForPath(activePath))) {
        const fallback = diagramFilePaths.find((path) => next.includes(diagramTypeForPath(path)));
        if (fallback) setActivePath(fallback);
      }
      return next;
    });
  }

  function updateComponent(id: string, patch: Partial<Pick<Component, "name" | "description" | "type">> & { metadata?: Record<string, string> }) {
    const nextModel: SoftwareModel = { ...model, components: model.components.map((component) => component.id === id ? { ...component, ...patch } : component) };
    setModel(nextModel);
    setFiles((current) => ({ ...current, ".software/components.json": `${JSON.stringify({ version: "1.0", components: nextModel.components }, null, 2)}\n` }));
    setCanvasNodes((current) => current.map((node) => node.id === id ? { ...node, data: { ...node.data, label: nextModel.components.find((component) => component.id === id)?.name ?? node.data.label, description: nextModel.components.find((component) => component.id === id)?.description ?? node.data.description, type: nextModel.components.find((component) => component.id === id)?.type ?? node.data.type, metadata: nextModel.components.find((component) => component.id === id)?.metadata ?? {} } } : node));
  }

  function updateEntity(id: string, patch: Partial<Pick<Entity, "name" | "description" | "fields">>) {
    const nextModel: SoftwareModel = { ...model, entities: model.entities.map((entity) => entity.id === id ? { ...entity, ...patch } : entity) };
    setModel(nextModel);
    setFiles((current) => ({ ...current, ".software/entities.json": `${JSON.stringify({ version: "1.0", entities: nextModel.entities }, null, 2)}\n` }));
    setCanvasNodes((current) => current.map((node) => node.id === id ? { ...node, data: { ...node.data, label: nextModel.entities.find((entity) => entity.id === id)?.name ?? node.data.label, description: nextModel.entities.find((entity) => entity.id === id)?.description ?? node.data.description, fieldCount: nextModel.entities.find((entity) => entity.id === id)?.fields.length ?? node.data.fieldCount } } : node));
  }

  return <main className="day-mode official-shell relative flex h-screen min-h-[680px] flex-col overflow-hidden text-slate-800">
    <header className="official-header flex h-12 shrink-0 items-center border-b border-white/10 bg-[#111923] px-3 shadow-lg shadow-black/10">
      <div className="official-brand flex w-[244px] items-center gap-2 border-r border-white/10 pr-4"><div className="official-brand-mark grid size-7 place-items-center rounded-md bg-cyan-400 text-slate-950"><Package size={16} strokeWidth={2.5} /></div><div><div className="font-mono text-[11px] font-semibold tracking-tight text-slate-100">قسم فريق تحليل المشاريع</div><div className="font-mono text-[8px] tracking-[0.12em] text-slate-500">مكان واحد لكل الملفات والروابط</div></div></div>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4"><span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-300">checkout-platform</span><ChevronRight size={13} className="text-slate-600" /><span className="flex items-center gap-1 font-mono text-[10px] text-slate-400"><GitBranch size={13} className="text-violet-300" />main</span><span className="h-4 w-px bg-white/10" /><span className="font-mono text-[10px] text-slate-500">acme / checkout-platform</span></div>
      <div className="flex items-center gap-1"><Button size="sm" variant="ghost" onClick={saveChanges}><Check size={13} className={modifiedPaths.length ? "text-amber-600" : "text-emerald-600"} />حفظ {modifiedPaths.length > 0 && <span className="rounded bg-amber-100 px-1 text-[9px] text-amber-700">{modifiedPaths.length}</span>}</Button><Button size="sm" variant="ghost" disabled={!activeLayout || isLayingOut} onClick={() => handleAutoLayout("RIGHT")}><WandSparkles size={13} className="text-violet-600" />ترتيب</Button><Button size="sm" variant="ghost" onClick={() => setShowProblems(true)}><CircleDot size={13} className={issues.length ? "text-amber-600" : "text-emerald-600"} />تحقق</Button><Button size="icon" variant="ghost" title="إعدادات المخططات" onClick={() => setShowDiagramSettings(true)}><Settings2 size={14} /></Button></div>
    </header>

    <Dialog open={quickLinkDialog} onOpenChange={setQuickLinkDialog}><DialogContent dir="rtl"><DialogTitle className="text-lg font-semibold text-slate-900">{quickLinkEditingId ? "تعديل الرابط العام" : quickLinkScope === "general" ? "إضافة رابط عام" : "إضافة رابط للملف"}</DialogTitle><DialogDescription className="mt-1 text-right text-xs text-slate-500">أضف اسماً ووصفاً ورابطاً واضحاً ليستفيد منه الفريق.</DialogDescription><div className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700">اسم الرابط<Input className="mt-1" autoFocus value={quickLinkDraft.title} onChange={(event) => setQuickLinkDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Google Drive" /></label><label className="block text-sm font-medium text-slate-700">الوصف<Input className="mt-1" value={quickLinkDraft.description} onChange={(event) => setQuickLinkDraft((current) => ({ ...current, description: event.target.value }))} placeholder="الملفات والمراجع المشتركة" /></label><label className="block text-sm font-medium text-slate-700">الرابط<Input className="mt-1" value={quickLinkDraft.url} onChange={(event) => setQuickLinkDraft((current) => ({ ...current, url: event.target.value }))} placeholder="https://example.com" dir="ltr" /></label></div><div className="mt-6 flex justify-start gap-2"><Button variant="outline" onClick={() => setQuickLinkDialog(false)}>إلغاء</Button><Button variant="primary" onClick={submitQuickLink}><Link2 size={14} />{quickLinkEditingId ? "حفظ التعديل" : "إضافة الرابط"}</Button></div></DialogContent></Dialog>
    <div className="workspace-body flex min-h-0 flex-1">
      {showLeftPanel && <aside className="workspace-sidebar official-sidebar flex w-[244px] shrink-0 flex-col border-r border-white/10 bg-[#111923]">
         <div className="flex h-10 items-center justify-between border-b border-white/10 px-3"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.13em] text-slate-400"><LayoutPanelLeft size={13} />{workspaceSection === "files" ? "الملفات" : "طلبات المواطنين"}</div><div className="flex items-center gap-0.5">{workspaceSection === "files" && <><Button size="icon" variant="ghost" title="ملف جديد" onClick={openCreateFile}><Plus size={13} /></Button><Button size="icon" variant="ghost" title="مجلد جديد" onClick={openCreateFolder}><FolderPlus size={13} /></Button></>}<Button size="icon" variant="ghost" title="طي اللوحة الجانبية" onClick={() => setShowLeftPanel(false)}><ChevronRight size={14} /></Button></div></div>
         <div className="flex border-b border-white/10 p-1"><button type="button" onClick={() => setWorkspaceSection("files")} className={cn("flex-1 rounded px-2 py-1.5 text-[10px]", workspaceSection === "files" ? "bg-cyan-400/10 text-cyan-700" : "text-slate-500 hover:bg-slate-100")}>ملفات المشروع</button><button type="button" onClick={() => setWorkspaceSection("citizen-services")} className={cn("flex-1 rounded px-2 py-1.5 text-[10px]", workspaceSection === "citizen-services" ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:bg-slate-100")}>طلبات المواطنين</button></div>
        {workspaceSection === "files" ? <>
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2"><Search size={13} className="text-slate-600" /><Input className="h-7 border-0 bg-transparent px-0 shadow-none focus:bg-transparent focus:ring-0" placeholder="تصفية الملفات" /></div>
        <div className="min-h-0 flex-1 overflow-auto px-2 py-3">{visibleFileGroups.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-[11px] leading-6 text-slate-500">المستكشف فارغ.<br />أنشئ مجلدًا أو ملفًا جديدًا للبدء.</div> : visibleFileGroups.map((group) => { const isOpen = openFolders[group.label] ?? true; const isCoreFolder = coreFolders.includes(group.label); return <div key={group.label} className="group/folder mb-2"><div className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"><button type="button" onClick={() => toggleFolder(group.label)} className="flex min-w-0 flex-1 items-center gap-1 text-right font-mono text-[10px] font-semibold text-slate-500"><ChevronDown size={12} className={cn("transition-transform", !isOpen && "-rotate-90")} /><Folder size={13} className="text-cyan-300/70" /><span className="truncate">{group.label === "diagrams" ? "المخططات" : group.label === "docs" ? "التوثيق" : group.label}</span><span className="ml-auto text-[9px] text-slate-700">{group.files.length}</span></button>{!isCoreFolder && <div className="flex items-center gap-0.5"><button type="button" onClick={() => openRenameFolder(group.label)} className="grid size-5 place-items-center rounded text-slate-400 hover:bg-white hover:text-cyan-600" title="إعادة تسمية المجلد"><Pencil size={10} /></button><button type="button" onClick={() => deleteFolder(group.label)} className="grid size-5 place-items-center rounded text-slate-400 hover:bg-white hover:text-rose-600" title="حذف المجلد"><Trash2 size={10} /></button></div>}</div>{isOpen && <div className="mt-0.5">{group.files.map((path) => <div key={path} className={cn("group/file flex w-full items-center rounded", activePath === path ? "bg-cyan-400/10" : "hover:bg-white/[0.05]")}><button type="button" onClick={() => selectPath(path)} className={cn("flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left font-mono text-[10px] transition-colors", activePath === path ? "text-cyan-200" : "text-slate-400 hover:text-slate-200")}><span className="w-4">{fileIcon(path)}</span><span className="file-name truncate" dir="ltr">{pathLabel(path)}</span>{files[path] !== savedFiles[path] && <span className="ml-auto size-1.5 rounded-full bg-amber-300" />}</button><div className="flex items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover/file:opacity-100"><button type="button" onClick={() => openRenameFile(path)} className="grid size-5 place-items-center rounded text-slate-400 hover:bg-white hover:text-cyan-600" title="إعادة تسمية الملف"><Pencil size={10} /></button><button type="button" onClick={() => deleteFile(path)} className="grid size-5 place-items-center rounded text-slate-400 hover:bg-white hover:text-rose-600" title="حذف الملف"><Trash2 size={10} /></button></div></div>)}</div>}</div>; })}</div>
         </> : <CitizenServicesSidebar services={workspace.citizenServices} activeFilter={citizenServiceFilter} onFilterChange={setCitizenServiceFilter} />}
      </aside>}

      <section className="official-main flex min-w-0 flex-1 flex-col bg-[#0b1018]">
        {workspaceSection === "files" ? <>
         <div className="workspace-tabs flex h-10 shrink-0 items-stretch border-b border-white/10 bg-[#0f1722] px-2" onContextMenu={openTabContextMenu}><div className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto">{openPaths.map((path) => <div key={path} className={cn("workspace-tab flex max-w-[190px] shrink-0 items-center border-x border-white/10", activePath === path && "workspace-tab-active")}><button type="button" onClick={() => selectPath(path)} className={cn("workspace-tab-button flex min-w-0 items-center gap-2 px-3 font-mono text-[10px]", activePath === path ? "text-cyan-200" : "text-slate-500 hover:text-slate-200")}><span>{fileIcon(path)}</span><span className="file-name truncate" dir="ltr">{pathLabel(path)}</span>{files[path] !== savedFiles[path] && <span className="size-1.5 shrink-0 rounded-full bg-amber-300" />}</button><button type="button" onClick={(event) => { event.stopPropagation(); closeFile(path); }} className="workspace-tab-close mr-1 grid size-5 shrink-0 place-items-center rounded text-slate-600 hover:bg-white/10 hover:text-slate-200" title="إغلاق الملف"><X size={11} /></button></div>)}</div><div className="workspace-tabs-actions flex items-center gap-1 pl-2"><Button size="icon" variant="ghost" title="لوحة الأوامر" onClick={() => setShowCommand(true)}><Command size={14} /></Button></div></div>
        <div className="min-h-0 flex-1">{activePath ? <DataTableEditor key={activePath} path={activePath} value={files[activePath] ?? ""} onChange={(value) => setFiles((current) => ({ ...current, [activePath]: value }))} /> : <EmptyWorkspaceState />}</div>
         </> : <CitizenServicesPage services={workspace.citizenServices} activeFilter={citizenServiceFilter} onFilterChange={setCitizenServiceFilter} />}
        <ChangeLogPanel />
      </section>

      {showQuickLinksPanel && workspaceSection === "files" && <aside className="quick-links-sidebar official-properties flex w-[282px] shrink-0 flex-col border-l border-slate-200 bg-white"><div className="flex h-10 items-center justify-between border-b border-slate-200 bg-slate-50 px-3"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.08em] text-slate-700"><Link2 size={13} className="text-amber-700" />الروابط السريعة</div><Button size="icon" variant="ghost" title="طي لوحة الروابط السريعة" onClick={() => setShowQuickLinksPanel(false)}><ChevronLeft size={14} /></Button></div><div className="quick-links-sidebar-body flex min-h-0 flex-1 flex-col overflow-auto" style={{ gridTemplateRows: `${quickLinksGeneralRatio}fr 8px ${100 - quickLinksGeneralRatio}fr` }}><QuickLinksPanel id="general-quick-links" title="روابط عامة للفريق" links={quickLinks} emptyText="أضف رابطاً عاماً للفريق." onAdd={() => openQuickLinkDialog("general")} onEdit={(link) => openQuickLinkDialog("general", link)} onRemove={(id) => removeQuickLink("general", id)} /><div className="quick-links-resize-handle" role="separator" tabIndex={0} aria-orientation="horizontal" aria-valuemin={MIN_GENERAL_LINKS_RATIO} aria-valuemax={MAX_GENERAL_LINKS_RATIO} aria-valuenow={quickLinksGeneralRatio} aria-label="تغيير مساحة الروابط العامة وروابط الملف" title="اسحب لتغيير مساحة القسمين" onPointerDown={startQuickLinksResize} onKeyDown={handleQuickLinksResizeKey}><span /></div><div className="quick-links-file-section"><QuickLinksPanel id="file-quick-links" title={activePath ? `روابط الملف: ${pathLabel(activePath)}` : "روابط الملف المفتوح"} links={activePath ? (fileQuickLinks[activePath] ?? []) : []} emptyText={activePath ? "أضف روابط مرتبطة بهذا الملف." : "افتح ملفاً لعرض روابطه الخاصة."} onAdd={() => openQuickLinkDialog("file")} onRemove={(id) => removeQuickLink("file", id)} /></div></div></aside>}
    </div>

    {!showLeftPanel && <Button className="fixed right-2 top-16 z-30 shadow-md" size="sm" variant="outline" title="فتح لوحة الملفات" onClick={() => setShowLeftPanel(true)}><ChevronLeft size={14} />الملفات</Button>}
    {!showQuickLinksPanel && workspaceSection === "files" && <Button className="fixed left-2 top-16 z-30 shadow-md" size="sm" variant="outline" title="فتح لوحة الروابط السريعة" onClick={() => setShowQuickLinksPanel(true)}>الروابط السريعة<ChevronRight size={14} /></Button>}
    {!showProblems && <Button className="fixed bottom-9 left-1/2 z-30 -translate-x-1/2 shadow-md" size="sm" variant="outline" title="فتح لوحة المشاكل" onClick={() => setShowProblems(true)}><ChevronUp size={14} />المشاكل</Button>}

    {showProblems && <section className="h-[148px] shrink-0 border-t border-white/10 bg-[#0f1722]"><div className="flex h-9 items-center gap-5 border-b border-white/10 px-4"><div className="flex h-full items-center gap-2 border-b border-cyan-300 font-mono text-[10px] text-slate-200"><CircleDot size={13} className={issues.length ? "text-amber-300" : "text-emerald-300"} />المشاكل <span className={cn("rounded px-1.5 py-0.5 text-[9px]", issues.length ? "bg-amber-300/15 text-amber-300" : "bg-emerald-300/15 text-emerald-300")}>{issues.length}</span></div><button className="ml-auto text-slate-600 hover:text-slate-200" onClick={() => setShowProblems(false)} title="طي لوحة المشاكل"><ChevronDown size={14} /></button></div><div className="h-[109px] overflow-auto px-4 py-2">{issues.length === 0 ? <div className="flex items-center gap-2 py-3 font-mono text-[10px] text-emerald-300"><Check size={13} />لا توجد مشاكل في المشروع.</div> : issues.map((issue) => <div key={issue.id} className="flex items-center gap-3 border-b border-white/[0.04] py-1.5 font-mono text-[10px]"><span className={issue.severity === "error" ? "text-rose-300" : "text-amber-300"}>{issue.severity === "error" ? "×" : "△"}</span><span className="text-slate-300">{issue.message}</span><span className="ml-auto text-slate-600">{issue.path}</span></div>)}</div></section>}
    <footer className="official-footer flex h-9 shrink-0 items-center gap-3 border-t border-white/10 bg-[#111923] px-4 font-mono text-[9px] text-slate-500"><span className="footer-ready flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-300" />جاهز</span><span className="footer-branch flex items-center gap-1"><GitBranch size={11} />main</span><span className="footer-check flex items-center gap-1"><CircleDot size={11} className={issues.length ? "text-amber-300" : "text-emerald-300"} />{issues.length ? `${issues.length} مشكلة` : "تم التحقق"}</span><span className="footer-development-status"><span className="size-1.5 rounded-full bg-amber-300" />الموقع ما يزال تحت التطوير</span><span className="ml-auto footer-credit">تصميم وتنفيذ: محمد لحلح</span><span className="footer-stack text-slate-700">TypeScript · UTF-8 · LF</span></footer>

    {notice && <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-md border border-cyan-400/30 bg-slate-950 px-3 py-2 font-mono text-[10px] text-cyan-200 shadow-2xl">{notice}</div>}
    <Dialog open={fileDialog !== null} onOpenChange={(open) => !open && setFileDialog(null)}><DialogContent dir="rtl"><DialogTitle className="text-lg font-semibold text-slate-900">{fileDialog === "rename" ? "إعادة تسمية ملف" : "ملف جديد"}</DialogTitle><DialogDescription className="mt-1 text-right text-xs text-slate-500">{fileDialog === "rename" ? "غيّر اسم الملف مع الحفاظ على محتواه." : "أنشئ ملفًا جديدًا داخل مجلد المشروع."}</DialogDescription><div className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700">اسم الملف<Input className="mt-1" autoFocus value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder={fileDialog === "rename" ? "اسم الملف" : "مخطط الدفع"} dir="ltr" /></label>{fileDialog === "create" && <><label className="block text-sm font-medium text-slate-700">المجلد<select className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-pink-500" value={fileKindDraft === "diagram" ? "diagrams" : folderDraft} onChange={(event) => setFolderDraft(event.target.value)}>{folders.map((folder) => <option key={folder} value={folder}>{folder === "diagrams" ? "المخططات" : folder === "docs" ? "التوثيق" : folder}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">نوع الملف<select className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-pink-500" value={fileKindDraft} onChange={(event) => setFileKindDraft(event.target.value as "diagram" | "json" | "markdown")}><option value="diagram">مخطط Diagram</option><option value="json">JSON</option><option value="markdown">توثيق Markdown</option></select></label>{fileKindDraft === "diagram" && <label className="block text-sm font-medium text-slate-700">نوع المخطط<select className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-pink-500" value={diagramTypeDraft} onChange={(event) => setDiagramTypeDraft(event.target.value as DiagramType)}>{diagramCatalog.filter((item) => item.enabled).map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></label>}</>}</div><div className="mt-6 flex justify-start gap-2"><Button variant="outline" onClick={() => setFileDialog(null)}>إلغاء</Button><Button variant="primary" onClick={submitFile}><Check size={14} />{fileDialog === "rename" ? "حفظ الاسم" : "إنشاء الملف"}</Button></div></DialogContent></Dialog>
    <Dialog open={folderDialog !== null} onOpenChange={(open) => !open && setFolderDialog(null)}><DialogContent dir="rtl"><DialogTitle className="text-lg font-semibold text-slate-900">{folderDialog === "rename" ? "إعادة تسمية مجلد" : "مجلد جديد"}</DialogTitle><DialogDescription className="mt-1 text-right text-xs text-slate-500">{folderDialog === "rename" ? "ستنتقل الملفات الموجودة إلى الاسم الجديد." : "أنشئ مجلدًا لتنظيم الملفات."}</DialogDescription><label className="mt-5 block text-sm font-medium text-slate-700">اسم المجلد<Input className="mt-1" autoFocus value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="اسم المجلد" dir="ltr" /></label><div className="mt-6 flex justify-start gap-2"><Button variant="outline" onClick={() => setFolderDialog(null)}>إلغاء</Button><Button variant="primary" onClick={submitFolder}><Check size={14} />{folderDialog === "rename" ? "حفظ الاسم" : "إنشاء المجلد"}</Button></div></DialogContent></Dialog>
    <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent dir="rtl" className="flex h-[82vh] max-w-[1180px] flex-col gap-0 overflow-hidden p-0"><div className="shrink-0 border-b border-slate-200 px-6 py-4"><DialogTitle className="text-base font-semibold text-slate-900">تحرير الملف</DialogTitle><DialogDescription className="mt-1 font-mono text-[10px] text-slate-500" dir="ltr">{activePath}</DialogDescription></div><div className="min-h-0 flex-1">{activePath.endsWith(".md") ? <div className="grid h-full min-h-0 grid-cols-2 divide-x divide-slate-200"><CodeEditor path={activePath} value={files[activePath]} onChange={handleEditorChange} /><MarkdownPreview text={files[activePath]} /></div> : <CodeEditor path={activePath} value={files[activePath]} onChange={handleEditorChange} />}</div><div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3"><span className="text-xs text-slate-500">Ctrl / Cmd + S للحفظ</span><div className="flex gap-2"><Button variant="outline" onClick={() => setEditorOpen(false)}>إلغاء</Button><Button variant="primary" onClick={saveAndCloseEditor}><Check size={14} />حفظ الملف</Button></div></div></DialogContent></Dialog>
    <Dialog open={showDiagramSettings} onOpenChange={setShowDiagramSettings}><DialogContent dir="rtl"><DialogTitle className="text-lg font-semibold text-slate-900">أنواع المخططات</DialogTitle><DialogDescription className="mt-1 text-right text-xs text-slate-500">فعّل ما تحتاجه الآن. الأنواع الأخرى محفوظة للمراحل القادمة.</DialogDescription><div className="mt-5 space-y-2">{diagramCatalog.map((item) => <div key={item.type} className={cn("flex items-center gap-3 rounded-lg border p-3", item.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60")}><Checkbox checked={enabledDiagramTypes.includes(item.type)} disabled={!item.enabled} onCheckedChange={() => toggleDiagramType(item.type)} /><div className="min-w-0 flex-1"><div className="font-medium text-slate-800">{item.label}</div><div className="mt-0.5 text-xs text-slate-500">{item.description}</div></div><Badge variant={item.enabled && enabledDiagramTypes.includes(item.type) ? "default" : "secondary"}>{item.enabled && enabledDiagramTypes.includes(item.type) ? "مفعّل" : "غير مفعّل"}</Badge></div>)}</div><div className="mt-5 rounded-lg bg-pink-50 p-3 text-xs leading-6 text-pink-700">المفعّل حاليًا: ERD، Flowchart، Workflow، Process.</div></DialogContent></Dialog>
    {showCommand && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px]" onMouseDown={() => setShowCommand(false)}><div className="mx-auto mt-24 w-[520px] overflow-hidden rounded-lg border border-white/15 bg-[#111923] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center gap-2 border-b border-white/10 px-4 py-3"><Command size={14} className="text-cyan-300" /><input autoFocus className="flex-1 bg-transparent font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600" placeholder="اكتب أمرًا…" /></div><div className="p-2">{[["تخطيط تلقائي", WandSparkles], ["تحقق من المشروع", CircleDot]].map(([label, Icon]) => <button key={String(label)} onClick={() => label === "تخطيط تلقائي" ? (setShowCommand(false), handleAutoLayout("RIGHT")) : (setShowCommand(false), setShowProblems(true))} className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-right font-mono text-[11px] text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-200"><span className="grid size-6 place-items-center rounded bg-white/[0.06]"><Icon size={13} /></span>{String(label)}<span className="mr-auto text-[9px] text-slate-600">↵</span></button>)}</div><div className="border-t border-white/10 px-4 py-2 font-mono text-[9px] text-slate-600">Esc إغلاق · ↑↓ تنقل · Enter تشغيل</div></div></div>}
    {tabContextMenu && <div className="fixed inset-0 z-50" onMouseDown={() => setTabContextMenu(null)} onContextMenu={(event) => { event.preventDefault(); setTabContextMenu(null); }}><div className="context-menu absolute min-w-[190px] rounded-md border border-slate-700 bg-[#111923] p-1 shadow-2xl" style={{ left: tabContextMenu.x, top: tabContextMenu.y }} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="context-menu-item flex w-full items-center gap-2 rounded px-3 py-2 text-right text-xs text-slate-200 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40" onClick={closeAllTabs} disabled={!openPaths.length}><X size={13} />إغلاق جميع التبويبات</button></div></div>}
  </main>;
}

function EmptyWorkspaceState() {
  return <div className="flex h-full items-center justify-center bg-slate-50 p-8"><div className="rounded-2xl border border-dashed border-slate-300 bg-white px-10 py-12 text-center shadow-sm"><div className="text-sm font-semibold text-slate-700">لا توجد تبويبات مفتوحة</div><p className="mt-2 text-xs text-slate-500">اختر ملفًا من القائمة الجانبية لفتحه.</p></div></div>;
}

function EditorLaunchpad({ path, value, onOpen }: { path: string; value: string; onOpen: () => void }) {
  const isMarkdown = path.endsWith(".md");
  return <div className="flex h-full items-center justify-center bg-slate-50 p-8"><div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-pink-50 text-pink-600">{isMarkdown ? <FileText size={22} /> : <FileJson size={22} />}</div><h2 className="text-lg font-semibold text-slate-900">{isMarkdown ? "وثيقة المشروع" : "ملف النموذج"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">افتح المحرر في نافذة مستقلة لتعديل الملف مع المعاينة والحفظ.</p><div className="mx-auto mt-5 max-w-md rounded-lg bg-slate-50 p-3 text-right font-mono text-[10px] leading-5 text-slate-500" dir="ltr">{value.split("\n").slice(0, 5).join("\n")}</div><Button className="mt-6" variant="primary" onClick={onOpen}><Code2 size={15} />فتح المحرر</Button></div></div>;
}
