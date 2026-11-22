> **V2 ACTIVE INSTRUCTION:** BEFORE THIS PROMPT: Read AGENTS.md, DESIGN.md, RUN_OF_SHOW.md. First do CHORE/BOOTSTRAP ONLY, publish contracts to PR and stop until Jash merges; then start feat/dna-engine. Keep dependency lockfile exclusive. UI agent now uses sourced Apple Design and premium black/red/white visual language.

# Paste into REMOTE DILAB CODEX — Core Engine / Lead Architecture

You are the lead software engineer of **CANON DNA**, a two-day hackathon prototype for Canon Canada Challenge 1. Read `CANON_DNA_EXECUTION_PLAN.md` in the repo before any coding. This is an independent hackathon concept, not an actual Canon product.

## Mission
Ship a typed, deterministic and testable core that transforms sample app manifests + customer requirements into validated application recipes and defensible REUSE / ADAPT / NEW decisions. Our headline demo: initial university app with processed Professor + Whiteboard views from ONE physical classroom camera, plus Slides as digital media; tomorrow add a SECOND physical Workbench camera, create Laboratory mode and fourth selectable view, preserving Lecture unchanged. All app screens must derive from the same configuration.

## You own ONLY
- `src/types/**`, `src/data/**`, `src/lib/engine/**`, `src/app/api/**`, `src/sample-apps/**`, `src/tests/unit/**`
- Bootstrap/dependencies/config: `package.json`, lockfile, tsconfig, Next.js config. Install stable compatible Next.js, React, TypeScript, Tailwind, shadcn/ui, `motion`, `@xyflow/react` / React Flow, `lucide-react`, `zod`, optional zustand.
- `docs/contracts.md` and `docs/contract-changes.md` initial creation.

Do NOT edit `src/components/**`, `src/app/page.tsx`, `src/app/globals.css`, `src/store/**`, or `public/**` after local UI Codex starts working. Work on `feat/dna-engine` branch. Coordinate any contract changes with Jash. Commit early; do not monopolize main.

## First 25 minutes: publish contract
1. Inspect repo; if empty, scaffold minimal Next.js app. Create `src/types/canon-dna.ts` with `SampleApp`, `ComponentManifest`, `Lineage`, `VideoSource`, `Scene`, `GeneratedApp`, `InterpretationResult`, `Blueprint` types and Zod schemas.
2. Create `src/data/sample-apps.ts`, `src/data/demo-prompts.ts`, and real sample TSX code under `src/sample-apps/classroom/**`, `src/sample-apps/remote-training/**` matching the manifest file paths.
3. Provide importable, stable interfaces in `docs/contracts.md` **before UI starts**. Commit and push bootstrap so local can branch from it.

## Engine features
- `extractSampleDNA(projectId)` returns actual component/dependency graph derived from manifests; **never pretend** to scan unavailable Canon private source. Include source-path validation test.
- `interpretRequirements(text, structured?)` returns typed requirements; provide rule-based deterministic fallback for known demo scenario and sensible errors for unsupported inputs.
- `matchReusableComponents(requirements, library)` returns decisions with original sample, file path, dependencies and plain-language rationale.
- `buildLectureApp(requirements, matches)` builds 3-view config with 1 physical camera and slides.
- `applyLabRequirement(before, text)` returns a **new immutable** 4-view config with second physical camera and both modes; never mutate `before`.
- `diffApps(before, after)` returns precise added/changed/preserved sources, roles, screens, modes.
- `validateCoverage(request)` detects request for physically occluded opposite-side view from only front camera; returns explanation, suggested new camera, reviewer flag.
- `composeBlueprint(app)` yields Camera / Hub / Edge mappings, assumptions, permissions, source topology and signoff checklist. These are explicitly **proposed**, NOT verified SDK endpoints.
- Helpers to serialize validated approved recipes for localStorage; library state UI is handled by local Codex.
- Optional `/api/interpret` with genuine LLM if environment key supplied; schema-validated structured response. Never commit secrets. Expose `interpretationMode: 'llm' | 'rules-demo'` and a clear fallback reason so UI can disclose method. No live SDK calls.

## Tests — make them pass
- One physical classroom camera → two processed views; slides is digital media.
- Lab request adds one physical camera and a fourth view.
- Lecture mode stays identical after lab addition.
- Student cannot PTZ/control physical camera.
- Lineage points to real sample files and graph dependencies exist.
- Matcher returns reasonable REUSE/ADAPT/NEW rationale.
- Invalid/physically impossible request flags review and does not claim magical view generation.
- Blueprint labels all SDK mappings proposed / unverified.
- End-to-end data output is stable with no external API key.

## Deliver back
An early pushed branch containing files, exact exported functions, sample usage and commands; unit test/build results; known limitations. Prioritize working engine/contract over clever abstraction. Do not fabricate AI, private Canon source, measured reuse percentages or speedups.
