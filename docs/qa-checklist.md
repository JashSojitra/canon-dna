# Canon DNA — QA test plan and checklist

**Scope:** the full Sunday demo path, from clean storage, on the integrated `main` build.
**Status:** PREPARED and NOT YET EXECUTED. The studio UI has not been integrated (`src/app/page.tsx` is still the bootstrap placeholder at `5d55252`). Engine-level checks are partly automated in `tests/e2e/contract/` (see `docs/qa-audit.md` for the run status).

**Severity** (priority order from `AGENTS.md`):
- **CRITICAL:** the story is broken, or a data claim is false.
- **MAJOR:** UI wiring is missing, or a control is dead.
- **MINOR:** typography or legibility problem, or an optional effect misbehaving.

Record each result as `PASS` / `FAIL (sev, issue #)` / `N/A`, with the tester's initials and the commit hash.

```
Build under test (commit):          Deployed URL:
Tester:            Date/time:       Browser + version:
```

## 0. Pre-flight (gate before any manual run)

| # | Check | How | Result |
|---|---|---|---|
| 0.1 | `npm ci` clean on Node `^22.13 \|\| >=24` | fresh clone of `main` | |
| 0.2 | `npm run typecheck` passes | | |
| 0.3 | `npm run lint` passes, no warnings in demo path | | |
| 0.4 | `npm test` passes (unit + `tests/e2e/contract`) | | |
| 0.5 | `npm run build` passes, no network-dependent fonts or assets | build with network off if possible | |
| 0.6 | No `.env` required. The app runs with **no LLM key** | unset all keys, `npm start` | |
| 0.7 | Fresh profile / incognito, storage empty | DevTools → Application → Storage → *Clear site data* | |
| 0.8 | DevTools console open. **Zero** errors or warnings on load | | |
| 0.9 | Network tab: only same-origin requests (no CDN video, fonts, analytics) | filter by "third-party" | |

## 1. Library

| # | Check | Expected | Sev if fail |
|---|---|---|---|
| 1.1 | Library loads first, without a theatrical loader | Two tiles: **AMLOS Classroom**, **AMLOS Remote Training** | CRITICAL |
| 1.2 | Each tile is labelled team-created / sample | Text such as "Team-created sample application". Never "Canon customer" | CRITICAL |
| 1.3 | Counts are grounded | Component counts match `src/data/sample-apps.ts` (currently **2 + 2 components, 1 + 1 edges**). The summary does not invent "X reusable components" | CRITICAL |
| 1.4 | Subtitle | `Independent hackathon concept for Canon AMLOS` is visible | MAJOR |
| 1.5 | `Analyze DNA` present on Classroom, keyboard-reachable | Tab reaches it, and Enter activates it | MAJOR |
| 1.6 | No approved recipe is shown on a clean profile | Recipe section is empty or hidden | MAJOR |

## 2. Extraction

| # | Check | Expected | Sev |
|---|---|---|---|
| 2.1 | The graph or table shows exactly the manifest components | `classroom-preview`, `source-selector`. Edge `classroom-preview → source-selector` | CRITICAL |
| 2.2 | Click node 1 (Source Selector) | Inspector: `src/sample-apps/classroom/SourceSelector.tsx`, capability `select-view`, layer Edge | CRITICAL |
| 2.3 | Click node 2 (Classroom Preview) | Inspector: `src/sample-apps/classroom/Classroom.tsx`, its dependency listed | MAJOR |
| 2.4 | Every displayed path exists in the repo | Compare against `git ls-files src/sample-apps` | CRITICAL |
| 2.5 | Method labelled "manifest-backed" | No "scanning source code" or "parsing Canon repo" copy | CRITICAL |
| 2.6 | No fake progress percentages | Any reveal animation lists only real entries | MAJOR |
| 2.7 | Same data with reduced motion | OS reduced motion on → same nodes and edges, no animation block | MAJOR |
| 2.8 | Inspector closes with `Esc` and returns focus | | MINOR |

## 3. Architect

