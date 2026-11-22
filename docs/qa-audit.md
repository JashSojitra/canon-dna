# Canon DNA — engine and contract audit (pre-integration)

**Audited commit:** `5d55252` (bootstrap on `main`; `feat/dna-engine` and `feat/studio-ui` have no new commits yet)
**Files reviewed:** `src/types/canon-dna.ts`, `src/lib/engine/index.ts`, `src/data/*.ts`, `src/sample-apps/**`, `src/tests/unit/bootstrap.test.ts`, `docs/contracts.md`, `package.json`, `tsconfig.json`, `eslint.config.mjs`
**Method:** code reading against `CANON_DNA_EXECUTION_PLAN.md` §1, §2, §10, §11, `AGENTS.md`, `DESIGN.md`. No engine source was changed.
**Execution status:** **no command was executed in this QA session.** Shell execution (`npm test`, `npx vitest`) needed interactive approval, which wasn't available. The new contract tests in `tests/e2e/contract/demo-story.test.ts` were checked by hand against the engine code and are **unexecuted**. Run `npx vitest run tests/e2e/contract` before relying on them. No frontend or browser test has run: the UI isn't integrated (`src/app/page.tsx` is a placeholder).

**Severity:**
- **CRITICAL:** can break the live story or produce a false claim on stage.
- **MAJOR:** weakens a P0 stage or forces the UI to hard-code data.
- **MINOR:** polish or a later risk.

Owner = the agent that would make the fix (routed through Jash).

## Summary table

