# Canon DNA UX V5 implementation review

Implemented in the real Next.js `/` and `/studio` routes on `feat/ux-v3-guided-studio`, preserving the existing uncommitted V3/V4 work. No iframe, new dependencies, engine changes, commit, push, merge, deployment, reset, stash or file deletion.

## What changed

- The landing headline now leads with application-design reuse: “Don’t start from zero. Start from everything you’ve built.” The dimensional local viewer keeps fixture-derived Lecture/Laboratory controls and camera/view counts. A customer request, interactive reuse workshop, application evolution and paper topology explain the full concept. Launch studio navigates to the real `/studio` route.
- Extraction opens on Source Selector, with original three-view and proposed four-view examples. The actual sample `SourceSelector`, `ActiveView` and `DemonstrationView` components render inside explanatory illustrations. These are styled component examples, not photographs or screenshots of a deployed customer application. Names and origins come from manifests; classifications, reasons, dependencies and required verification come from actual engine-produced lineage. Before generation the workshop uses the validated laboratory fixture; after generation it uses the current application. Unmatched Remote Training parts remain available in a disclosure and are explicitly not presented as matches.
- The workshop distinguishes existing browser presentation patterns from NEW camera/view and source-topology design. Demonstration View adapts labeling; it never supplies physical camera hardware. NEW entries have no invented source path. “What we’re changing,” “What it does,” origin and verification are grouped visually, with paths and dependencies in Technical details.
- Architect has a light editable customer brief beside the grounded design summary. Interpretation, matching, assembly and schema validation still happen synchronously before the presentation. The presentation shows facts, authentic component examples and a composed selectable viewer. Named timing constants govern the automatic presentation. Replay and act controls allow manual inspection; Skip opens the computed recipe. Reduced motion bypasses initial choreography, and replay disables shared-layout animation for that preference. Unsupported input reports the engine error immediately; structured institution/title fields still work.
- Preview retains the existing simulator and controls, with a substantially larger canvas and a source-route/change sidebar. Active physical cameras, processed views, digital Slides and preserved Lecture behavior derive from the same application and active mode. Role, view selection, grid/focus, simulated PTZ, Before/After and mode restrictions are retained. X-Ray uses human-readable names and authentic lineage; selecting a source tile in X-Ray selects its relevant origin, including NEW Workbench.
- Blueprint is a large light topology canvas: room sources and processed views → Hub → Edge → Student UI. Slides explicitly bypasses Camera. Sources/layers are selectable, with a description and verification inspector. Camera/Hub/Edge remain PROPOSED / UNVERIFIED. Modes and assumptions are collapsible. The original live signoff checklist, name field, approval gating, Request Changes, browser-local save and reload behavior remain connected.
- All new styling is scoped through a CSS module. Existing V3/V4 global CSS is preserved. An inherited 260px preview cap is overridden within V5. Hero layers use stable stacking so the Workbench tile remains clickable.

## Exact V5 files

| File | Change |
|---|---|
| `src/components/landing.tsx` | Editorial reuse narrative, workshop and topology chapters |
| `src/components/perspective-engine.tsx` | Stable dimensional viewer controls; pointer-driven tilt removed |
| `src/components/studio.tsx` | Workshop, Architect composition/replay, paper Blueprint and retained signoff |
| `src/components/app-preview.tsx` | Source-routing sidebar, larger production composition, direct source provenance selection |
| `src/components/v5-experience.tsx` | New shared workshop, component examples, assembly scenes and selectable topology |
| `src/components/v5.module.css` | Scoped material surfaces, typography, responsive layout and reduced motion |
| `public/favicon.ico`, `public/favicon.svg` | Original local icons; resolve default favicon request without remote assets |
| `tests/e2e/browser/overview.e2e.ts` | Updated headline assertions; transformation/click assertions retained |
| `tests/e2e/browser/demo-path.e2e.ts` | Extraction count now checks actual laboratory lineage rather than only the three Classroom manifest nodes |
| `tests/e2e/browser/v5-experience.e2e.ts` | Four new critical-flow specs, run in all four browser projects |
| `docs/ux-v5-screenshots/` | Actual desktop/mobile captures, including complete topology and preview |
| `docs/ux-v5-review.md` | This review |

All other dirty files shown by Git predate this V5 task. In particular, dependency manifests, configuration, `src/types`, `src/data`, `src/lib/engine`, `src/sample-apps`, recipe storage and existing V3/V4 evidence were not changed. Temporary capture/refinement scripts live under the existing ignored `tests/e2e/.artifacts/` directory.

