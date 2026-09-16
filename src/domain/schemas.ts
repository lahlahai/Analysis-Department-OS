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

export const citizenServiceStageSchema = z.object({ order: z.number().int().positive(), name: z.string().min(1), owner: z.string().min(1) });
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
});
export const citizenServicesDocumentSchema = z.object({ version: z.string(), services: z.array(citizenServiceSchema) });

export const diagramLayoutSchema = z.object({
  version: z.string(),
  diagram: z.object({ id, name: z.string(), type: z.enum(["architecture", "erd", "flowchart", "workflow", "process", "sequence", "component"]) }),
  nodes: z.array(z.object({ id, position: z.object({ x: z.number(), y: z.number() }), width: z.number().optional(), height: z.number().optional(), collapsed: z.boolean().optional() })),
  edges: z.array(z.object({ id, source: id, target: id })),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
});

export type ParsedDocument =
  | z.infer<typeof projectDocumentSchema>
  | z.infer<typeof componentsDocumentSchema>
  | z.infer<typeof entitiesDocumentSchema>
  | z.infer<typeof relationshipsDocumentSchema>
  | z.infer<typeof jobCardCatalogSchema>
  | z.infer<typeof citizenServicesDocumentSchema>
  | z.infer<typeof diagramLayoutSchema>;
