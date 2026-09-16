import {
  componentSchema,
  componentsDocumentSchema,
  diagramLayoutSchema,
  entitiesDocumentSchema,
  jobCardCatalogSchema,
  projectDocumentSchema,
  relationshipsDocumentSchema,
} from "./schemas";
import type { DiagramLayout, SoftwareModel, ValidationIssue } from "./types";

export function validateJsonFile(path: string, text: string): ValidationIssue[] {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    return [{ id: `${path}:invalid-json`, severity: "error", message: "Invalid JSON syntax", path }];
  }

  const schema = path.endsWith("project.json")
    ? projectDocumentSchema
    : path.endsWith("components.json")
      ? componentsDocumentSchema
      : path.endsWith("entities.json")
        ? entitiesDocumentSchema
      : path.endsWith("relationships.json")
        ? relationshipsDocumentSchema
        : path.endsWith("job-card-catalog.json")
          ? jobCardCatalogSchema
        : path.includes("/diagrams/")
            ? diagramLayoutSchema
            : null;
  if (!schema) return [];
  const result = schema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue, index) => ({
    id: `${path}:schema:${index}`,
    severity: "error" as const,
    message: issue.message,
    path: `${path}${issue.path.length ? `.${issue.path.join(".")}` : ""}`,
  }));
}

function duplicateIssues(ids: string[], path: string): ValidationIssue[] {
  const seen = new Set<string>();
  return ids.flatMap((id) => {
    if (seen.has(id)) return [{ id: `${path}:duplicate:${id}`, severity: "error" as const, message: `Duplicate ID: ${id}`, path }];
    seen.add(id);
    return [];
  });
}

export function validateModel(model: SoftwareModel, layouts: DiagramLayout[] = []): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...duplicateIssues(model.components.map((item) => item.id), ".software/components.json"),
    ...duplicateIssues(model.entities.map((item) => item.id), ".software/entities.json"),
    ...duplicateIssues(model.relationships.map((item) => item.id), ".software/relationships.json"),
  ];
  const knownIds = new Set([...model.components, ...model.entities].map((item) => item.id));
  model.relationships.forEach((relationship) => {
    if (!knownIds.has(relationship.source)) issues.push({ id: `${relationship.id}:source`, severity: "error", message: `Missing source reference: ${relationship.source}`, path: ".software/relationships.json" });
    if (!knownIds.has(relationship.target)) issues.push({ id: `${relationship.id}:target`, severity: "error", message: `Missing target reference: ${relationship.target}`, path: ".software/relationships.json" });
  });
  layouts.forEach((layout) => {
    layout.nodes.forEach((node) => {
      if (!knownIds.has(node.id)) issues.push({ id: `${layout.diagram.id}:node:${node.id}`, severity: "error", message: `Broken diagram reference: ${node.id}`, path: `.software/diagrams/${layout.diagram.id}.json` });
    });
    layout.edges.forEach((edge) => {
      if (!model.relationships.some((relationship) => relationship.id === edge.id)) issues.push({ id: `${layout.diagram.id}:edge:${edge.id}`, severity: "warning", message: `Diagram edge is not in the model: ${edge.id}`, path: `.software/diagrams/${layout.diagram.id}.json` });
    });
  });
  return issues;
}

export function validateComponentShape(value: unknown): boolean {
  return componentSchema.safeParse(value).success;
}
