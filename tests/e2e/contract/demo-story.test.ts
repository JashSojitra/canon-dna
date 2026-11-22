/**
 * QA demo-story contract tests (owner: Claude Code / qa/demo-audit).
 *
 * These run under the repo's existing Vitest (`npm test` picks up any *.test.ts).
 * They exercise ONLY public engine exports, in the exact order the Sunday demo uses them,
 * and assert the demo-critical invariants from docs/contracts.md and
 * CANON_DNA_EXECUTION_PLAN.md §10. They don't test UI. Browser specs live in ../browser.
 *
 * Relative imports on purpose: there is no vitest alias config in the bootstrap.
 */
import { readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { hiddenViewPrompt, labPrompt, lecturePrompt } from "../../../src/data/demo-prompts";
import { sampleApps } from "../../../src/data/sample-apps";
import {
  applyLabRequirement,
  buildLectureApp,
  composeBlueprint,
  diffApps,
  extractSampleDNA,
  interpretRequirements,
  matchReusableComponents,
  validateCoverage,
} from "../../../src/lib/engine";
import {
  approvedRecipeSchema,
  generatedAppSchema,
  type GeneratedApp,
  type Mode,
} from "../../../src/types/canon-dna";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

/** Runs the demo through the engine exactly as the studio is expected to (not via fixtures). */
function runDemoFlow() {
  const interpretation = interpretRequirements(lecturePrompt);
  if (!interpretation.ok || interpretation.requirements.kind !== "lecture") {
    throw new Error("Lecture prompt must interpret to lecture requirements");
  }
  const matches = matchReusableComponents(interpretation.requirements, sampleApps);
  const before = deepFreeze(buildLectureApp(interpretation.requirements, matches));
  const beforeSnapshot = structuredClone(before);
  const after = applyLabRequirement(before, labPrompt);
  return { interpretation, matches, before, beforeSnapshot, after };
}

const sourceById = (app: GeneratedApp, id: string) => app.sources.find((source) => source.id === id);
const selectable = (app: GeneratedApp, mode: Mode | undefined) =>
  (mode?.studentSelectableIds ?? []).map((id) => sourceById(app, id));

describe("QA · Library and extraction (stages A–B)", () => {
  it("lists exactly the two team-created samples with manifest-backed DNA", () => {
    expect(sampleApps.map(({ id, origin }) => ({ id, origin }))).toEqual([
      { id: "classroom", origin: "team-created" },
      { id: "remote-training", origin: "team-created" },
    ]);
    for (const { id } of sampleApps) {
      expect(extractSampleDNA(id)?.method).toBe("manifest-backed");
    }
  });

  it("every manifest path the inspector can show exists on disk, and every edge resolves", () => {
    for (const { id } of sampleApps) {
      const dna = extractSampleDNA(id);
      if (!dna) throw new Error(`missing DNA for ${id}`);
      const ids = new Set(dna.project.components.map((component) => component.id));
      for (const component of dna.project.components) {
        expect(statSync(resolve(component.sourceFile)).isFile(), component.sourceFile).toBe(true);
      }
      expect(statSync(resolve(dna.project.entryFile)).isFile()).toBe(true);
      for (const edge of dna.project.dependencies) {
        expect(ids.has(edge.from) && ids.has(edge.to), `${edge.from}->${edge.to}`).toBe(true);
      }
    }
  });

  it("every manifest dependency edge is backed by a real import in the sample source", () => {
    for (const { id } of sampleApps) {
      const dna = extractSampleDNA(id);
      if (!dna) throw new Error(`missing DNA for ${id}`);
      const fileOf = new Map(dna.project.components.map((c) => [c.id, c.sourceFile]));
      for (const { from, to } of dna.project.dependencies) {
        const fromSource = readFileSync(resolve(fileOf.get(from) ?? ""), "utf8");
        const toModule = basename(fileOf.get(to) ?? "", ".tsx");
        expect(fromSource, `${from} should import ${toModule}`).toMatch(new RegExp(`from\\s+["']\\./${toModule}["']`));
      }
    }
  });

  it("extraction returns a defensive copy (UI mutation cannot corrupt the library)", () => {
    const dna = extractSampleDNA("classroom");
    if (!dna) throw new Error("missing classroom");
    dna.project.components.pop();
    expect(extractSampleDNA("classroom")?.project.components).toHaveLength(
      sampleApps.find(({ id }) => id === "classroom")?.components.length ?? -1,
    );
  });
});

describe("QA · Architect (stage C)", () => {
  it("discloses rules-demo mode and tolerates case and surrounding whitespace", () => {
    const result = interpretRequirements(`  \n${lecturePrompt.toUpperCase()}\t `);
    expect(result).toMatchObject({ ok: true, interpretationMode: "rules-demo", requirements: { kind: "lecture" } });
  });

  it("returns a truthful failure (not a fake design) for unsupported text", () => {
    const result = interpretRequirements("Build a hospital operating theatre viewer.");
    expect(result.ok).toBe(false);
    expect(result.interpretationMode).toBe("rules-demo");
  });

  it("accepts the structured form path documented in contracts.md", () => {
    const result = interpretRequirements("", { kind: "lecture", institution: "Example University", title: "University Classroom" });
    expect(result).toMatchObject({ ok: true, requirements: { kind: "lecture", institution: "Example University" } });
  });

  it("produces REUSE and ADAPT decisions grounded in the classroom sample, each with a reason", () => {
    const { matches } = runDemoFlow();
    const classroom = sampleApps.find(({ id }) => id === "classroom");
    expect(matches.map(({ componentId, kind }) => ({ componentId, kind }))).toEqual(
      expect.arrayContaining([
        { componentId: "source-selector", kind: "reuse" },
        { componentId: "classroom-preview", kind: "adapt" },
      ]),
    );
    for (const entry of matches) {
      expect(entry.reason.length).toBeGreaterThan(10);
      if (entry.kind === "new") throw new Error("lecture should not need NEW components");
      expect(entry.sampleProjectId).toBe("classroom");
      expect(classroom?.components.some((c) => c.id === entry.componentId && c.sourceFile === entry.sourceFile)).toBe(true);
    }
  });
});

describe("QA · Three-view preview (stage D, lecture)", () => {
  it("has 3 selectable views: two processed views from ONE camera plus digital slides", () => {
    const { before } = runDemoFlow();
    const views = selectable(before, before.modes.lecture);
    expect(views.map((view) => view?.id)).toEqual(["professor", "whiteboard", "slides"]);
    expect(before.sources.filter(({ kind }) => kind === "physical-camera")).toHaveLength(1);
    const cameraIds = new Set(views.filter((v) => v?.kind === "processed-view").map((v) => v?.kind === "processed-view" && v.physicalCameraId));
    expect([...cameraIds]).toEqual(["classroom-camera"]);
    expect(sourceById(before, "slides")?.kind).toBe("digital-media");
  });

  it("never makes a physical camera directly selectable, and every source is simulated", () => {
    const { before, after } = runDemoFlow();
    for (const app of [before, after]) {
      for (const mode of [app.modes.lecture, app.modes.laboratory]) {
        for (const view of selectable(app, mode)) {
          expect(view).toBeDefined();
          expect(view?.kind).not.toBe("physical-camera");
        }
      }
      expect(app.sources.every(({ simulated }) => simulated === true)).toBe(true);
    }
  });

  it("students can never hold camera-ptz or switch-mode, before or after the lab change", () => {
    const { before, after } = runDemoFlow();
    for (const app of [before, after]) {
      expect(app.roles.student).not.toContain("camera-ptz");
      expect(app.roles.student).not.toContain("switch-mode");
      expect(app.roles.professor).toContain("camera-ptz");
    }
  });
});

describe("QA · Laboratory update, preservation and diff (stage D, lab)", () => {
  it("produces a NEW validated object and does not mutate the frozen before snapshot", () => {
    const { before, beforeSnapshot, after } = runDemoFlow();
    expect(after).not.toBe(before);
    expect(before).toEqual(beforeSnapshot);
    expect(before.modes.laboratory).toBeUndefined();
    expect(generatedAppSchema.safeParse(after).success).toBe(true);
  });

  it("adds exactly one physical camera and a fourth selectable Workbench view", () => {
    const { before, after } = runDemoFlow();
    const cams = (app: GeneratedApp) => app.sources.filter(({ kind }) => kind === "physical-camera").map(({ id }) => id);
    expect(cams(before)).toEqual(["classroom-camera"]);
    expect(cams(after)).toEqual(["classroom-camera", "workbench-camera"]);
    expect(selectable(after, after.modes.laboratory).map((v) => v?.id)).toEqual(["professor", "whiteboard", "slides", "workbench"]);
    expect(sourceById(after, "workbench")).toMatchObject({ kind: "processed-view", physicalCameraId: "workbench-camera" });
  });

  it("keeps Lecture mode exactly as before and returns approval to draft", () => {
    const { before, after } = runDemoFlow();
    expect(after.modes.lecture).toEqual(before.modes.lecture);
    expect(selectable(after, after.modes.lecture).map((v) => v?.id)).toEqual(["professor", "whiteboard", "slides"]);
    expect(after.approval).toBe("draft");
  });

  it("is idempotent when the lab change is applied twice (double-click safety)", () => {
    const { after } = runDemoFlow();
    const twice = applyLabRequirement(after, labPrompt);
    expect(twice).toEqual(after);
    expect(twice.sources.filter(({ id }) => id === "workbench")).toHaveLength(1);
  });

  it("throws on unsupported change text, so the UI MUST catch it", () => {
    const { before } = runDemoFlow();
    expect(() => applyLabRequirement(before, "Add a drone camera.")).toThrow();
  });

  it("computes the Before/After diff from the two config objects", () => {
    const { before, after } = runDemoFlow();
    const diff = diffApps(before, after);
    const by = (change: string) => diff.filter((entry) => entry.change === change).map(({ entity, id }) => `${entity}:${id}`).sort();
    expect(by("added")).toEqual([
      "lineage:workbench-view",
      "mode:laboratory",
      "scene:laboratory-lab-overview",
      "source:workbench",
      "source:workbench-camera",
    ]);
    expect(by("preserved")).toEqual(expect.arrayContaining([
      "mode:lecture", "scene:lecture-lecture-overview", "role:professor", "role:student",
      "source:classroom-camera", "source:professor", "source:whiteboard", "source:slides",
    ]));
    expect(by("removed")).toEqual([]);
    expect(diffApps(after, after).every(({ change }) => change === "preserved")).toBe(true);
  });
});

describe("QA · DNA X-Ray (stage D, provenance)", () => {
  it("lab app lineage contains REUSE, ADAPT and NEW, and REUSE/ADAPT point to real files", () => {
    const { after } = runDemoFlow();
    expect(new Set(after.lineage.map(({ kind }) => kind))).toEqual(new Set(["reuse", "adapt", "new"]));
    for (const entry of after.lineage) {
      expect(entry.reason.trim()).not.toBe("");
      if (entry.kind === "new") {
        expect(entry.sourceFile).toBeUndefined();
        expect(entry.verificationRequired.length).toBeGreaterThan(0);
      } else {
        expect(statSync(resolve(entry.sourceFile)).isFile()).toBe(true);
      }
    }
  });

  it("hidden-view request raises a review-required no-line-of-sight issue", () => {
    const hidden = interpretRequirements(hiddenViewPrompt);
    if (!hidden.ok || hidden.requirements.kind !== "coverage") throw new Error("expected coverage request");
    expect(validateCoverage(hidden.requirements)).toMatchObject({
      valid: false, reviewRequired: true, issues: [{ code: "no-line-of-sight" }],
    });
  });
});

describe("QA · Blueprint, approval and persistence (stage E)", () => {
  it("blueprint is built from the same config the preview uses, and mappings stay proposed/unverified", () => {
    const { after } = runDemoFlow();
    const blueprint = composeBlueprint(after);
    expect(blueprint.app).toEqual(after);
    expect(blueprint.app.sdkMappings.map(({ layer }) => layer).sort()).toEqual(["Camera", "Edge", "Hub"]);
    for (const mapping of blueprint.app.sdkMappings) {
      expect(mapping).toMatchObject({ status: "proposed", verified: false });
    }
    expect(blueprint.signoffChecklist.length).toBeGreaterThan(0);
  });

  it("rejects a recipe for a draft app (human approval gate)", () => {
    const { after } = runDemoFlow();
    expect(approvedRecipeSchema.safeParse({
      id: "university-lab-recipe", app: after, approvedBy: "QA reviewer", approvedAt: new Date().toISOString(),
    }).success).toBe(false);
  });

  it("an approved recipe survives a JSON storage round trip (simulated reload)", () => {
    const { after } = runDemoFlow();
    const fakeStorage = new Map<string, string>();
    const recipe = approvedRecipeSchema.parse({
      id: "university-lab-recipe",
      app: { ...after, approval: "approved" },
      approvedBy: "QA reviewer",
      approvedAt: new Date().toISOString(),
    });
    fakeStorage.set("qa-recipe", JSON.stringify(recipe));
    const reloaded = approvedRecipeSchema.parse(JSON.parse(fakeStorage.get("qa-recipe") ?? "null"));
    expect(reloaded).toEqual(recipe);
    expect(after.approval).toBe("draft");
  });

  it("corrupt persisted data is rejected by the schema instead of crashing the library", () => {
    expect(approvedRecipeSchema.safeParse({}).success).toBe(false);
    expect(approvedRecipeSchema.safeParse(JSON.parse('{"id":"x","app":{"approval":"approved"}}')).success).toBe(false);
  });
});
