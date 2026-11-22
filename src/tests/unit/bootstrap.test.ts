import { readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { laboratoryApp, lectureApp } from "../../data/demo-apps";
import { hiddenViewRequest, labPrompt, lecturePrompt } from "../../data/demo-prompts";
import { sampleApps } from "../../data/sample-apps";
import { applyLabRequirement, composeBlueprint, deserializeApprovedRecipe, diffApps, extractSampleDNA, inspectApp, interpretRequirements, matchReusableComponents, serializeApprovedRecipe, validateCoverage } from "../../lib/engine";
import { appDiffSchema, approvedRecipeSchema, blueprintSchema, generatedAppSchema, sampleAppSchema, sampleDnaSchema } from "../../types/canon-dna";

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
      for (const { from, to } of dna.project.dependencies) {
        const importer = dna.project.components.find(({ id }) => id === from)!;
        const imported = dna.project.components.find(({ id }) => id === to)!;
        expect(readFileSync(importer.sourceFile, "utf8")).toContain(`from "./${basename(imported.sourceFile, ".tsx")}"`);
      }
    }
    expect(extractSampleDNA("missing")).toBeUndefined();
  });

  it("grounds reuse and adaptation in the declared sample components", () => {
    const kinds = new Set(lectureApp.lineage.map(({ kind }) => kind));
    expect(kinds).toEqual(new Set(["adapt", "reuse", "new"]));
    const origins = new Set<string>();
    for (const entry of laboratoryApp.lineage) {
      if (entry.kind === "new") continue;
      origins.add(entry.sampleProjectId);
      const project = sampleApps.find(({ id }) => id === entry.sampleProjectId);
      expect(project?.components).toContainEqual(expect.objectContaining({
        id: entry.componentId,
        sourceFile: entry.sourceFile,
      }));
      expect(entry.dependencies).toEqual(project?.dependencies.filter(({ from }) => from === entry.componentId).map(({ to }) => to));
    }
    expect(origins).toEqual(new Set(["classroom", "remote-training"]));
    expect(lectureApp.lineage).toContainEqual(expect.objectContaining({ sampleProjectId: "remote-training", kind: "adapt" }));
    expect(matchReusableComponents({ kind: "laboratory" }, [])).toMatchObject([{ componentId: "workbench-view", kind: "new" }]);
  });

  it("rejects manifest edges that repeat or reference missing components", () => {
    const project = sampleApps[0];
    expect(sampleAppSchema.safeParse({ ...project, dependencies: [...project.dependencies, project.dependencies[0]] }).success).toBe(false);
    expect(sampleAppSchema.safeParse({ ...project, dependencies: [{ from: "classroom-preview", to: "missing" }] }).success).toBe(false);
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

  it("records field-level diffs and resets approval only for a new lab update", () => {
    const before = generatedAppSchema.parse({ ...lectureApp, approval: "approved" });
    const after = applyLabRequirement(before, "Install a second webcam pointed at the lab bench and leave the lecture intact.");
    const diff = diffApps(before, after);
    expect(diff).toContainEqual(expect.objectContaining({
      entity: "application", id: before.id, change: "changed", changedFields: ["assumptions", "approval"],
      before: expect.objectContaining({ approval: "approved" }),
      after: expect.objectContaining({ approval: "draft" }),
    }));
    expect(diff).toContainEqual({ entity: "scene", id: "laboratory-lab-overview", change: "added" });
    expect(diff).toContainEqual({ entity: "role", id: "student", change: "preserved" });
    expect(diffApps(after, before)).toContainEqual({ entity: "source", id: "workbench", change: "removed" });
    expect(after.lineage.find(({ componentId }) => componentId === "demonstration-view")?.appliesTo).toEqual({
      modeIds: ["lecture", "laboratory"],
      sourceIds: ["professor", "workbench"],
    });
    const approvedLab = generatedAppSchema.parse({ ...after, approval: "approved" });
    expect(applyLabRequirement(approvedLab, labPrompt)).toEqual(approvedLab);
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

  it.each([
    ["Create a remote class where learners see the instructor, chalkboard, and a shared slide deck.", "lecture"],
    ["Point another cam at the workstation for tomorrow’s practical.", "laboratory"],
    ["Install a second camera because the current camera cannot see the workbench.", "laboratory"],
    ["Use only the front camera to show the rear side of the work bench.", "coverage"],
  ])("interprets %s in rules-demo mode", (prompt, kind) => {
    expect(interpretRequirements(prompt)).toMatchObject({ ok: true, interpretationMode: "rules-demo", requirements: { kind } });
  });

  it("rejects unsupported topology and honors validated structured requirements", () => {
    expect(interpretRequirements("Use two physical cameras to show the teacher, whiteboard and slides.").ok).toBe(false);
    expect(interpretRequirements("Remove the classroom and add a camera for the lab bench.").ok).toBe(false);
    const structured = { kind: "lecture", title: "Physics 101", institution: "North University" } as const;
    expect(interpretRequirements("", structured)).toMatchObject({ ok: true, requirements: structured });
    expect(interpretRequirements(lecturePrompt, { ...structured, institution: "" }).ok).toBe(false);
    expect(() => applyLabRequirement(lectureApp, "Show the hidden side of the workbench with the same camera.")).toThrow();
  });

  it("preserves the configuration in the blueprint and requires approval for recipes", () => {
    const blueprint = blueprintSchema.parse(composeBlueprint(laboratoryApp));
    expect(blueprint.app).toEqual(laboratoryApp);
    expect(blueprint.sourceTopology).toEqual({
      cameras: [
        { cameraId: "classroom-camera", processedViewIds: ["professor", "whiteboard"] },
        { cameraId: "workbench-camera", processedViewIds: ["workbench"] },
      ],
      digitalSourceIds: ["slides"],
    });
    expect(blueprint.review).toMatchObject({ valid: true, reviewRequired: true, issues: expect.arrayContaining([
      expect.objectContaining({ code: "human-signoff" }),
      expect.objectContaining({ code: "unverified-amlos-mapping" }),
      expect.objectContaining({ code: "lineage-verification" }),
    ]) });
    expect(inspectApp({ ...lectureApp, sources: [] })).toMatchObject({
      valid: false, reviewRequired: true, issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-configuration" })]),
    });
    expect(blueprint.app.sdkMappings.map(({ layer }) => layer)).toEqual(["Camera", "Hub", "Edge"]);
    for (const mapping of blueprint.app.sdkMappings) {
      expect(mapping).toMatchObject({ status: "proposed", verified: false });
    }
    const recipe = {
      id: "university-lab-recipe", app: blueprint.app, approvedBy: "Demo reviewer", approvedAt: "2026-11-21T17:00:00Z",
    };
    expect(approvedRecipeSchema.safeParse(recipe).success).toBe(false);
    const approved = approvedRecipeSchema.parse({ ...recipe, app: { ...recipe.app, approval: "approved" } });
    expect(deserializeApprovedRecipe(serializeApprovedRecipe(approved))).toEqual(approved);
    expect(() => deserializeApprovedRecipe(JSON.stringify(recipe))).toThrow();
    expect(() => deserializeApprovedRecipe("invalid JSON")).toThrow();
  });
});
