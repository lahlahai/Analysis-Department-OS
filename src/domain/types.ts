import type { Edge, Node, XYPosition } from "@xyflow/react";

export const componentTypes = [
  "application",
  "service",
  "database",
  "queue",
  "event",
  "api",
  "actor",
  "external-system",
  "component",
] as const;

export type ComponentType = (typeof componentTypes)[number];
export type RelationshipType =
  | "dependency"
  | "data-flow"
  | "relationship"
  | "event"
  | "calls"
  | "contains"
  | "uses"
  | "extends"
  | "implements";

export type DiagramType = "architecture" | "erd" | "flowchart" | "workflow" | "process" | "sequence" | "component";

export interface Project {
  name: string;
  description: string;
  version: string;
  repository: string;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  metadata?: Record<string, string>;
}

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  fields: EntityField[];
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  direction: "forward" | "both" | "none";
}

export interface DiagramNodeLayout {
  id: string;
  position: XYPosition;
  width?: number;
  height?: number;
  collapsed?: boolean;
}

export interface DiagramEdgeLayout {
  id: string;
  source: string;
  target: string;
}

export interface DiagramLayout {
  version: string;
  diagram: { id: string; name: string; type: DiagramType };
  nodes: DiagramNodeLayout[];
  edges: DiagramEdgeLayout[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface SoftwareModel {
  project: Project;
  components: Component[];
  entities: Entity[];
  relationships: Relationship[];
}

export interface JobCardDefinition {
  id: string;
  domain: string;
  table: string;
  description: string;
}

export type CitizenServiceKind = "service" | "inquiry";

export interface CitizenServiceStage {
  order: number;
  name: string;
  owner: string;
}

export interface CitizenServiceDefinition {
  id: string;
  kind: CitizenServiceKind;
  domain: string;
  unit: string;
  name: string;
  audience: "كلاهما" | "مواطن" | "موظف";
  description: string;
  usage: string;
  directorate: string;
  department: string;
  availability: string;
  priority: "رئيسي" | "ثانوي";
  channel: "ورقي" | "إلكتروني" | "كلاهما";
  fee?: { amount: number; currency: string; label: string };
  requiredFields: string[];
  attachments: string[];
  response: string;
  stages: CitizenServiceStage[];
  returnReasons?: string[];
  authorityNotes?: string[];
}

export interface ArchitectureNodeData extends Record<string, unknown> {
  label: string;
  type: ComponentType | "entity";
  description: string;
  metadata: Record<string, string>;
  fieldCount?: number;
  fields?: EntityField[];
  diagramType?: DiagramType;
  flowKind?: "start" | "end" | "action" | "decision" | "service";
  lane?: string;
  status?: "ready" | "active" | "blocked" | "done";
}

export type ArchitectureNode = Node<ArchitectureNodeData, "architecture">;
export type ArchitectureEdge = Edge<{ label: string; relationshipType: RelationshipType }, "architecture-edge">;

export interface ValidationIssue {
  id: string;
  severity: "error" | "warning";
  message: string;
  path: string;
  line?: number;
}
