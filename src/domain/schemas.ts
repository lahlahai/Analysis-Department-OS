import { z } from "zod";
import { componentTypes } from "./types";

const id = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "IDs must be kebab-case");

export const projectDocumentSchema = z.object({
  version: z.string(),
  project: z.object({
    name: z.string().min(1),
    description: z.string(),
    repository: z.string(),
  }),
});

export const componentSchema = z.object({
  id,
  name: z.string().min(1),
  type: z.enum(componentTypes),
  description: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const componentsDocumentSchema = z.object({ version: z.string(), components: z.array(componentSchema) });

export const entitySchema = z.object({
  id,
  name: z.string().min(1),
  description: z.string(),
  fields: z.array(z.object({ name: z.string().min(1), type: z.string().min(1), required: z.boolean() })),
});

export const entitiesDocumentSchema = z.object({ version: z.string(), entities: z.array(entitySchema) });

export const relationshipSchema = z.object({
  id,
  source: id,
  target: id,
  type: z.enum(["dependency", "data-flow", "relationship", "event", "calls", "contains", "uses", "extends", "implements"]),
  label: z.string(),
  direction: z.enum(["forward", "both", "none"]),
});

export const relationshipsDocumentSchema = z.object({ version: z.string(), relationships: z.array(relationshipSchema) });

export const jobCardDefinitionSchema = z.object({ id: z.string().min(1), domain: z.string().min(1), table: z.string().min(1), description: z.string().min(1) });
export const jobCardCatalogSchema = z.object({ version: z.string(), cards: z.array(jobCardDefinitionSchema) });

export const serviceFieldDefinitionSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1),
  type: z.enum(["string", "number", "phone", "file", "select", "date", "coordinates", "boolean"]),
  required: z.boolean(),
  description: z.string(),
  validationRule: z.string().optional(),
  example: z.string().optional(),
});

export const serviceValidationConstraintSchema = z.object({
  rule: z.string().min(1),
  rationale: z.string().min(1),
  severity: z.enum(["error", "warning"]),
});

export const serviceAttachmentSpecSchema = z.object({
  name: z.string().min(1),
  format: z.string().min(1),
  maxSize: z.string().min(1),
  isRequired: z.boolean(),
  purpose: z.string().min(1),
  issuingAuthority: z.string().min(1),
});

export const serviceFaqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(["إداري وتشغيلي", "تقني ونموذج البيانات", "مالي وقانوني", "إجراءات واعتمادات"]),
});

export const serviceEdgeCaseSchema = z.object({
  condition: z.string().min(1),
  action: z.string().min(1),
  returnCode: z.string().optional(),
});

export const citizenServiceStageSchema = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  owner: z.string().min(1),
});

export const serviceSpecificationSchema = z.object({
  serviceId: z.string().min(1),
  serviceCode: z.string().min(1),
  legalBasis: z.string().min(1),
  slaDays: z.number().int().nonnegative(),
  slaDescription: z.string().min(1),
  businessGoal: z.string().min(1),
  targetBeneficiary: z.string().min(1),
  digitalMaturityLevel: z.enum(["أتمتة جزئية", "مكتمل رقمياً", "إجراء هجين ورقي/رقمي"]),
  deliverableType: z.string().min(1),
  officialCertification: z.string().min(1),
  fieldsDictionary: z.array(serviceFieldDefinitionSchema),
  validationConstraints: z.array(serviceValidationConstraintSchema),
  attachmentsSpecification: z.array(serviceAttachmentSpecSchema),
  edgeCasesAndReturns: z.array(serviceEdgeCaseSchema),
  apiPayloadExample: z.string().optional(),
  faqs: z.array(serviceFaqItemSchema),
});

export const citizenServiceSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["service", "inquiry"]),
  domain: z.string().min(1),
  unit: z.string().min(1),
  name: z.string().min(1),
  audience: z.enum(["كلاهما", "مواطن", "موظف"]),
  description: z.string().min(1),
  usage: z.string().min(1),
  directorate: z.string().min(1),
  department: z.string().min(1),
  availability: z.string().min(1),
  priority: z.enum(["رئيسي", "ثانوي"]),
  channel: z.enum(["ورقي", "إلكتروني", "كلاهما"]),
  fee: z.object({ amount: z.number().nonnegative(), currency: z.string().min(1), label: z.string().min(1) }).optional(),
  requiredFields: z.array(z.string().min(1)),
  attachments: z.array(z.string().min(1)),
  response: z.string().min(1),
  stages: z.array(citizenServiceStageSchema),
  returnReasons: z.array(z.string().min(1)).optional(),
  authorityNotes: z.array(z.string().min(1)).optional(),
  specification: serviceSpecificationSchema.optional(),
});
export const citizenServicesDocumentSchema = z.object({ version: z.string(), services: z.array(citizenServiceSchema) });

export type ParsedDocument =
  | z.infer<typeof projectDocumentSchema>
  | z.infer<typeof componentsDocumentSchema>
  | z.infer<typeof entitiesDocumentSchema>
  | z.infer<typeof relationshipsDocumentSchema>
  | z.infer<typeof jobCardCatalogSchema>
  | z.infer<typeof citizenServicesDocumentSchema>
