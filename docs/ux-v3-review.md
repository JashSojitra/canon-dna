# Canon DNA UX V3 review

UX V3 is ready for human review. No Git commands, commit, push, PR, merge or deployment were performed. Branch creation and verification against up-to-date main remain the human's responsibility, per this task's sandbox instructions.

## Before and after

Before: `/` opened directly into a dense five-stage engineering workspace. Browser specs referenced proposed hooks and controls that did not match the shipped DOM.

After: `/` explains application reuse, traceability and human review, with a working illustrative Lecture/Laboratory viewer. `/studio` holds the working five-stage experience and supports direct navigation and reload. A prominent Back to overview link returns to `/`.

The first 30 seconds explain: start from authorized examples, reuse what works, adapt a classroom design, inspect each decision, and approve a traceable recipe. The hero demonstrates one camera / three views becoming two cameras / four views without implying a hardware connection.

## Implemented

- Editorial black/off-white/red landing, minimal navigation, workflow explanation, real fixture-backed REUSE/ADAPT/NEW examples, and calm scope disclosure.
- Hero modes, view selection and camera counts derived from validated `lectureApp` / `laboratoryApp`; illustrations reuse `FeedArt`. No separate topology definition or network dependency.
- Novice-oriented stage names, precise titles, next actions, one-line context, consistent Lucide icons, tabular counters, focus indicators and reduced-motion support.
- Manifest inspection retains real declared components, edges and source paths. Architect retains supplied and structured inputs and truthful Rules-demo labeling.
- Reuse decisions show reasons and sample origins in Architect after generation and in an expandable review immediately below Preview. Preview starts with this review collapsed to prioritize the classroom UI.
- Existing engine calls, validation, error handling, role permissions, lab update, snapshots, diff, fullscreen and explicit approval remain functional. X-Ray highlights related source controls using lineage metadata and declared dependencies.
- Blueprint preserves camera routes, proposed/unverified mappings, assumptions, engineer identity and required acknowledgements. Approved recipes persist under the existing localStorage key and survive `/studio` reload.
- Browser specs now exercise actual DOM hooks, select-based Professor mode control, real fixture counts, actual recipe IDs, required approval fields and corrupt-storage recovery. New overview coverage tests the complete 3-to-4 transformation and route navigation.
- Generated browser artifacts are excluded from Git and ESLint so reports do not become source inputs.

## Changed files

- `src/app/page.tsx`, new `src/app/studio/page.tsx`
- new `src/components/landing.tsx`, `src/components/studio.tsx`, `src/components/app-preview.tsx`
- `src/app/globals.css`
- `tests/e2e/browser/helpers.ts`, `selectors.ts`, `demo-path.e2e.ts`, `responsive.e2e.ts`, `playwright.config.ts`, new `overview.e2e.ts`
- `.gitignore`, `eslint.config.mjs` (generated browser artifact exclusions only)
- this document and `docs/ux-v3-screenshots/*.png`

No engine, type, fixture, dependency manifest or lockfile changes. No third-party component source copied.

## Checks executed

- `npm run typecheck`: passed.
- `npm run lint`: passed, with one existing unused-variable warning at `tests/e2e/contract/demo-story.test.ts:126`.
- `npm run test`: 41 tests passed across 3 files.
- `npm run build`: passed; `/` and `/studio` both generated successfully.
- `node tests/e2e/.artifacts/run-playwright.cjs test -c tests/e2e/browser/playwright.config.ts`: 29 passed, 7 intentionally skipped. Full demo, approval/reload, error cases and landing run at 1440x900, 768x1024, 390x844, plus desktop reduced motion. Skips are mobile-only touch checks on desktop/tablet, keyboard on mobile, and reduced-motion-only checks on other projects.
- After the final viewer-width adjustment, reran `node tests/e2e/.artifacts/run-playwright.cjs test -c tests/e2e/browser/playwright.config.ts responsive.e2e.ts` across all projects; screenshots were regenerated.
- Guards found no console/page errors or external requests during the guarded landing and complete demo paths. Responsive tests check overflow, mobile primary touch targets, keyboard navigation and reduced motion.

The registry install attempt was blocked by network permissions. Browser tests instead used installed Playwright 1.62.1 from the Codex runtime, with an ignored local preload mapping `@playwright/test` to its equivalent `playwright/test` export and installed Chromium via `CANON_CHROMIUM_PATH`. No dependency files were changed. Standard reproduction once `@playwright/test` is available: `npx playwright test -c tests/e2e/browser/playwright.config.ts` after `npm run build`.

## Screenshots

Permanent after screenshots: `docs/ux-v3-screenshots/` (overview at all three widths; desktop examples, Lecture, Laboratory, X-Ray and Blueprint; tablet/mobile Laboratory). Full browser-stage screenshots and HTML report are in ignored `tests/e2e/.artifacts/`. Screenshots show only localhost demo content. No before screenshots were captured; the before IA description is based on the source read before editing.

## Demo click path

1. `/`: read the headline; toggle Laboratory, choose Workbench, return to Lecture.
2. Explore the live studio -> Inspect DNA on Classroom -> select a component -> Draft a new design.
3. Keep the supplied classroom prompt -> Generate design -> view Professor, Whiteboard, Slides as Student. Open Why these parts to see decisions.
4. Switch Professor to try simulated PTZ, then return to Student.
5. Add laboratory mode -> select Workbench. Switch Professor -> Lecture (three views) -> Laboratory (four views) -> Student.
6. Compare Before / Lecture and After / Updated; open DNA X-Ray, inspect Source Selector and Workbench, close with Escape.
7. Review blueprint -> read proposed AMLOS mappings and verification points -> acknowledge every checklist item -> enter reviewing engineer -> Approve design & save recipe.
8. Approved recipe appears in Examples. Reload `/studio` and open it again.

## Tradeoffs and remaining limits

- Studio drafts are session state; only explicitly approved recipes persist. Refreshing returns to Examples and preserves saved recipes.
- Workflow links to Preview/Approval guide a fresh visitor through draft generation first, with an explanatory message. They cannot bypass the required GeneratedApp.
- Styles extend the existing stylesheet with a scoped V3 layer; the inherited stylesheet has not been rewritten wholesale. Existing compressed JSX is retained where it preserves working behavior.
- This remains a simulated deterministic rules prototype using declared team manifests. No AST extraction, LLM, production code generation, live SDK, real camera or measured engineering-time reduction is claimed.
- Real-device Safari, projector hardware and assistive-technology sessions were not tested. Chromium emulation and keyboard/reduced-motion checks were executed.

CANON DNA UX V3 READY FOR HUMAN REVIEW.
