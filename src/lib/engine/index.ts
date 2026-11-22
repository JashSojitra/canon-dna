import { hiddenViewPrompt, hiddenViewRequest, labPrompt, lecturePrompt, lectureRequirements } from "../../data/demo-prompts";
import { sampleApps } from "../../data/sample-apps";
import {
  blueprintSchema,
  coverageRequestSchema,
  generatedAppSchema,
  interpretationResultSchema,
  type AppDiff,
  type CanonDnaEngine,
  type GeneratedApp,
  type Lineage,
} from "../../types/canon-dna";

export const extractSampleDNA: CanonDnaEngine["extractSampleDNA"] = (projectId) => {
  const project = sampleApps.find(({ id }) => id === projectId);
  return project && { method: "manifest-backed", project: structuredClone(project) };
};

export const interpretRequirements: CanonDnaEngine["interpretRequirements"] = (text, structured) => {
  const normalized = text.trim().toLowerCase();
  const requirements = structured ?? (
    normalized === lecturePrompt.toLowerCase() ? lectureRequirements
      : normalized === labPrompt.toLowerCase() ? { kind: "laboratory" }
      : normalized === hiddenViewPrompt.toLowerCase() ? hiddenViewRequest
      : undefined
  );
  const parsed = interpretationResultSchema.safeParse({ ok: true, interpretationMode: "rules-demo", requirements });
  return parsed.success ? parsed.data : {
    ok: false,
    interpretationMode: "rules-demo",
    message: "Use a supplied demo prompt or provide valid structured requirements.",
  };
};

const workbenchLineage: Lineage = {
  componentId: "workbench-view",
  kind: "new",
  dependencies: [],
  reason: "The lab adds a camera and processed view for the workbench.",
  proposedAmlosLayers: ["Camera", "Hub"],
  verificationRequired: ["Confirm camera placement and workbench coverage."],
};

export const matchReusableComponents: CanonDnaEngine["matchReusableComponents"] = (requirements, library) => {
  if (requirements.kind === "laboratory") return [structuredClone(workbenchLineage)];
  if (requirements.kind !== "lecture") return [];

  const classroom = library.find(({ id }) => id === "classroom");
  if (!classroom) return [];

  return classroom.components.flatMap((component): Lineage[] => {
    const { id, sourceFile, proposedAmlosLayers } = component;
    if (id !== "source-selector" && id !== "classroom-preview") return [];
    return [{
      componentId: id,
      kind: id === "source-selector" ? "reuse" : "adapt",
      sampleProjectId: classroom.id,
      sourceFile,
      dependencies: classroom.dependencies.filter(({ from }) => from === id).map(({ to }) => to),
      reason: id === "source-selector"
        ? "The sample selector already supports choosing a view by label."
        : "The sample lecture preview provides the starting layout for the university configuration.",
      proposedAmlosLayers: [...proposedAmlosLayers],
      verificationRequired: ["Confirm how the browser UI would be hosted on AMLOS Edge."],
    }];
  });
};

export const buildLectureApp: CanonDnaEngine["buildLectureApp"] = (requirements, matches) => {
  const viewIds = ["professor", "whiteboard", "slides"];
  return generatedAppSchema.parse({
    id: "university-classroom",
    title: requirements.title,
    institution: requirements.institution,
    sources: [
      { id: "classroom-camera", label: "Classroom camera", kind: "physical-camera", simulated: true },
      { id: "professor", label: "Professor", kind: "processed-view", physicalCameraId: "classroom-camera", simulated: true },
      { id: "whiteboard", label: "Whiteboard", kind: "processed-view", physicalCameraId: "classroom-camera", simulated: true },
      { id: "slides", label: "Slides", kind: "digital-media", simulated: true },
    ],
    modes: {
      lecture: {
        label: "Lecture",
        scenes: [{ id: "lecture-overview", label: "Lecture overview", visibleSourceIds: viewIds }],
        studentSelectableIds: viewIds,
      },
    },
    roles: {
      professor: ["select-view", "change-layout", "fullscreen", "camera-ptz", "switch-mode"],
      student: ["select-view", "change-layout", "fullscreen"],
    },
    lineage: matches,
    assumptions: ["All media sources are simulated."],
    sdkMappings: [
      { layer: "Camera", proposedResponsibility: "Provide camera capture, image processing and professor camera control.", status: "proposed", verified: false },
      { layer: "Hub", proposedResponsibility: "Aggregate and distribute the processed views and digital media.", status: "proposed", verified: false },
      { layer: "Edge", proposedResponsibility: "Host the browser UI.", status: "proposed", verified: false },
    ],
    approval: "draft",
  });
};

