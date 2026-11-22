# Canon DNA UX V4 review

Implemented on the existing uncommitted V3 work in `feat/ux-v3-guided-studio`. No stash, reset, branch switch, commit, push, PR, merge or deployment. Existing V3 changes remain in place. No dependency manifests, lockfiles, engine contracts, fixtures or sample sources were changed.

## Feature walkthrough

- `/`: an editorial three-line headline and immediately available Launch studio CTA sit beside Perspective Engine. Original CSS camera hardware, optical paths, dimensional monitor and local SVG feed art explain how one physical camera supplies Professor and Whiteboard; Slides stays digital.
- Lecture/Laboratory controls use `lectureApp` and `laboratoryApp`. Counts, camera nodes, selectable tiles and focused viewer all derive from those validated fixtures. Laboratory inserts the separate Workbench camera and fourth view. Returning to Lecture removes both from its topology.
- Desktop pointer tilt is limited to three degrees in each axis (below the requested four-degree maximum), gated by a fine hovering pointer and desktop width. Touch and reduced motion use a flat composition. No WebGL, video, remote media, animation loops or new dependencies.
- INSPECT shows the actual Classroom manifest components, paths and directed dependencies. DESIGN pairs the actual supplied requirement with fixture-backed REUSE/ADAPT/NEW decisions. EVOLVE reveals the fourth view on entry, supports replaying Lecture and adding Laboratory again, and keeps its explanation sticky on desktop.
- Studio stage changes use `AnimatePresence mode="wait" initial={false}` with a 160ms departure and 300ms arrival. The navigation laser moves using a shared layout ID. Real extraction nodes reveal with a short stagger. Existing heading focus and keyboard controls remain available.
- Generate interprets, matches, assembles and validates synchronously. Only then does a 1.9-second presentation show the prepared request facts, actual matched source paths and resolved recipe. It explicitly says results are already computed and `GUIDED RULES DEMO / NOT LIVE AI`. Skip opens the same prepared configuration. Navigation clears pending timers. Invalid requests report their existing error immediately. Reduced motion skips the presentation.
- Lab changes retain the AppPreview instance, role, selected view and grid/focus layout. A new active camera route enters, the four selectable controls reflow, and the counter changes. The compact callout is computed from `diffApps`, including Lecture preservation. Before/After still uses the real retained snapshot.
- X-Ray slides in from the right; existing lineage targets, dependency selection and authentic source paths remain operational. NEW entries retain their implementation-pending status. Blueprint adds a config-driven input diagram through Hub and Edge, explicitly distinguishing digital input from Camera processing. Mappings remain proposed/unverified, and signoff controls remain visible and usable.
- Explicit approval still saves a browser-local recipe; reload preserves it. Saved recipes are not claimed to participate in matching. Studio drafts remain session state.

## V4 files

- `src/components/landing.tsx`: new landing composition and replayable evolution storyboard, replacing the V3 landing composition only.
- `src/components/perspective-engine.tsx`: new fixture-driven source/optics/viewer visualization.
- `src/components/studio.tsx`: stage choreography, computed-result presentation, extraction reveal, config delta and blueprint diagram.
- `src/components/app-preview.tsx`: persistent lab insertion, camera routes, layout motion, counter and X-Ray entrance.
- `src/app/globals.css`: scoped V4 art direction, responsive layouts and reduced-motion fallbacks. Existing V3 CSS retained.
- `tests/e2e/browser/overview.e2e.ts`: updated landing copy and CTA expectations; transformation assertions retained.
- `tests/e2e/browser/choreography.e2e.ts`: new checks for factual presentation, Skip, reduced-motion bypass, preserved role/focus/layout, and Lecture restoration.
- `tests/e2e/browser/playwright.config.ts`: reduced motion moved into `contextOptions`; the inherited top-level option did not set the browser preference in the available runner.
- `tests/e2e/browser/responsive.e2e.ts`: verifies the actual reduced-motion media preference and provides animation target diagnostics on failure. No assertions deleted.
- `tests/e2e/contract/demo-story.test.ts`: removed only the unused `classroom` variable.
- This review and seven PNGs in `docs/ux-v4-screenshots/`.

The other dirty files listed by Git predate V4. `src/app/page.tsx` and `src/app/studio/page.tsx` keep the V3 route wiring.

## Reviewed screenshots

Five desktop captures use a 1440×900 viewport. Mobile captures use a 390×844 viewport, showing the landing above fold and the complete operational preview. Seven images cover all requested states (five desktop plus two mobile), totaling approximately 0.9 MB.

1. [Landing above fold](ux-v4-screenshots/01-landing-1440.png)
2. [Architect during matched-parts reveal](ux-v4-screenshots/02-architect-reveal-1440.png)
3. [Laboratory after change](ux-v4-screenshots/03-laboratory-1440.png)
4. [X-Ray with authentic Source Selector provenance](ux-v4-screenshots/04-xray-1440.png)
5. [Blueprint and engineering checklist](ux-v4-screenshots/05-blueprint-1440.png)
6. [Mobile landing above fold](ux-v4-screenshots/06-landing-390.png)
7. [Mobile Laboratory preview](ux-v4-screenshots/07-preview-390.png)