| # | Check | Expected | Sev |
|---|---|---|---|
| 3.1 | The lecture prompt is pre-filled **exactly** as `lecturePrompt` in `src/data/demo-prompts.ts` | Byte-for-byte except case and surrounding whitespace | CRITICAL |
| 3.2 | `Generate design` produces a result in under 1 s, with no network | | CRITICAL |
| 3.3 | Interpretation badge reads rules/demo mode | Matches `interpretationMode: "rules-demo"`. Never "AI" or "LLM" unless a real call ran | CRITICAL |
| 3.4 | Structured requirement chips match the engine output | institution `Example University`, title `University Classroom`, kind lecture | MAJOR |
| 3.5 | Reuse decisions | **Source Selector: REUSE**, **Classroom Preview: ADAPT**, each with its engine `reason` text | CRITICAL |
| 3.6 | REUSE/ADAPT/NEW are distinguishable without colour | Text label plus symbol or hatch (`DESIGN.md`) | MINOR |
| 3.7 | **Negative:** edit the prompt (e.g. "Build a hospital") and generate | Clear, truthful error (engine message). No crash, no silent fake design | MAJOR |
| 3.8 | **Negative:** paste the prompt with a doubled internal space or a line break | Document the behaviour. Today the engine rejects it (see audit A-01) | MAJOR |
| 3.9 | If an LLM route exists: kill the network or key | UI falls back visibly to rules mode, and the badge changes | CRITICAL |

## 4. Three-view preview (Lecture)

| # | Check | Expected | Sev |
|---|---|---|---|
| 4.1 | Exactly 3 selectable views: Professor, Whiteboard, Slides | Rendered from `modes.lecture.studentSelectableIds` | CRITICAL |
| 4.2 | Topology shown truthfully | Professor and Whiteboard both reference `classroom-camera`. Slides is digital media. **Never 3 cameras** | CRITICAL |
| 4.3 | Each feed labelled `SIMULATED SOURCE`, loaded from local assets | | CRITICAL |
| 4.4 | Student role: select each view → focus changes visibly | | CRITICAL |
| 4.5 | Student: change layout and fullscreen both work. Exiting fullscreen with `Esc` works | | MAJOR |
| 4.6 | Student: **no PTZ control rendered or enabled** | Not merely hidden by CSS. The keyboard cannot reach it | CRITICAL |
| 4.7 | Professor role: PTZ and mode switch visible. PTZ is labelled simulated | | MAJOR |
| 4.8 | Role switch keeps the selected mode | | MINOR |

## 5. Laboratory update

| # | Check | Expected | Sev |
|---|---|---|---|
| 5.1 | The lab prompt is pre-filled exactly as `labPrompt` | | CRITICAL |
| 5.2 | Applying it inserts the Workbench feed into the layout (motion is optional, the state change is not) | | CRITICAL |
| 5.3 | Topology now has **2 physical cameras**. Workbench → `workbench-camera` | | CRITICAL |
| 5.4 | Approval state goes back to **draft** | | MAJOR |
| 5.5 | Apply twice (double-click) | Still 4 views, no duplicate Workbench, no error | MAJOR |
| 5.6 | Unsupported change text | Caught and shown as an error. `applyLabRequirement` **throws**, so the UI must catch it | MAJOR |
| 5.7 | DevTools: the config object changed (React DevTools or store inspector), not an image swap | No `<img>` replacing the whole preview | CRITICAL |

## 6. Four-view preview (Laboratory)

| # | Check | Expected | Sev |
|---|---|---|---|
| 6.1 | Laboratory mode: 4 selectable views (Professor, Whiteboard, Slides, Workbench) | | CRITICAL |
| 6.2 | Student can focus Workbench | | CRITICAL |
| 6.3 | Student still has no PTZ | | CRITICAL |
| 6.4 | Layout with 4 tiles is legible at 1440×900. No tile is cropped under the inspector | | MAJOR |

## 7. Lecture preservation

