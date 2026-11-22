import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { laboratoryApp, lectureApp } from "../../data/demo-apps";
import { hiddenViewRequest, labPrompt, lecturePrompt } from "../../data/demo-prompts";
import { sampleApps } from "../../data/sample-apps";
import { applyLabRequirement, composeBlueprint, diffApps, extractSampleDNA, interpretRequirements, validateCoverage } from "../../lib/engine";
import { appDiffSchema, approvedRecipeSchema, blueprintSchema, generatedAppSchema, sampleDnaSchema } from "../../types/canon-dna";

describe("sample DNA", () => {
  it("extracts both team-created samples from manifests pointing to real files", () => {
    expect(sampleApps.map(({ id }) => id)).toEqual(["classroom", "remote-training"]);
    for (const sample of sampleApps) {
      const dna = sampleDnaSchema.parse(extractSampleDNA(sample.id));
      expect(dna.project).toEqual(sample);
      expect(dna.project.origin).toBe("team-created");
      for (const { sourceFile } of dna.project.components) {
        expect(statSync(resolve(sourceFile)).isFile()).toBe(true);
        expect(sourceFile).toContain(`/sample-apps/${sample.id}/`);
      }
    }
    expect(extractSampleDNA("missing")).toBeUndefined();
  });

  it("grounds reuse and adaptation in the declared sample components", () => {
    const kinds = lectureApp.lineage.map(({ kind }) => kind);
    expect(kinds).toEqual(["adapt", "reuse"]);
    for (const entry of lectureApp.lineage) {
      if (entry.kind === "new") throw new Error("Unexpected new lecture component");
      const project = sampleApps.find(({ id }) => id === entry.sampleProjectId);
      expect(project?.components).toContainEqual(expect.objectContaining({
        id: entry.componentId,
        sourceFile: entry.sourceFile,
      }));
      expect(entry.dependencies).toEqual(project?.dependencies.filter(({ from }) => from === entry.componentId).map(({ to }) => to));
    }
  });
});

describe("university fixture", () => {
  it("has three selectable views backed by one camera and digital slides", () => {
    expect(lectureApp.sources.filter(({ kind }) => kind === "physical-camera").map(({ id }) => id)).toEqual(["classroom-camera"]);
    expect(lectureApp.sources.filter((source) => source.kind === "processed-view")).toMatchObject([
      { id: "professor", physicalCameraId: "classroom-camera" },
      { id: "whiteboard", physicalCameraId: "classroom-camera" },
    ]);
    expect(lectureApp.sources.find(({ id }) => id === "slides")?.kind).toBe("digital-media");
    expect(lectureApp.modes.lecture.studentSelectableIds).toEqual(["professor", "whiteboard", "slides"]);
    expect(lectureApp.roles.professor).toContain("camera-ptz");
    expect(lectureApp.roles.student).toEqual(["select-view", "change-layout", "fullscreen"]);
  });

  it("adds one camera and a fourth view while preserving Lecture and permissions", () => {
    const before = structuredClone(lectureApp);
    const after = applyLabRequirement(before, labPrompt);
    expect(after).toEqual(laboratoryApp);
    expect(after).not.toBe(before);
    expect(before).toEqual(lectureApp);
    expect(before.modes.laboratory).toBeUndefined();
    expect(after.modes.lecture).toEqual(before.modes.lecture);
    expect(after.roles).toEqual(before.roles);
    expect(after.sources.filter(({ kind }) => kind === "physical-camera")).toHaveLength(2);
    expect(after.sources.find(({ id }) => id === "workbench")).toMatchObject({ kind: "processed-view", physicalCameraId: "workbench-camera" });
    expect(after.modes.laboratory?.studentSelectableIds).toEqual(["professor", "whiteboard", "slides", "workbench"]);
    expect(applyLabRequirement(after, labPrompt)).toEqual(after);
    expect(appDiffSchema.parse(diffApps(before, after))).toEqual(expect.arrayContaining([
      { entity: "source", id: "workbench-camera", change: "added" },
      { entity: "source", id: "workbench", change: "added" },
      { entity: "mode", id: "lecture", change: "preserved" },
      { entity: "mode", id: "laboratory", change: "added" },
    ]));
  });

  it("rejects invalid camera references, physical camera selections and student PTZ", () => {
    expect(generatedAppSchema.safeParse({
      ...lectureApp, sources: lectureApp.sources.filter(({ id }) => id !== "classroom-camera"),
    }).success).toBe(false);
    expect(generatedAppSchema.safeParse({
      ...lectureApp,
      modes: { lecture: { ...lectureApp.modes.lecture, studentSelectableIds: ["classroom-camera"] } },
    }).success).toBe(false);
    expect(generatedAppSchema.safeParse({
      ...lectureApp, roles: { ...lectureApp.roles, student: ["camera-ptz"] },
    }).success).toBe(false);
  });
});

describe("interpretation and review", () => {
  it("discloses demo rules and reports unsupported input", () => {
    expect(interpretRequirements(lecturePrompt)).toMatchObject({ ok: true, interpretationMode: "rules-demo", requirements: { kind: "lecture" } });
    expect(interpretRequirements("Build something else.")).toMatchObject({ ok: false, interpretationMode: "rules-demo" });
    expect(validateCoverage(hiddenViewRequest)).toMatchObject({
      valid: false, reviewRequired: true, issues: [{ code: "no-line-of-sight" }],
    });
  });

  it("preserves the configuration in the blueprint and requires approval for recipes", () => {
    const blueprint = blueprintSchema.parse(composeBlueprint(laboratoryApp));
    expect(blueprint.app).toEqual(laboratoryApp);
    expect(blueprint.app.sdkMappings.map(({ layer }) => layer)).toEqual(["Camera", "Hub", "Edge"]);
    for (const mapping of blueprint.app.sdkMappings) {
      expect(mapping).toMatchObject({ status: "proposed", verified: false });
    }
    const recipe = {
      id: "university-lab-recipe", app: blueprint.app, approvedBy: "Demo reviewer", approvedAt: "2026-11-21T17:00:00Z",
    };
    expect(approvedRecipeSchema.safeParse(recipe).success).toBe(false);
    expect(approvedRecipeSchema.safeParse({ ...recipe, app: { ...recipe.app, approval: "approved" } }).success).toBe(true);
  });
});