| ID | Sev | Finding | Owner |
|---|---|---|---|
| A-01 | CRITICAL | Interpretation is exact-string match. Any edited or re-typed prompt fails | Engine + UI |
| A-02 | CRITICAL | The lecture prompt in the plan and run-of-show differs from the engine's `lecturePrompt` | Jash / pitch (docs fixed) |
| A-03 | CRITICAL | No contract binds preview regions (view tiles) to `lineage[]`, so the X-Ray will be hard-coded | Engine (contract) + UI |
| A-04 | MAJOR | `applyLabRequirement` throws on unsupported text. An uncaught throw in the UI white-screens the demo | UI (catch), Engine (optional result type) |
| A-05 | MAJOR | The "generated" app topology is fixed. Requirements only change the title and institution | Pitch honesty + Engine (later) |
| A-06 | MAJOR | Extraction graph has only 2 nodes and 1 edge per sample | Engine |
| A-07 | MAJOR | The Remote Training sample never contributes to any decision | Engine |
| A-08 | MAJOR | Coverage "validation" echoes a supplied boolean. It's not computed | Pitch honesty |
| A-09 | MAJOR | No persistence contract (storage key, load/save, parse-on-load, reset) | Engine (helper) + UI |
| A-10 | MAJOR | SDK mappings don't change after the lab update. The blueprint never mentions the Workbench camera | Engine |
| A-11 | MINOR | Diff reports `application: changed` with no detail. Scene IDs are doubly prefixed | Engine / UI |
| A-12 | MINOR | Re-applying the lab to an already-lab app doesn't reset approval to draft | Engine |
| A-13 | MINOR | API asymmetry: structured lab requirements can't be passed to `applyLabRequirement` | Engine |
| A-14 | MINOR | `buildLectureApp` accepts unrelated matches (lineage for sources that don't exist) | Engine |
| A-15 | MINOR | `diffApps` uses `JSON.stringify` equality, so order changes show as `changed` | Engine |
| A-16 | MINOR | `demo-apps.ts` runs the engine at import time, so an engine throw breaks every importer | Engine |
| A-17 | MINOR | Approved recipe type ≠ `SampleApp`, so a recipe can't take part in matching (P1) | Engine (P1) |
| A-18 | MINOR | Tooling notes: Vitest picks up any `*.test.ts`; no Playwright; Node engine pin for Vercel | Jash |

---

## CRITICAL

### A-01 · Exact-string interpretation makes the Architect fragile on stage
- **Where:** `src/lib/engine/index.ts:19-33` (`interpretRequirements`) and `:103-107` (`applyLabRequirement`).
- **Behaviour:** the text is trimmed and lower-cased, then compared with `===` against the three demo prompts. Any other difference fails: a doubled internal space, a line break from pasting, a missing final period, a "smart" apostrophe, or a single edited word. The Architect then returns `ok: false`, and the lab update **throws**.
- **Repro (engine level):** `interpretRequirements(lecturePrompt.replace(" with ", "  with "))` gives `ok: false`. So does `interpretRequirements(lecturePrompt.slice(0, -1))` (no period).
- **Demo impact:** the plan calls the Architect "editable natural-language requirements". If Jash or a judge edits the text, generation fails live. This is also the strongest "isn't this template lookup?" Q&A attack.
- **Minimal fix:**
  - (a) UI: pre-fill the exact prompt and keep the input read-only or "reset to demo prompt" during the demo. Show the engine's failure message truthfully.
  - (b) Engine (low risk): normalize internal whitespace and trailing punctuation before comparing.
  - (c) Engine (preferred, if time allows): keyword-rule interpretation (e.g. "lab" + "workbench" → laboratory) that still returns `rules-demo`.
- **Test coverage:** `tests/e2e/contract` pins only the documented tolerance (case and surrounding whitespace). Checklist 3.7 and 3.8 cover the UI.

### A-02 · Two different lecture prompts are in circulation
- **Where:** `CANON_DNA_EXECUTION_PLAN.md` §2 Stage C: "University classroom; a camera with professor and whiteboard views; digital slides; three fixed views; university branding; professor controls and remote student viewer." Compare `src/data/demo-prompts.ts:3-4`: "Build a university classroom with Professor and Whiteboard views from one camera, digital Slides, Professor controls, and a remote Student viewer."
- **Impact:** with A-01, anyone rehearsing from the plan text gets a failure. The lab prompt matches (only case differs).
- **Fix:** done in the QA docs. `docs/pitch-outline.md` and `docs/demo-runbook.md` quote the engine strings verbatim. Jash should treat `demo-prompts.ts` as the single source and avoid copying from the plan.

### A-03 · No binding from the rendered preview to lineage, so the X-Ray will be hard-coded
- **Where:** `src/types/canon-dna.ts:66-77` (`lineageSchema`) and `src/lib/engine/index.ts:35-42`, `:51-66`.
- **Behaviour:** the lineage `componentId`s are `classroom-preview`, `source-selector` and `workbench-view`. The preview renders *sources* (`professor`, `whiteboard`, `slides`, `workbench`) and UI regions (layout, selector, toolbar). Nothing in `GeneratedApp` says which on-screen region a lineage entry describes. Even the one natural join fails: `workbench-view` ≠ source id `workbench`.
- **Impact:** to make X-Ray regions clickable, the UI must invent a mapping table (`{ "workbench": "workbench-view", ... }`). That breaks the "`GeneratedApp` is the ONE source for preview, X-Ray, blueprint" rule (`AGENTS.md`), and it can silently drift. The X-Ray is the primary signature moment (`DESIGN.md`).
- **Minimal fix (engine contract):** add an optional `appliesTo: { sourceIds?: string[]; region?: "layout" | "selector" | ... }` (or `sourceIds: string[]`) to lineage entries. Set `workbench-view.appliesTo.sourceIds = ["workbench"]`, `source-selector → region "selector"`, `classroom-preview → region "layout"` plus the lecture source IDs. Validate in `generatedAppSchema` that referenced source IDs exist. This is a contract change, so it needs `docs/contract-changes.md` and Jash's approval before either side edits.
- **Until fixed:** the QA browser spec assumes one X-Ray target per lineage entry with `data-testid="xray-target-<componentId>"`.

## MAJOR

### A-04 · `applyLabRequirement` throws and the UI must catch it
- **Where:** `src/lib/engine/index.ts:105-107`.
- **Impact:** an uncaught error in a React event handler shows no fallback. In a dev build it's an error overlay; in prod the action silently fails. Either is worse than the truthful message `interpretRequirements` already returns.
- **Fix:** UI wraps the call in `try/catch` and shows the message. Optionally, the engine adds a non-throwing `tryApplyLabRequirement` returning `{ ok, app | message }`. Contract test pins the throw so the UI knows to catch.

### A-05 · The design is assembled, not generated, from the requirements
- **Where:** `src/lib/engine/index.ts:69-101`. `buildLectureApp` uses a fixed topology, roles, assumptions and mappings. Only `title` and `institution` come from requirements, and the lecture fixture sets these to `Example University` / `University Classroom`.
- **Impact:** fine for one worked example, which is what Canon asked for. It becomes a **claims** risk if the pitch says "the AI generated this from your description".
- **Fix:** pitch wording is already handled ("structured interpretation, matched against the library, assembled into a validated configuration"). There's no engine change needed for Sunday.

### A-06 · The extraction graph is very thin
- **Where:** `src/data/sample-apps.ts`. Classroom has 2 components and 1 edge; Remote Training has 2 components and 1 edge.
- **Impact:** the plan and `DESIGN.md` picture a graph with MultiViewPlayer, WhiteboardScene, SourceSelector, PresenterToolbar, ViewerPermissions and LectureWorkflow. Two nodes read as a toy. They also make the Library's "X reusable components" count 4, which is honest but unimpressive. P0 requires that the user "can inspect at least two nodes", which is only just met.
- **Fix (engine, low risk if done early):** add 3–4 small *real* TSX components to `src/sample-apps/classroom/` (e.g. `ViewerPermissions.tsx`, `PresenterToolbar.tsx`, `MultiViewLayout.tsx`) with real imports, and declare them in the manifest. The QA contract test checks that every manifest edge matches a real `import`, which keeps this honest. **Do not** add manifest entries without files.

### A-07 · The second sample contributes nothing
- **Where:** `src/lib/engine/index.ts:44-67`. Matching only looks up `classroom`. The laboratory requirement returns a hard-coded NEW `workbench-view`.
- **Impact:** the pitch says "reuse existing applications" (plural), and the Library shows two samples. A judge may ask what Remote Training is for. It's also a missed story beat: "Remote Training already had an instructor demonstration view, so Workbench is ADAPTED from it, not built new."
- **Fix (engine, decision for Jash):** either keep Workbench as NEW (simpler, and the NEW classification itself is a useful X-Ray beat) and say so in the pitch, or match `training-preview` as ADAPT for the workbench with a reason. Don't change this after the UI freezes the X-Ray copy.

### A-08 · The coverage check echoes a supplied fact
- **Where:** `src/data/demo-prompts.ts:15-19` (`hasLineOfSight: false`) → `src/lib/engine/index.ts:172-185`.
- **Impact:** `validateCoverage` returns whatever the request declares. If the pitch says "the system detected the camera can't see it", that's a false claim.
- **Fix:** wording only. Use "the request declares no line of sight, and the system refuses to fake the view and requires engineering review". Already written into `docs/pitch-outline.md`. Keep this optional (P1).

### A-09 · No persistence contract for "approved recipe survives reload"
- **Where:** `docs/contracts.md` says "Browser-side storage is owned by the studio". There is no storage key, versioning, parse-on-load or reset helper.
- **Risks:**
  - SSR or hydration mismatch if `localStorage` is read during render (Next.js App Router). A reload then logs a console error, and acceptance requires none.
  - Stale recipes from rehearsals appear at the start of the pitch.
  - A corrupt or old-schema value can crash the Library.
  - Re-approval can create duplicates, because the recipe ID is fixed (`university-lab-recipe`).
- **Fix:**
  - Engine adds a tiny pure helper pair: `serializeRecipes(recipes)` and `parseRecipes(raw): ApprovedRecipe[]` (safeParse, dropping invalid entries), plus an exported `RECIPE_STORAGE_KEY = "canon-dna:recipes:v1"`.
  - UI reads storage in `useEffect` only, upserts by ID, and exposes a "Reset demo" action.
  - QA browser spec and checklist §12 cover this.

### A-10 · The blueprint doesn't reflect the lab change in the AMLOS mapping
- **Where:** `applyLabRequirement` (`src/lib/engine/index.ts:113-131`) copies `sdkMappings` unchanged. The Camera mapping still reads "professor camera control" only, and Hub still says "the processed views and digital media" with no mention of the fourth view or second camera.
- **Impact:** at 4:05 the blueprint for the lab design looks identical to the lecture design in its AMLOS section, which undercuts the "controlled change" story. The diff entry `application: changed` comes only from the added assumption.
- **Fix (engine):** in `applyLabRequirement`, append an entry or amend the Camera and Hub responsibility text to name the Workbench camera and four distributed views. Keep `status: "proposed"` and `verified: false`.

## MINOR

- **A-11:** `diffApps` reports `{ entity: "application", change: "changed" }` without saying *what* changed (here, one assumption added). Scene IDs become `lecture-lecture-overview` / `laboratory-lab-overview`. The UI should display `scene.label`, not the raw diff ID. Optional: add `fields?: string[]` to diff entries.
- **A-12:** `src/lib/engine/index.ts:110` returns the input unchanged when Laboratory already exists. An *approved* lab app stays approved after "re-applying" a change. That's harmless for the demo path but contradicts "a new lab mode resets approval" if someone re-runs it after approval.
- **A-13:** `interpretRequirements("", { kind: "laboratory" })` succeeds, but `applyLabRequirement` accepts only text. A UI using structured fields for the lab must still pass `labPrompt`.
- **A-14:** `buildLectureApp(requirements, matches)` doesn't check the matches. Passing laboratory matches yields a lecture app with a NEW `workbench-view` lineage and no Workbench source. Suggest validating that lineage entries for NEW view components reference existing sources (ties into A-03).
- **A-15:** `JSON.stringify` equality in `diffEntities` is key-order and array-order sensitive. If the UI ever rebuilds an object with a different key or array order, the diff shows spurious `changed`. The UI must diff engine-produced objects only.
- **A-16:** `src/data/demo-apps.ts` computes fixtures at import time. If a future engine change makes `applyLabRequirement` throw, every module importing the fixtures fails to load and the page white-screens. Keep the UI on the live engine flow, or lazily compute the fixtures.
- **A-17:** `ApprovedRecipe` wraps a `GeneratedApp`, while the Library and matching take `SampleApp[]`. "New approved recipe participates in matching" (P1) has no type path. Fine to defer; just don't claim it on stage.
- **A-18 (tooling):**
  - Vitest has no config, so **any** `*.test.ts` anywhere runs in `npm test`. QA browser specs are named `*.e2e.ts` to avoid this.
  - Playwright isn't installed; see `tests/e2e/README.md` for a no-save install.
  - `package.json` pins Node `^22.13.0 || >=24`, so Vercel's project Node version must match.
  - ESLint lints the whole repo, including `tests/e2e`.

## Things that are solid (keep them)

- `generatedAppSchema` enforces the core topology truths at runtime:
  - processed views need an existing physical camera
  - scenes can't show physical cameras
  - selectable views must be in a scene
  - students can't hold `camera-ptz` (by type and schema)
  - mappings are literally `verified: false`
- `applyLabRequirement` builds a new object and leaves its input untouched. Lecture mode is preserved by construction (`...app.modes`).
- `extractSampleDNA` returns a `structuredClone`, so the UI can't corrupt the library.
- `approvedRecipeSchema` refuses draft apps: the approval gate is enforced by schema.
- Interpretation mode is always reported as `rules-demo`, which is honest by default.

## Questions for engineering (route via Jash)

1. **A-03:** will the engine add a lineage→source/region binding (`appliesTo`), or does the UI own a mapping table? QA recommends the engine contract.
2. **A-01:** can `interpretRequirements` normalize internal whitespace and punctuation before Gate 2, and will the Architect input be read-only during the demo?
3. **A-07:** Workbench: NEW (current) or ADAPT from Remote Training? It needs deciding before the X-Ray copy and slide 6 freeze.
4. **A-09:** who defines the recipe storage key and the reset action? Will there be an in-app "Reset demo" control?
5. **Mode switching:** `switch-mode` is a professor permission. In the Student preview, how does the operator switch Lecture ↔ Laboratory? Is there an operator-level control outside the role preview? (It affects the click script at 2:28 and 2:38.)
6. **Test IDs:** will Local Codex adopt the proposed `data-testid` set in `tests/e2e/browser/selectors.ts`, or should QA adapt to role and text selectors after integration?
7. **LLM route:** is `/api/interpret` still planned for Sunday? If so, what exact badge text appears in `llm` vs `rules-demo` mode, and how is a fallback reason surfaced?
8. **A-06:** will extra real sample components be added before the UI freezes the graph layout?

## Demo readiness limitations (as of this audit)

- No integrated UI exists, so **none** of the UI checklist items (`docs/qa-checklist.md` §1–16) can pass yet, and no browser test has run.
- Contract tests are prepared but **unexecuted** in this session.
- All click names in the pitch and runbook are `[ANTICIPATED]` until the UI merges.
- No screenshots exist. The slide slots S-01…S-09 are placeholders by design.
- Deployed URL and `demo-freeze` tag don't exist yet.
