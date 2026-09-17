import { describe, expect, it } from "vitest";
import { loadFixtureWorkspace } from "@/lib/fixture";
import { validateJsonFile, validateModel } from "./validation";

describe("workspace validation", () => {
  it("accepts the bundled workspace", () => {
    const workspace = loadFixtureWorkspace();
    expect(validateModel(workspace.model)).toEqual([]);
    expect(workspace.jobCards).toHaveLength(100);
    expect(validateJsonFile(".software/job-card-catalog.json", workspace.files[".software/job-card-catalog.json"])).toEqual([]);
    expect(Object.keys(workspace.files).filter((path) => path.startsWith("قسم التنظيم والتخطيط العمراني/")).length).toBe(8);
  });

  it("reports malformed JSON", () => {
    expect(validateJsonFile(".software/components.json", "{ nope")[0]?.message).toBe("Invalid JSON syntax");
  });
});
