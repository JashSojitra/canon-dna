import { z } from "zod";

const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const label = z.string().trim().min(1);
const sourcePath = z.string().regex(/^src\/sample-apps\/(?:[\w-]+\/)+[\w-]+\.tsx$/);
const uniqueIds = z.array(id).refine((ids) => new Set(ids).size === ids.length);
export const amlosLayerSchema = z.enum(["Camera", "Hub", "Edge"]);
export const reuseKindSchema = z.enum(["reuse", "adapt", "new"]);
export const modeIdSchema = z.enum(["lecture", "laboratory"]);

export const dependencySchema = z.object({ from: id, to: id });
export const componentManifestSchema = z.object({
  id,
  name: label,
  sourceFile: sourcePath,
  capabilities: uniqueIds,
  proposedAmlosLayers: z.array(amlosLayerSchema),
});
export const sampleAppSchema = z.object({
  id,
  name: label,
  origin: z.literal("team-created"),
  entryFile: sourcePath,
  components: z.array(componentManifestSchema).min(1),
  dependencies: z.array(dependencySchema),
}).superRefine((app, ctx) => {
  const ids = new Set(app.components.map((component) => component.id));
  if (ids.size !== app.components.length) {
    ctx.addIssue({ code: "custom", path: ["components"], message: "Component IDs must be unique" });
  }
  if (!app.components.some((component) => component.sourceFile === app.entryFile)) {
    ctx.addIssue({ code: "custom", path: ["entryFile"], message: "Entry file must be a manifest component" });
  }
  const edges = new Set<string>();
  app.dependencies.forEach(({ from, to }, index) => {
    const key = `${from}:${to}`;
    if (edges.has(key)) {
      ctx.addIssue({ code: "custom", path: ["dependencies", index], message: "Dependency edges must be unique" });
    }
    edges.add(key);
    if (from === to || !ids.has(from) || !ids.has(to)) {
      ctx.addIssue({ code: "custom", path: ["dependencies", index], message: "Dependency must link two distinct manifest components" });
    }
  });
});
export const sampleDnaSchema = z.object({
  method: z.literal("manifest-backed"),
  project: sampleAppSchema,
});

const source = z.object({ id, label, simulated: z.literal(true) });
export const videoSourceSchema = z.discriminatedUnion("kind", [
  source.extend({ kind: z.literal("physical-camera"), physicalCameraId: z.never().optional() }),
  source.extend({ kind: z.literal("processed-view"), physicalCameraId: id }),
  source.extend({ kind: z.literal("digital-media"), physicalCameraId: z.never().optional() }),
]);
export const sceneSchema = z.object({ id, label, visibleSourceIds: uniqueIds });
export const modeSchema = z.object({ label, scenes: z.array(sceneSchema).min(1), studentSelectableIds: uniqueIds });
export const modesSchema = z.object({ lecture: modeSchema, laboratory: modeSchema.optional() });
const viewerPermission = z.enum(["select-view", "change-layout", "fullscreen"]);
export const rolesSchema = z.object({
  professor: z.array(z.union([viewerPermission, z.literal("camera-ptz"), z.literal("switch-mode")])),
  student: z.array(viewerPermission),
});
export const sdkMappingSchema = z.object({
  layer: amlosLayerSchema,
  proposedResponsibility: label,
  status: z.literal("proposed"),
  verified: z.literal(false),
});

const lineage = z.object({
  componentId: id,
  dependencies: uniqueIds,
  reason: label,
  proposedAmlosLayers: z.array(amlosLayerSchema),
  verificationRequired: z.array(label),
  capabilities: uniqueIds.optional(),
  appliesTo: z.object({
    modeIds: z.array(modeIdSchema),
    sourceIds: uniqueIds,
  }).optional(),
});
export const lineageSchema = z.discriminatedUnion("kind", [
  lineage.extend({ kind: z.literal("reuse"), sampleProjectId: id, sourceFile: sourcePath }),
  lineage.extend({ kind: z.literal("adapt"), sampleProjectId: id, sourceFile: sourcePath }),
  lineage.extend({ kind: z.literal("new"), sampleProjectId: z.never().optional(), sourceFile: z.never().optional() }),
]);

