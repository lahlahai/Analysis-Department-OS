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

export interface ServiceFieldDefinition {
  name: string;
  key: string;
  type: "string" | "number" | "phone" | "file" | "select" | "date" | "coordinates" | "boolean";
  required: boolean;
  description: string;
  validationRule?: string;
  example?: string;
}

export interface ServiceValidationConstraint {
  rule: string;
  rationale: string;
  severity: "error" | "warning";
}

export interface ServiceAttachmentSpec {
  name: string;
  format: string;
  maxSize: string;
  isRequired: boolean;
  purpose: string;
  issuingAuthority: string;
}

export interface ServiceFaqItem {
  id: string;
  question: string;
  answer: string;
  category: "إداري وتشغيلي" | "تقني ونموذج البيانات" | "مالي وقانوني" | "إجراءات واعتمادات";
}

export interface ServiceEdgeCase {
  condition: string;
  action: string;
  returnCode?: string;
}

export interface ServiceUserStory {
  format: "markdown";
  content: string;
}

export interface ServicePermissionMatrix {
  format: "markdown";
  content: string;
}

export interface ServiceSpecification {
  serviceId: string;
  serviceCode: string;
  legalBasis: string;
  slaDays: number;
  slaDescription: string;
  businessGoal: string;
  targetBeneficiary: string;
  digitalMaturityLevel: "أتمتة جزئية" | "مكتمل رقمياً" | "إجراء هجين ورقي/رقمي";
  deliverableType: string;
  officialCertification: string;
  fieldsDictionary: ServiceFieldDefinition[];
  validationConstraints: ServiceValidationConstraint[];
  attachmentsSpecification: ServiceAttachmentSpec[];
  edgeCasesAndReturns: ServiceEdgeCase[];
  userStory?: ServiceUserStory;
  permissionMatrix?: ServicePermissionMatrix;
  actionPermissionMatrix?: ServicePermissionMatrix;
  apiPayloadExample?: string;
  faqs: ServiceFaqItem[];
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
  specification?: ServiceSpecification;
}

export interface ValidationIssue {
  id: string;
  severity: "error" | "warning";
  message: string;
  path: string;
  line?: number;
}