| # | Check | Expected | Sev |
|---|---|---|---|
| 7.1 | Switch back to Lecture after the lab update | Exactly the original 3 views, same labels and order | CRITICAL |
| 7.2 | No Workbench tile in Lecture | | CRITICAL |
| 7.3 | Switch Lecture ↔ Laboratory 5× quickly | No stale tiles, no console errors | MAJOR |

## 8. Before / After

| # | Check | Expected | Sev |
|---|---|---|---|
| 8.1 | The toggle shows the before (3-view) and after (4-view) configs | | CRITICAL |
| 8.2 | The diff list comes from `diffApps` | Added: `workbench-camera`, `workbench`, `laboratory` mode, `laboratory-lab-overview` scene, `workbench-view` lineage. Preserved: `lecture` mode, both roles, original sources and lineage. Changed: `application` (assumption added) | CRITICAL |
| 8.3 | The diff uses human labels, not raw IDs only (e.g. "Lecture overview", not `lecture-lecture-overview`) | | MINOR |
| 8.4 | The toggle is reversible and keyboard-operable | | MAJOR |
| 8.5 | Toggling Before/After does **not** mutate the store (the After view still has 4 views afterwards) | | CRITICAL |

## 9. DNA X-Ray

| # | Check | Expected | Sev |
|---|---|---|---|
| 9.1 | X-Ray toggles on over the live preview and dims the background subtly | | MAJOR |
| 9.2 | Click Source Selector | REUSE · `classroom` · `src/sample-apps/classroom/SourceSelector.tsx` · reason · Edge · verification item | CRITICAL |
| 9.3 | Click Classroom Preview | ADAPT · `src/sample-apps/classroom/Classroom.tsx` | CRITICAL |
| 9.4 | Click Workbench | NEW · **no** sample or source file · Camera + Hub · "Confirm camera placement and workbench coverage." | CRITICAL |
| 9.5 | Every X-Ray entry maps to a `lineage[]` entry of the current app. No hard-coded extra components | Compare against `laboratoryApp.lineage` (3 entries) | CRITICAL |
| 9.6 | `Esc` exits X-Ray, and focus returns to the toggle | | MAJOR |
| 9.7 | Optional coverage check: hidden-view request → `no-line-of-sight` review warning, worded as a declared fact, not computed geometry | | MINOR (P1) |

## 10. Blueprint

| # | Check | Expected | Sev |
|---|---|---|---|
| 10.1 | Blueprint renders from the current app (after the lab update) | Sources, modes, roles, lineage match the preview | CRITICAL |
| 10.2 | Camera / Hub / Edge each labelled **Proposed** and **Unverified** | | CRITICAL |
| 10.3 | Assumptions listed (simulated sources, workbench line of sight) | | MAJOR |
| 10.4 | Sign-off checklist (3 items from `composeBlueprint`) visible | | MAJOR |
| 10.5 | No invented SDK endpoints, API names or hardware model numbers | | CRITICAL |

## 11. Approval

| # | Check | Expected | Sev |
|---|---|---|---|
| 11.1 | `Request changes` does something visible (it returns to Architect, or opens a note) | Not a dead button | MAJOR |
| 11.2 | `Approve design` requires an explicit click. Nothing is auto-approved | | CRITICAL |
| 11.3 | After approval, the state reads **approved**, with approver and timestamp | | MAJOR |
| 11.4 | Approve twice | One recipe, not duplicates (the recipe ID is fixed: `university-lab-recipe`) | MAJOR |
| 11.5 | Approving, then applying a new change, resets to draft (if reachable) | | MINOR |

## 12. Persistence after reload

| # | Check | Expected | Sev |
|---|---|---|---|
| 12.1 | Approve → Library shows the new recipe | | CRITICAL |
| 12.2 | `F5` → recipe still in Library | | CRITICAL |
| 12.3 | Close the tab, reopen the URL → recipe still present | | MAJOR |
| 12.4 | No hydration-mismatch warning in the console after reload | localStorage read on the client only | MAJOR |
| 12.5 | Corrupt the storage value by hand (DevTools edit to `{}`) → reload | App loads, ignores the bad recipe (schema parse), no white screen | MAJOR |
| 12.6 | **Reset** path works (clear site data, or an in-app reset if provided) → clean Library | | CRITICAL (needed between rehearsals) |
| 12.7 | Copy says "local library", not shared or cloud | | MAJOR |

