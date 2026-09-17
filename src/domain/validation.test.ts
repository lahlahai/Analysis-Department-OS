import { describe, expect, it } from "vitest";
import { loadFixtureWorkspace } from "@/lib/fixture";
import { projectDiagram } from "@/domain/diagram";
import { validateJsonFile, validateModel } from "./validation";

describe("workspace validation", () => {
  it("accepts the bundled workspace", () => {
    const workspace = loadFixtureWorkspace();
    expect(validateModel(workspace.model, workspace.layouts)).toEqual([]);
    expect(workspace.jobCards).toHaveLength(100);
    expect(validateJsonFile(".software/job-card-catalog.json", workspace.files[".software/job-card-catalog.json"])).toEqual([]);
    expect(Object.keys(workspace.files).filter((path) => path.startsWith("قسم التنظيم والتخطيط العمراني/")).length).toBe(8);
  });

  it("projects model relationships when a diagram has no explicit edge list", () => {
    const workspace = loadFixtureWorkspace();
    const erd = workspace.layouts.find((layout) => layout.diagram.id === "erd");
    expect(erd).toBeDefined();
    expect(projectDiagram(workspace.model, erd!).edges.map((edge) => edge.id)).toEqual([
      "planning-study-uses-regulatory-plan",
      "transaction-concerns-real-estate",
      "real-estate-has-certificate",
      "expropriation-map-covers-real-estate",
      "subdivision-plan-covers-real-estate",
      "transaction-produces-expropriation-map",
      "transaction-produces-subdivision-plan",
      "committee-produces-decision",
    ]);
  });

  it("keeps links available in every enabled diagram mode", () => {
    const workspace = loadFixtureWorkspace();
    const enabledTypes = ["erd", "flowchart", "workflow", "process", "sequence"] as const;
    enabledTypes.forEach((type) => {
      const layout = workspace.layouts.find((item) => item.diagram.type === type);
      expect(layout).toBeDefined();
      expect(projectDiagram(workspace.model, layout!).edges.length).toBeGreaterThan(0);
    });
  });

  it("reports malformed JSON", () => {
    expect(validateJsonFile(".software/components.json", "{ nope")[0]?.message).toBe("Invalid JSON syntax");
  });
});
