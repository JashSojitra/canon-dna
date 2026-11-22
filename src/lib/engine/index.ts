import { sampleApps } from "../../data/sample-apps";
import {
  appDiffSchema,
  blueprintSchema,
  coverageRequestSchema,
  generatedAppSchema,
  sampleDnaSchema,
  approvedRecipeSchema,
  type ApprovedRecipe,
  type AppDiff,
  type CanonDnaEngine,
  type GeneratedApp,
  type ValidationResult,
} from "../../types/canon-dna";

import { interpretRequirements } from "./requirements";
import { matchReusableComponents } from "./matching";

export { interpretRequirements, matchReusableComponents };

export const extractSampleDNA: CanonDnaEngine["extractSampleDNA"] = (projectId) => {
  const project = sampleApps.find(({ id }) => id === projectId);
  return project && sampleDnaSchema.parse({ method: "manifest-backed", project });
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
    assumptions: [
      "All media sources are simulated.",
      "The classroom camera position can frame both Professor and Whiteboard.",
      "Slides enter the design as an independent digital media source.",
    ],
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
    throw new Error("Describe adding a camera for the laboratory Workbench.");
  }

  const app = generatedAppSchema.parse(before);
  if (app.modes.laboratory) return app;

  if (app.sources.some(({ id }) => id === "workbench" || id === "workbench-camera")) {
    throw new Error("The existing sources already use a reserved Workbench ID.");
  }

  if (app.lineage.some(({ componentId }) => componentId === "workbench-view")) {
    throw new Error("The existing lineage already uses the reserved Workbench component ID.");
  }

  const labMatches = matchReusableComponents(interpretation.requirements, sampleApps);
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
    lineage: [
      ...app.lineage.map((entry) => {
        if (!entry.appliesTo) return entry;
        const labMatch = labMatches.find((match) =>
          match.componentId === entry.componentId && match.kind !== "new" && entry.kind !== "new"
          && match.sampleProjectId === entry.sampleProjectId && match.sourceFile === entry.sourceFile,
        );
        if (labMatch?.appliesTo) {
          return {
            ...entry,
            reason: `${entry.reason} ${labMatch.reason}`,
            verificationRequired: [...new Set([...entry.verificationRequired, ...labMatch.verificationRequired])],
            appliesTo: {
              modeIds: [...entry.appliesTo.modeIds, "laboratory"],
              sourceIds: [...new Set([...entry.appliesTo.sourceIds, ...labMatch.appliesTo.sourceIds])],
            },
          };
        }
        if (entry.capabilities?.some((capability) => capability === "select-view" || capability === "announce-active-view")) {
          return { ...entry, appliesTo: { ...entry.appliesTo, modeIds: [...entry.appliesTo.modeIds, "laboratory"] } };
        }
        return entry;
      }),
      ...labMatches.filter((match) => !app.lineage.some(({ componentId }) => componentId === match.componentId)),
    ],
    assumptions: [...app.assumptions, "The proposed Workbench camera has a clear line of sight."],
  });
};

type DiffEntity = AppDiff[number]["entity"];

function diffEntities(app: GeneratedApp) {
  const entries = new Map<string, { entity: DiffEntity; id: string; value: object }>();
  const add = (entity: DiffEntity, id: string, value: object) => {
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
  for (const [role, permissions] of Object.entries(roles)) add("role", role, [...permissions].sort());
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
    if (change === "changed" && updated) {
      const beforeFields = Object.entries(value);
      const afterFields = Object.entries(updated.value);
      const fields = new Set([...beforeFields, ...afterFields].map(([field]) => field));
      const beforeValues = new Map(beforeFields);
      const afterValues = new Map(afterFields);
      diff.push({
        entity, id, change, before: JSON.parse(JSON.stringify(value)), after: JSON.parse(JSON.stringify(updated.value)),
        changedFields: Array.isArray(value) ? ["permissions"] : [...fields].filter(
          (field) => JSON.stringify(beforeValues.get(field)) !== JSON.stringify(afterValues.get(field)),
        ),
      });
    } else {
      diff.push({ entity, id, change });
    }
  }
  for (const [key, { entity, id }] of next) {
    if (!previous.has(key)) diff.push({ entity, id, change: "added" });
  }
  return appDiffSchema.parse(diff);
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

export function inspectApp(input: unknown): ValidationResult {
  const parsed = generatedAppSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      reviewRequired: true,
      issues: parsed.error.issues.map(({ path, message }) => ({
        code: "invalid-configuration",
        message,
        path: path.map(String).join("."),
      })),
    };
  }

  const app = parsed.data;
  const issues: ValidationResult["issues"] = [];
  for (const assumption of app.assumptions) {
    issues.push({ code: "design-assumption", message: assumption });
  }
  for (const mapping of app.sdkMappings) {
    issues.push({
      code: "unverified-amlos-mapping",
      message: `${mapping.layer} mapping is proposed and unverified.`,
      suggestion: mapping.proposedResponsibility,
      layer: mapping.layer,
    });
  }
  for (const entry of app.lineage) {
    if (entry.kind !== "new") {
      const project = sampleApps.find(({ id }) => id === entry.sampleProjectId);
      if (!project?.components.some(({ id, sourceFile }) => id === entry.componentId && sourceFile === entry.sourceFile)) {
        issues.push({
          code: "unconfirmed-provenance",
          componentId: entry.componentId,
          message: "Confirm this origin against the sample manifest used to create the recipe.",
        });
      }
    }
    for (const verification of entry.verificationRequired) {
      issues.push({ code: "lineage-verification", componentId: entry.componentId, message: verification });
    }
  }
  if (app.approval === "draft") {
    issues.push({ code: "human-signoff", message: "An engineer must approve this design before it enters the recipe library." });
  }
  return { valid: true, reviewRequired: issues.length > 0, issues };
}

export const composeBlueprint: CanonDnaEngine["composeBlueprint"] = (input) => {
  const app = generatedAppSchema.parse(input);
  const cameras = app.sources.filter(({ kind }) => kind === "physical-camera").map(({ id }) => ({
    cameraId: id,
    processedViewIds: app.sources.flatMap((source) =>
      source.kind === "processed-view" && source.physicalCameraId === id ? [source.id] : [],
    ),
  }));
  return blueprintSchema.parse({
    app,
    sourceTopology: {
      cameras,
      digitalSourceIds: app.sources.flatMap(({ id, kind }) => kind === "digital-media" ? [id] : []),
    },
    review: inspectApp(app),
    signoffChecklist: [
      "Verify camera placement, coverage and each processed view against the source topology.",
      "Verify proposed Camera, Hub and Edge mappings with Canon engineering.",
      "Review role permissions, dependencies, assumptions and mode behavior.",
      "Record human approval before adding the design to the recipe library.",
    ],
  });
};

export function serializeApprovedRecipe(recipe: ApprovedRecipe): string {
  return JSON.stringify(approvedRecipeSchema.parse(recipe));
}

export function deserializeApprovedRecipe(serialized: string): ApprovedRecipe {
  return approvedRecipeSchema.parse(JSON.parse(serialized));
}