Visual review tightened an initially over-tall desktop hero, checked the complete viewer/control composition, and confirmed mobile readability. Additional reviewed INSPECT, DESIGN, EVOLVE and landing Laboratory images are in ignored `tests/e2e/.artifacts/`. Storyboard replay was exercised from four to three and back to four views. Layout/overflow and page-error checks also ran at 1366×768 and 768×1024.

## Source and license provenance

All hardware shapes, optical paths, panel treatments and choreography are original CSS/SVG/React written for this task. Feed art is the existing local team-created `src/components/feed-art.tsx`; manifests and recipe examples remain the existing team fixtures. No photographs, videos, Canon product renders, paid components or third-party component source were downloaded or copied.

Existing installed Motion is MIT; Lucide React is ISC, as recorded in their installed package metadata. Motion usage was checked against the official [AnimatePresence](https://motion.dev/docs/react-animate-presence), [layout animation](https://motion.dev/docs/react-layout-animations) and [reduced motion](https://motion.dev/docs/react-use-reduced-motion) documentation. [Componentry Circuit Board](https://componentry.dev/docs/components/circuit-board) and [ThreeUI hero references](https://threeui.com/hero) were inspected for broad topology/depth inspiration only. No registry commands, proprietary source or Three.js stack were used.

## QA and reproduction

- `npm.cmd run typecheck`: passed on final source.
- `npm.cmd run lint`: passed, no warnings, on final source and test edits.
- `npm.cmd run test`: 41 passed across three files.
- `npm.cmd run build`: passed; `/` and `/studio` statically generated.
- Browser suite final result: 37 passed, 7 intentional skips across 44 test cases (2.0 minutes). Projects: 1440 projector, 1440 actual reduced motion, 768 tablet and 390 mobile. Skips cover touch-only checks on non-mobile projects, keyboard on mobile, and reduced-motion-only checks on other projects. Guarded overview and full demo paths recorded no console/page errors or third-party requests.
- Full capture sweep: 1440×900, 1366×768, 768×1024 and 390×844, no page errors or Blueprint horizontal overflow. Captured and visually reviewed the seven listed PNGs.

The standard `npx.cmd --no-install playwright test -c tests/e2e/browser/playwright.config.ts` attempt could not resolve a local Playwright install and its npm registry request failed with EACCES. `@playwright/test` is absent locally. Existing Chromium and V3's ignored runtime adapter were used instead, without installing packages or modifying dependency files:

```powershell
$env:NODE_OPTIONS='--require="C:/Coding Assignments/Personal Projects/canon-dna/canon-dna/tests/e2e/.artifacts/playwright-preload.cjs"'
$env:CANON_DNA_URL='http://localhost:3001'
$env:CANON_CHROMIUM_PATH='C:/Users/JASH2/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'
# Separate terminal, after build: npm.cmd run start -- -p 3001
node tests/e2e/.artifacts/run-playwright.cjs test -c tests/e2e/browser/playwright.config.ts
node tests/e2e/.artifacts/capture-v4.cjs
```

The adapter loads the available runtime's `playwright/test` export in place of `@playwright/test`. Browser artifacts and the HTML report are under ignored `tests/e2e/.artifacts/`. Port 3001 isolates production QA from the pre-existing development server on port 3000. An intermediate production test run was invalidated by rebuilding its assets while it was running; the final run uses a restarted server and a fixed build.

## Full demo path

1. `/`: read the application-design scope, toggle Laboratory, select Workbench, restore Lecture. Scroll INSPECT → DESIGN → EVOLVE; replay the storyboard.
2. Launch studio → Classroom Inspect DNA → select Source Selector and Classroom Preview, read their actual source files → Draft a new design.
3. Generate the supplied request. Watch the prepared facts → matched parts → assembled design, or use Skip. Unsupported language shows its error immediately.
4. Student selects Professor, Whiteboard and Slides; no PTZ. Professor can try the explicitly simulated controls and change modes.
5. Apply the supplied lab change. Workbench camera and view enter; verify four selections and two active cameras. Professor → Lecture restores exactly three views; Laboratory restores four. Switch back to Student.
6. Compare the original snapshot and updated config. Open X-Ray, inspect REUSE Source Selector and NEW Workbench, and close with Escape.
7. Review Blueprint, proposed/unverified mappings, source routes, modes and checklist. Enter reviewing engineer, acknowledge every item, approve and save.
8. Approved recipe appears in Library; reload `/studio`, confirm it persists and open it again.

## Limits and environment blockers

No application blocker identified in the completed checks. `git fetch origin` failed because `.git/FETCH_HEAD` is not writable in this sandbox; no Git history/index write was attempted afterward. The local checkout and existing uncommitted work were used as authorized.

This remains a deterministic application-design simulator: no LLM, Canon SDK, real hardware, streaming, AST scan, production code generation, measured schedule reduction or automatic reuse of saved recipes. Hardware mapping needs Canon engineering verification. Real iPhone/Safari, screen-reader and physical-projector testing were not available; Chromium emulation and keyboard tests cover the exercised layouts. There is no continuous ambient animation; viewport reveals and pointer-only transforms avoid a permanent rendering workload. No GPU profiler or performance benchmark was run.


UX V4 READY FOR HUMAN REVIEW
