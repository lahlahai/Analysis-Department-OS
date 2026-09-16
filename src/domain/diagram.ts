import type { DiagramLayout, ArchitectureEdge, ArchitectureNode, Component, SoftwareModel } from "./types";

function flowKind(component: Component, diagramType: DiagramLayout["diagram"]["type"]): NonNullable<ArchitectureNode["data"]["flowKind"]> {
  if (diagramType === "workflow") return component.type === "database" ? "service" : component.type === "external-system" ? "end" : "action";
  if (component.id === "web-app") return "start";
  if (component.id === "stripe-api") return "end";
  if (component.type === "api") return "decision";
  return component.type === "service" ? "service" : "action";
}

export function projectDiagram(model: SoftwareModel, layout: DiagramLayout): { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] } {
  const components = new Map(model.components.map((component) => [component.id, component]));
  const entities = new Map(model.entities.map((entity) => [entity.id, entity]));
  const layoutById = new Map(layout.nodes.map((node) => [node.id, node]));
  const nodes: ArchitectureNode[] = layout.nodes.flatMap((layoutNode): ArchitectureNode[] => {
    const component = components.get(layoutNode.id);
    if (component) {
      return [{
        id: component.id,
        type: "architecture",
        position: layoutNode.position,
        data: { label: component.name, type: component.type, description: component.description, metadata: component.metadata ?? {}, diagramType: layout.diagram.type, flowKind: flowKind(component, layout.diagram.type), lane: component.metadata?.owner ?? "التجارة", status: component.type === "external-system" ? "done" : "active" },
        width: layoutNode.width,
        height: layoutNode.height,
      }];
    }
    const entity = entities.get(layoutNode.id);
    if (!entity) return [];
    return [{
      id: entity.id,
      type: "architecture",
      position: layoutNode.position,
      data: { label: entity.name, type: "entity", description: entity.description, metadata: {}, fieldCount: entity.fields.length, fields: entity.fields, diagramType: layout.diagram.type },
      width: layoutNode.width,
      height: layoutNode.height,
    }];
  });
  const layoutEdges = layout.edges.length ? layout.edges : model.relationships.filter((relationship) => layoutById.has(relationship.source) && layoutById.has(relationship.target)).map((relationship) => ({ id: relationship.id, source: relationship.source, target: relationship.target }));
  const edges: ArchitectureEdge[] = layoutEdges.flatMap((layoutEdge) => {
    const relationship = model.relationships.find((item) => item.id === layoutEdge.id);
    if (!relationship || !layoutById.has(relationship.source) || !layoutById.has(relationship.target)) return [];
    return [{
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      type: "architecture-edge",
      data: { label: relationship.label, relationshipType: relationship.type },
      label: relationship.label,
      animated: relationship.type === "event",
      markerEnd: "arrowclosed",
    }];
  });
  return { nodes, edges };
}

export function serializeLayout(layout: DiagramLayout, nodes: ArchitectureNode[]): string {
  const next: DiagramLayout = {
    ...layout,
    nodes: layout.nodes.map((item) => {
      const node = nodes.find((candidate) => candidate.id === item.id);
      return node ? { ...item, position: node.position } : item;
    }),
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}
