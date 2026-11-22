# Canon DNA bootstrap contracts

Use Node.js 22.13+ on the 22 line, or Node.js 24+. Install the locked dependencies with `npm ci`, then use `npm run dev`. The root page is a placeholder for the studio. The scaffold uses the Next.js App Router and Tailwind's PostCSS integration. See [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [Tailwind's Next.js setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

## Imports and validation

| Module | Exports |
| --- | --- |
| `@/types/canon-dna` | TypeScript contracts and Zod schemas. Parse data at JSON or persistence boundaries. The TypeScript types are inferred from the schemas. |
| `@/data/sample-apps` | Read-only `sampleApps` array containing `classroom` and `remote-training`. |
| `@/data/demo-prompts` | `lecturePrompt`, `labPrompt`, `hiddenViewPrompt`, `lectureRequirements`, `hiddenViewRequest`. |
| `@/data/demo-apps` | `lectureApp` and `laboratoryApp`, validated draft fixtures. Treat both as read-only snapshots in the studio. |
| `@/lib/engine` | Eight synchronous, browser-safe functions implementing `CanonDnaEngine`. |

A `SampleApp` has `origin: "team-created"`, an entry file, components and directed `Dependency` edges. An edge `{ from, to }` means the component identified by `from` depends on the component identified by `to`. File paths are repository-relative TSX paths for inspection and provenance. The sample entries export the React components `Classroom` and `RemoteTraining`.

A `GeneratedApp` includes source topology, modes, scenes, permissions, lineage, assumptions, mappings and approval state. Use this object for preview, X-Ray and blueprint. Resolve scene and selectable IDs against `app.sources`. Physical cameras describe capture hardware. Selectable items are processed views or digital media. Each processed view references a physical camera through `physicalCameraId`. Every source is simulated.

| Mode | Selectable IDs | Physical camera topology |
| --- | --- | --- |
| Lecture | `professor`, `whiteboard`, `slides` | Professor and Whiteboard share `classroom-camera`. Slides is digital media. |
| Laboratory | `professor`, `whiteboard`, `slides`, `workbench` | Workbench uses the added `workbench-camera`. Lecture retains its original selections. |

Both roles have `select-view`, `change-layout` and `fullscreen`. Professor also has `camera-ptz` and `switch-mode`. PTZ is a permission in the design. Sample media and controls are simulated. All Camera, Hub and Edge mappings carry `status: "proposed"` and `verified: false`.

A `Lineage` entry supplies the component ID, reason, dependency IDs, proposed AMLOS layers and items for engineering verification. Reuse and adaptation entries also supply a sample project ID and source path. A new component has its own ID and rationale.

## Engine behavior

| Function | Input and output | Bootstrap behavior |
| --- | --- | --- |
| `extractSampleDNA` | `(projectId: string) => SampleDNA \| undefined` | Returns a cloned manifest with `method: "manifest-backed"`. An unknown ID returns `undefined`. |
| `interpretRequirements` | `(text: string, structured?: Requirements) => InterpretationResult` | Validates an explicit structured request or recognizes the supplied demo strings with casing and surrounding whitespace ignored. Returns `ok: false` and a message for unsupported input. The mode is always `rules-demo`. |
| `matchReusableComponents` | `(requirements: Requirements, library: readonly SampleApp[]) => Lineage[]` | Grounds lecture reuse and adaptation in the supplied classroom manifest. Laboratory emits the new Workbench decision. Coverage emits an empty array. |
| `buildLectureApp` | `(requirements: LectureRequirements, matches: readonly Lineage[]) => GeneratedApp` | Builds the fixed lecture topology with the supplied institution, title and lineage. |
| `applyLabRequirement` | `(before: GeneratedApp, text: string) => GeneratedApp` | Accepts the supplied lab prompt and returns an independent validated snapshot. A new lab mode resets approval to draft. Reapplying it to a config that already has Laboratory returns a validated copy. Unsupported text throws an error. |
| `diffApps` | `(before: GeneratedApp, after: GeneratedApp) => AppDiff` | Reports added, removed, changed or preserved entities by ID. Scene IDs in the diff are prefixed with the mode ID and a hyphen. A mode includes its scenes. Application entries cover top-level metadata. |
| `validateCoverage` | `(request: CoverageRequest) => ValidationResult` | Uses the provided line-of-sight fact. Missing sight produces a review-required issue with code `no-line-of-sight`. |
| `composeBlueprint` | `(app: GeneratedApp) => Blueprint` | Returns the validated app snapshot and the engineering signoff checklist. |

## Complete demo flow

```ts
import {
  hiddenViewPrompt, labPrompt, lecturePrompt,
} from "@/data/demo-prompts";
import { sampleApps } from "@/data/sample-apps";
import {
  applyLabRequirement, buildLectureApp, composeBlueprint, diffApps,
  extractSampleDNA, interpretRequirements, matchReusableComponents,
  validateCoverage,
} from "@/lib/engine";
import { approvedRecipeSchema, type GeneratedApp } from "@/types/canon-dna";

export function prepareDemo() {
  const samples = sampleApps.map(({ id }) => {
    const dna = extractSampleDNA(id);
    if (!dna) throw new Error(`Missing sample ${id}`);
    return dna;
  });

  const interpretation = interpretRequirements(lecturePrompt);
  if (!interpretation.ok) throw new Error(interpretation.message);
  if (interpretation.requirements.kind !== "lecture") {
    throw new Error("Expected lecture requirements");
  }

  const matches = matchReusableComponents(interpretation.requirements, sampleApps);
  const before = buildLectureApp(interpretation.requirements, matches);
  const after = applyLabRequirement(before, labPrompt);
  const diff = diffApps(before, after);
  const laboratory = after.modes.laboratory;
  if (!laboratory) throw new Error("Expected Laboratory mode");
  const labViews = laboratory.studentSelectableIds.map((id) => {
    const source = after.sources.find((item) => item.id === id);
    if (!source) throw new Error(`Missing source ${id}`);
    return source;
  });

  const hidden = interpretRequirements(hiddenViewPrompt);
  if (!hidden.ok || hidden.requirements.kind !== "coverage") {
    throw new Error("Expected a coverage request");
  }
  const coverage = validateCoverage(hidden.requirements);
  const blueprint = composeBlueprint(after);

  return { samples, interpretation, before, after, diff, labViews, coverage, blueprint };
}

// Call this after the engineer explicitly approves the current draft.
export function approveDemo(app: GeneratedApp, approvedBy: string) {
  const recipe = approvedRecipeSchema.parse({
    id: "university-lab-recipe",
    app: { ...app, approval: "approved" },
    approvedBy,
    approvedAt: new Date().toISOString(),
  });

  // Browser-side storage is owned by the studio.
  const serialized = JSON.stringify(recipe);
  return approvedRecipeSchema.parse(JSON.parse(serialized));
}
```

To supply structured requirements from a form, call `interpretRequirements("", { kind: "lecture", institution: "Example University", title: "University Classroom" })`. The other supported discriminants are `{ kind: "laboratory" }` and `{ kind: "coverage", viewLabel: "Hidden side of workbench", hasLineOfSight: false }`.

Phase 1 uses manifest reads, fixed demo rules and in-memory data. General interpretation, broader component matching, persistent library state, media playback and interactive studio screens are follow-on work.