export const generatedAppSchema = z.object({
  id,
  title: label,
  institution: label,
  sources: z.array(videoSourceSchema).min(1),
  modes: modesSchema,
  roles: rolesSchema,
  lineage: z.array(lineageSchema),
  assumptions: z.array(label),
  sdkMappings: z.array(sdkMappingSchema),
  approval: z.enum(["draft", "approved"]),
}).superRefine((app, ctx) => {
  const sources = new Map(app.sources.map((entry) => [entry.id, entry]));
  if (new Set(app.lineage.map(({ componentId }) => componentId)).size !== app.lineage.length) {
    ctx.addIssue({ code: "custom", path: ["lineage"], message: "Lineage component IDs must be unique" });
  }
  if (sources.size !== app.sources.length) {
    ctx.addIssue({ code: "custom", path: ["sources"], message: "Source IDs must be unique" });
  }
  app.lineage.forEach(({ appliesTo }, index) => {
    if (appliesTo && (appliesTo.sourceIds.some((sourceId) => !sources.has(sourceId))
      || appliesTo.modeIds.some((modeId) => !app.modes[modeId]))) {
      ctx.addIssue({ code: "custom", path: ["lineage", index, "appliesTo"], message: "Lineage targets must exist in the application" });
    }
  });
  app.sources.forEach((entry, index) => {
    if (entry.kind === "processed-view" && sources.get(entry.physicalCameraId)?.kind !== "physical-camera") {
      ctx.addIssue({ code: "custom", path: ["sources", index, "physicalCameraId"], message: "Processed views require an existing physical camera" });
    }
  });
  for (const [modeId, mode] of Object.entries(app.modes)) {
    if (!mode) continue;
    const visible = new Set(mode.scenes.flatMap((scene) => scene.visibleSourceIds));
    if (Array.from(visible).some((sourceId) => !sources.has(sourceId) || sources.get(sourceId)?.kind === "physical-camera")) {
      ctx.addIssue({ code: "custom", path: ["modes", modeId, "scenes"], message: "Scenes must reference existing processed views or digital media" });
    }
    if (mode.studentSelectableIds.some((sourceId) => !visible.has(sourceId))) {
      ctx.addIssue({ code: "custom", path: ["modes", modeId, "studentSelectableIds"], message: "Selectable views must appear in a scene in this mode" });
    }
    if (new Set(mode.scenes.map((scene) => scene.id)).size !== mode.scenes.length) {
      ctx.addIssue({ code: "custom", path: ["modes", modeId, "scenes"], message: "Scene IDs must be unique within a mode" });
    }
  }
});

export const lectureRequirementsSchema = z.object({
  kind: z.literal("lecture"),
  institution: label,
  title: label,
});
export const labRequirementsSchema = z.object({ kind: z.literal("laboratory") });
export const coverageRequestSchema = z.object({
  kind: z.literal("coverage"),
  viewLabel: label,
  hasLineOfSight: z.boolean(),
});
export const requirementsSchema = z.discriminatedUnion("kind", [
  lectureRequirementsSchema, labRequirementsSchema, coverageRequestSchema,
]);
export const interpretationResultSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), interpretationMode: z.enum(["rules-demo", "llm"]), requirements: requirementsSchema }),
  z.object({ ok: z.literal(false), interpretationMode: z.enum(["rules-demo", "llm"]), message: label }),
]);
export const appDiffSchema = z.array(z.object({
  entity: z.enum(["source", "mode", "scene", "role", "lineage", "application"]),
  id,
  change: z.enum(["added", "removed", "changed", "preserved"]),
  changedFields: z.array(z.string()).optional(),
  before: z.json().optional(),
  after: z.json().optional(),
}));
export const validationResultSchema = z.object({
  valid: z.boolean(),
  reviewRequired: z.boolean(),
  issues: z.array(z.object({
    code: id,
    message: label,
    suggestion: label.optional(),
    path: z.string().optional(),
    componentId: id.optional(),
    layer: amlosLayerSchema.optional(),
  })),
});
export const blueprintSchema = z.object({
  app: generatedAppSchema,
  signoffChecklist: z.array(label),
  sourceTopology: z.object({
    cameras: z.array(z.object({ cameraId: id, processedViewIds: uniqueIds })),
    digitalSourceIds: uniqueIds,
  }).optional(),
  review: validationResultSchema.optional(),
});
export const approvedRecipeSchema = z.object({
  id,
  app: generatedAppSchema,
  approvedBy: label,
  approvedAt: z.iso.datetime(),
}).refine(({ app }) => app.approval === "approved", { path: ["app", "approval"], message: "Recipe requires an approved application" });

export type AmlosLayer = z.infer<typeof amlosLayerSchema>;
export type ReuseKind = z.infer<typeof reuseKindSchema>;
export type ModeId = z.infer<typeof modeIdSchema>;
export type Dependency = z.infer<typeof dependencySchema>;
export type ComponentManifest = z.infer<typeof componentManifestSchema>;
export type SampleApp = z.infer<typeof sampleAppSchema>;
export type SampleDNA = z.infer<typeof sampleDnaSchema>;
export type VideoSource = z.infer<typeof videoSourceSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Mode = z.infer<typeof modeSchema>;
export type Roles = z.infer<typeof rolesSchema>;
export type SDKMapping = z.infer<typeof sdkMappingSchema>;
export type Lineage = z.infer<typeof lineageSchema>;
export type GeneratedApp = z.infer<typeof generatedAppSchema>;
export type LectureRequirements = z.infer<typeof lectureRequirementsSchema>;
export type LabRequirements = z.infer<typeof labRequirementsSchema>;
export type CoverageRequest = z.infer<typeof coverageRequestSchema>;
export type Requirements = z.infer<typeof requirementsSchema>;
export type InterpretationResult = z.infer<typeof interpretationResultSchema>;
export type AppDiff = z.infer<typeof appDiffSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type Blueprint = z.infer<typeof blueprintSchema>;
export type ApprovedRecipe = z.infer<typeof approvedRecipeSchema>;

export interface CanonDnaEngine {
  extractSampleDNA(projectId: string): SampleDNA | undefined;
  interpretRequirements(text: string, structured?: Requirements): InterpretationResult;
  matchReusableComponents(requirements: Requirements, library: readonly SampleApp[]): Lineage[];
  buildLectureApp(requirements: LectureRequirements, matches: readonly Lineage[]): GeneratedApp;
  applyLabRequirement(before: GeneratedApp, text: string): GeneratedApp;
  diffApps(before: GeneratedApp, after: GeneratedApp): AppDiff;
  validateCoverage(request: CoverageRequest): ValidationResult;
  composeBlueprint(app: GeneratedApp): Blueprint;
}