## Visual evidence and review

Desktop captures use 1440×900; mobile captures use 390×844. Complete-element captures include content that intentionally continues below the viewport.

- `01-landing-1440.png`, `01-landing-390.png`: bold reuse proposition and working studio CTA. Desktop has the dimensional source/viewer composition; mobile stacks it below the editorial copy.
- `02-selector-before-after-1440.png`: real selector control, three original choices versus four proposed choices, plain explanation and verification.
- `03-demonstration-before-after-1440.png`: original training label beside Workbench label, with explicit distinction from physical camera design.
- `04-architect-decisions-1440.png`, `04-architect-complete-1440.png`: actual engine decisions and miniature component examples, with manual act selection. The complete capture includes all four matched parts.
- `09-architect-request-1440.png`, `10-architect-composed-1440.png`: editable paper brief and composed application act.
- `05-preview-laboratory-1440.png`, `05-preview-laboratory-390.png`, `05-preview-complete-390.png`: selected Workbench, four usable choices, two physical cameras, real role/mode controls and source-route sidebar.
- `06-xray-new-1440.png`: NEW Workbench provenance and hardware verification; no fabricated source file.
- `07-blueprint-1440.png`, `07-blueprint-390.png`, `07-blueprint-complete-1440.png`, `07-blueprint-complete-390.png`: large source routes through Hub/Edge, independent digital Slides, Student UI and selectable inspector. Mobile deliberately uses a vertical flow.
- `08-signoff-1440.png`: actual checklist/name gate and Request Changes/Approve actions beneath the diagram.

Visual review identified and corrected the hero Workbench hit-target overlap, oversized topology source images, clipped Architect miniature controls and the inherited Preview height cap. Review covers hierarchy, readable source names, mode/camera clarity, contrast and scrolling access to controls. No horizontal overflow at 1440×900, 1366×768, 768×1024 or 390×844.

## Validation

Final verification results are being recorded after the last visual fixes.

The existing ignored runtime adapter supplies the available `playwright/test` implementation without installing dependencies or editing package files. Production QA uses port 3001, separate from the pre-existing development environment. The server is restarted after each build, and browser suites run against a fixed build.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run start -- -p 3001

$env:CANON_DNA_URL = 'http://localhost:3001'
$env:CANON_CHROMIUM_PATH = 'C:/Users/JASH2/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'
$env:NODE_OPTIONS = '--require="C:/Coding Assignments/Personal Projects/canon-dna/canon-dna/tests/e2e/.artifacts/playwright-preload.cjs"'
node tests/e2e/.artifacts/run-playwright.cjs test -c tests/e2e/browser/playwright.config.ts
node tests/e2e/.artifacts/capture-v5.cjs
```

## Regression coverage and limits

The full journey exercises Library → extraction → decisions → validated Lecture → student selections/no PTZ → lab addition → four views/two cameras → original Lecture restored → Before/After diff → X-Ray REUSE and NEW → Blueprint → review gate → approve → library reload. New V5 tests also exercise workshop selections and true sample paths, manual assembly replay, digital-input/layer inspection, Request Changes preserving the draft, structured names, simulated PTZ/reset and invalid lab requests preserving valid state.

No new skip was introduced. The seven inherited applicability skips are three desktop/tablet runs of the mobile touch-target test, one mobile run of the desktop keyboard test, and three non-reduced-motion runs of the reduced-motion-specific test. All new V5 tests run on every project. CLI color-environment warnings are runner output, not browser console warnings.

The early hero click failures were fixed in the UI, retaining their assertions. A new test initially matched both the app error and Next.js route announcer via a broad alert selector; it now targets the existing app-error test ID while retaining its message assertion.

This remains a deterministic rules demo, with simulated media, no live AI, no Canon SDK or hardware integration, no production code generation and no measured delivery-time claim. Hardware compatibility and AMLOS mappings need actual engineering verification. Saved recipes persist only in this browser and do not retrain or enter the matcher. Drafts remain session state. Real iPhone/Safari, screen-reader hardware and a physical projector were not available; Chromium emulation, keyboard and reduced-motion checks cover the tested layouts.

`git fetch origin` was attempted at task start and blocked by `.git/FETCH_HEAD` filesystem permissions. The user explicitly authorized frontend work on this dirty branch; no Git history/index mutation was performed.

Personal review: compare Source Selector and Demonstration View in the workshop; use the manual Architect acts; switch Lecture/Laboratory as Professor and return to Student; point through the Blueprint in fifteen seconds; then assess mobile scrolling and projector readability.