## 13. Projector checks (1440×900 primary)

| # | Check | Sev |
|---|---|---|
| 13.1 | Browser at exactly 1440×900 CSS px (zoom 100%), full screen (F11), bookmarks bar hidden | MAJOR |
| 13.2 | Every stage fits without vertical scroll in the demo-critical region. Preview dominates | MAJOR |
| 13.3 | Smallest demo-path text ≥ 14 px. Mono paths ≥ 13 px and not truncated without a tooltip | MINOR |
| 13.4 | Contrast: muted `#A4A4AB` on `#09090B` is legible from 5 m. Glass panels readable over feeds | MINOR |
| 13.5 | Red `#E21C2A` states unmistakable on a washed-out projector (test with projector brightness or contrast lowered) | MINOR |
| 13.6 | REUSE/ADAPT/NEW distinguishable in greyscale (screenshot → desaturate) | MINOR |
| 13.7 | Animations 150–350 ms. No interaction blocked by motion | MAJOR |
| 13.8 | Run the whole path on the *actual* presenting laptop and HDMI output once, Sunday morning | CRITICAL |

## 14. Mobile and tablet checks

| # | Viewport | Check | Sev |
|---|---|---|---|
| 14.1 | 390×844 (iPhone) | No horizontal overflow on any stage (`scrollWidth ≤ innerWidth`) | MAJOR |
| 14.2 | 390×844 | Stage navigation reachable. Tap targets ≥ 44×44 px | MAJOR |
| 14.3 | 390×844 | Preview views selectable. Inspector opens as a sheet, closable | MAJOR |
| 14.4 | 390×844 | Long file paths wrap or scroll, never push the layout wide | MINOR |
| 14.5 | 768×1024 (tablet) | All stages usable in portrait and landscape | MAJOR |
| 14.6 | Touch | No hover-only affordances in the demo path | MINOR |

## 15. Accessibility and resilience

| # | Check | Sev |
|---|---|---|
| 15.1 | Full demo path with keyboard only (Tab / Shift+Tab / Enter / Space / Esc) | MAJOR |
| 15.2 | Visible focus ring on every control | MINOR |
| 15.3 | `prefers-reduced-motion: reduce` → no large motion, same states | MAJOR |
| 15.4 | No WebGL (disable hardware acceleration) → demo still completes | MAJOR |
| 15.5 | Offline (DevTools → Offline after first load, or a local build with Wi-Fi off) → full path works | CRITICAL |
| 15.6 | Zoom 125% and 150% → no overlap in Preview or Inspector | MINOR |
| 15.7 | Every clickable control in the pitch path does something (dead-CTA sweep) | MAJOR |

## 16. Single-source-of-truth audit (code read, after integration)

| # | Check | Sev |
|---|---|---|
| 16.1 | Preview, X-Ray, Blueprint and Diff all read the same `GeneratedApp` in the store. Grep `src/components/**` for literal `"Workbench"`, `"professor"` arrays or hard-coded lineage | CRITICAL |
| 16.2 | `before` is a snapshot taken before `applyLabRequirement`. `after` is a distinct object | CRITICAL |
| 16.3 | The UI imports engine exports from `@/lib/engine` and does not re-implement them | MAJOR |
| 16.4 | The UI does not import `@/data/demo-apps` fixtures in place of calling the engine flow (fixtures are acceptable only as a labelled fallback) | MAJOR |

## Sign-off

```
Full path PASS at 1440×900:        commit ______  by ____  time ____
Mobile 390 / tablet 768 PASS:      commit ______  by ____  time ____
Offline / no-key PASS:             commit ______  by ____  time ____
Deployed URL PASS (fresh browser): commit ______  by ____  time ____
Tag `demo-freeze` created at:      commit ______
```