export const applyLabRequirement: CanonDnaEngine["applyLabRequirement"] = (before, text) => {
  const interpretation = interpretRequirements(text);
  if (!interpretation.ok || interpretation.requirements.kind !== "laboratory") {
    throw new Error("Use the supplied laboratory demo prompt.");
  }

  const app = generatedAppSchema.parse(before);
  if (app.modes.laboratory) return app;

  const viewIds = [...app.modes.lecture.studentSelectableIds, "workbench"];
  return generatedAppSchema.parse({
    ...app,
    approval: "draft",
    sources: [
      ...app.sources,
      { id: "workbench-camera", label: "Workbench camera", kind: "physical-camera", simulated: true },
      { id: "workbench", label: "Workbench", kind: "processed-view", physicalCameraId: "workbench-camera", simulated: true },
    ],
    modes: {
      ...app.modes,
      laboratory: {
        label: "Laboratory",
        scenes: [{ id: "lab-overview", label: "Laboratory overview", visibleSourceIds: viewIds }],
        studentSelectableIds: viewIds,
      },
    },
    lineage: [...app.lineage, workbenchLineage],
    assumptions: [...app.assumptions, "The proposed Workbench camera has a clear line of sight."],
  });
};

type DiffEntity = AppDiff[number]["entity"];

function diffEntities(app: GeneratedApp) {
  const entries = new Map<string, { entity: DiffEntity; id: string; value: unknown }>();
  const add = (entity: DiffEntity, id: string, value: unknown) => {
    entries.set(`${entity}:${id}`, { entity, id, value });
  };

  const { sources, modes, roles, lineage, ...application } = app;
  add("application", app.id, application);
  sources.forEach((source) => add("source", source.id, source));
  for (const [id, mode] of Object.entries(modes)) {
    if (!mode) continue;
    add("mode", id, mode);
    mode.scenes.forEach((scene) => add("scene", `${id}-${scene.id}`, scene));
  }
  for (const [role, permissions] of Object.entries(roles)) add("role", role, permissions);
  lineage.forEach((entry) => add("lineage", entry.componentId, entry));
  return entries;
}

export const diffApps: CanonDnaEngine["diffApps"] = (before, after) => {
  const previous = diffEntities(generatedAppSchema.parse(before));
  const next = diffEntities(generatedAppSchema.parse(after));
  const diff: AppDiff = [];
  for (const [key, { entity, id, value }] of previous) {
    const updated = next.get(key);
    const change = !updated ? "removed"
      : JSON.stringify(value) === JSON.stringify(updated.value) ? "preserved"
      : "changed";
    diff.push({ entity, id, change });
  }
  for (const [key, { entity, id }] of next) {
    if (!previous.has(key)) diff.push({ entity, id, change: "added" });
  }
  return diff;
};

export const validateCoverage: CanonDnaEngine["validateCoverage"] = (request) => {
  const { hasLineOfSight, viewLabel } = coverageRequestSchema.parse(request);
  return hasLineOfSight
    ? { valid: true, reviewRequired: false, issues: [] }
    : {
        valid: false,
        reviewRequired: true,
        issues: [{
          code: "no-line-of-sight",
          message: `The camera has no line of sight to ${viewLabel}.`,
          suggestion: "Have an engineer verify a second camera position with a clear line of sight.",
        }],
      };
};

export const composeBlueprint: CanonDnaEngine["composeBlueprint"] = (app) =>
  blueprintSchema.parse({
    app,
    signoffChecklist: [
      "Verify camera placement and coverage.",
      "Verify proposed Camera, Hub and Edge mappings with Canon engineering.",
      "Review role permissions and mode behavior before approving the design.",
    ],
  });
