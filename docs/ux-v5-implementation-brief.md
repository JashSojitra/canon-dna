# Canon DNA V5 — “From existing engineering to a designed experience”

**Mission: IMPLEMENT in the real Next.js app.** This is not a request for a mockup, opinion or revised plan. Read this document and `docs/v5-reference-experience.html` in the repository. You have full permission to modify the frontend in this branch and run validation. Do not commit, push, merge, deploy, reset or stash. This branch has valuable uncommitted V3/V4 work.

## The user complaint, verified against screenshots

Current V4 screenshots in `docs/ux-v4-screenshots/` show a sparse dark hero with flat illustration; Architect is a wall of status phases and code paths; component extraction is technically accurate but unintuitive; Preview feels like a small embedded wireframe; Blueprint is a dark form with tiny source cards and a checklist. Users cannot perceive the actual product breakthrough: **old engineering becomes an understandable, new application design**. Fix *the information architecture and visual storytelling*, not just animations.

## Reference to build from

`docs/v5-reference-experience.html` is a self-contained, fully functional interactive V5 art-direction prototype, created for this project. It contains four choreographed chapters:

1. Hero: large editorial typography and dimensionally layered remote-viewer canvas. Lecture/Lab modes interactively change 1→2 cameras and 3→4 selectable perspectives.
2. Customer request: one clear university brief.
3. **Reusable DNA workshop**: click Source Selector, Classroom Preview, Demonstration View, Workbench Camera. Each shows an old sample UI next to the proposed new usage, a decision (REUSE/ADAPT/NEW), the actual source path, and what needs engineering verification. This is the KEY UX improvement.
4. Application evolution and **light-background architecture handoff**: big functional viewer, switch views and modes; graph of AMLOS Camera → Hub → Edge; human review clearly distinguished from real SDK integration.

Treat reference as design direction, not an iframe or a finished React implementation. Rebuild using the existing Next.js app components, authentic engine data and Motion for React. Copy no proprietary components, use no remote assets or CDN. All original SVG illustrations in the reference are okay to port but ideally use existing `FeedArt` and richer original styled SVG and layout to be coherent with the actual app. Avoid large font loads and heavy WebGL. The UI should be bold at 1440×900 and on a projector, plus responsive at 390px.

## Business-logic guardrails (critical)

- Use existing types and functions from `src/data/sample-apps.ts`, `src/data/demo-prompts.ts`, `src/data/demo-apps.ts`, `src/lib/engine/`, and `src/types/canon-dna.ts` **as source of truth**. This is currently a deterministic `rules-demo` application design simulator. Never call it real AI, a live Canon AMLOS API or production code generation. Leave engine contracts/tests intact unless a genuine bug is proven and regression-tested.
- Actual sample components include `Source Selector` from `src/sample-apps/classroom/SourceSelector.tsx` (REUSE), `Classroom Preview` from `src/sample-apps/classroom/Classroom.tsx` (ADAPT), `Active View Status` (REUSE), `Demonstration View` from `src/sample-apps/remote-training/DemonstrationView.tsx` (ADAPT), `lecture-source-topology` (NEW) and `workbench-view` (NEW). Preserve their actual IDs, origins, dependencies and capability restrictions.
- Avoid claiming a Workbench camera code file exists. The workbench camera/view are new design components and require real hardware placement and line-of-sight verification. Remote Training's Demonstration View pattern is **ADAPTED for labeling** the Workbench view, not reused as a physical camera. Their distinct roles must be clear visually and in words.
- Lecture: classroom-camera physical source -> professor and whiteboard processed views, plus independent digital slides = three selectable views, one physical camera. Lab: add workbench-camera -> workbench processed view and Laboratory mode, while retaining original Lecture mode. Student has **no PTZ**; professor PTZ controls simulated. All media simulated. Both AMLOS mapping and hardware compatibility are proposed/unverified. Saved recipes persist only in browser storage, not retrained into the matcher.
- Do not invent SDK endpoint names or real runtime performance. The challenge target is roughly 3 months → 3 weeks, not a measured achievement.

## Deliverables: build, don't merely propose

### P0 — Hero and landing, real page `/`

Rebuild `src/components/landing.tsx` using a *dense, sophisticated editorial + material* style in the prototype. A clearly identifiable 3D-esque viewer with physical source flowing into multiple distinct processed views. Pair imagery with the actual value proposition **“Don't start from zero. Start from everything you've built.”** Avoid making the product sound like a camera viewer product: the hero and below-fold chapters must communicate *application design reuse*. The lab toggle is functional using validated `lectureApp` and `laboratoryApp` data. Interaction is subtle and intentional, not floating decorative orbs. Strong secondary sections for input requirement, reuse decisions, evolved application, blueprint and human approval. Use Motion to animate meaningful content and camera/view count transitions. Primary CTA enters `/studio` rather than an in-page pretend flow. Keep independent hackathon disclaimer.

### P0 — Redesign the real Studio step 1/2 (Library + extraction)

Replace obscure “Engineering, revealed” / small node graph as the main story with an interactive before/after reuse workshop. Users should click the *visual* Source Selector and see original vs new application usage, with a plain sentence: “The old selector accepts a list of views. We can use it with four views instead of hardcoding it again.” Same for Preview, Active View Status, Demonstration Label; show NEW camera clearly as requiring new design. Derive the decisions and file paths from actual manifests and `app.lineage`/matcher results when available; do not hardcode false matches. There should be a “what it does”, “where it came from”, “what we're changing”, and “what must be verified” visual grouping, not raw code IDs as giant headings. Surface raw technical details in a secondary “Technical details” disclosure. Preserve existing `analyze()` and navigation behavior.

### P0 — Redesign Architect (step 3)

Two-pane cinematic composition: a human language request is visibly **parsed into grounded facts** (classroom camera, professor view, whiteboard, slides, professor/student permissions); next show a small set of AUTHENTIC reuse decisions visually (screenshots/simplified component mockups), then a large composed app preview. Motion connects the acts with meaningful shared-layout transitions, not a basic 3-phase status bar. The result must be computed by the existing engine immediately, then replayable as a presentation sequence. Badge `Guided rules demo · not live AI` should remain visible and plain. Provide Skip. Invalid input must surface truthful error immediately. Keep editable structured fields working.

### P0 — Redesign Preview and Laboratory change (step 4)

Make the simulated application much larger. Frame the viewer as a professional production preview: video canvas dominates (~65-75% of stage width), source selector is genuinely usable, controls accessible; beside it, meaningful physical source graph and before/after change card. Animate a distinct **second camera entering**, then a fourth selectable tile gliding into a 4-way layout; preserve selections, mode switch, role, grid/focus and PTZ constraints as in V4. A gorgeous contrast between dark product shell and light simulated classroom UI is welcome. Make toggling back to Lecture visually prove **its unchanged three views**. X-Ray should emphasize original vs adapted vs new with direct click-to-inspect and lines to authentic lineage; do not just list file names.

### P0 — Redesign Blueprint (step 5) from scratch visually

This is critical. Remove the form-first dark-wall aesthetic. Create a **large, attractive topology canvas**, preferably a near-white paper/mineral panel surrounded by black/graphite studio framing. Visually map input room hardware -> actual source views -> Hub -> Edge -> Student UI. Slides enters Hub without a physical camera. Keep real Camera / Hub / Edge descriptions and status PROPOSED / NOT VERIFIED. Node selection opens a clean description and required verification, not raw engineering jargon. A person should be able to explain the architecture in 15 seconds just by pointing at it.

Place human engineer signoff as a purposeful final review sidebar/drawer BELOW or NEXT TO this large diagram. Preserve all live, real checkboxes, reviewing engineer name, validation logic, Request Changes and Approve & Save flows. Do not fake approval. Details of roles and assumptions available in collapsible sections.

### P1 — Design quality

- Treat this as editorial interaction design, not SaaS decoration. Alternate black and near-white material surfaces. Natural human descriptions, bold hierarchy, large visual examples, minimal status chips. Don't cover everything in borders.
- Motion for React (`motion/react` already installed): meaningful controlled transitions on stage change; shared-layout selection; camera addition; component fly-in/reuse connection. Respect reduced motion, keyboard focus, accessible text and no fake live-loading/AI networks.
- Responsive at 1440×900, 1366×768, 768×1024, and 390×844; no horizontal overflow. Buttons >=44px touch target; projector font >=14px for information critical to pitch.
- Avoid conflicting `.landing`, `.hero`, `.preview` global style names; scope new CSS or use CSS modules. Keep existing backend untouched, tests passing. No new large dependencies.

## QA must be completed before claiming ready

1. `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, `npm.cmd run build` all pass.
2. Run existing browser tests through available runtime adapter if needed, plus active V5 browser tests for each critical flow. Don't replace a test failure with a skip. Report actual skip count.
3. Capture actual browser screenshots and **review** them at desktop and mobile: `/` above-fold, extraction BEFORE/AFTER (including demonstration label), Architect actual decision reveal, lab selected, X-Ray NEW, Blueprint flow, signoff; mobile landing, preview, Blueprint. Put in `docs/ux-v5-screenshots/`.
4. Test full user journey: Library → sample extraction → decisions → generated Lecture → Student views/no PTZ → Lab add → 4 views/2 cameras → restore Lecture 3 views → X-Ray REUSE and NEW → Blueprint → Approve → reload. Ensure no browser errors, hydration errors, console warnings, dead controls or remote assets.
5. Write `docs/ux-v5-review.md` with exact changed files, screenshots, screenshots' visual QA conclusions, command results, browser-test count, limitations and regression report. Commit/push/deploy NOTHING. Do not discard V4 or any uncommitted changes.
6. Output a concise summary plus what user should personally review. **The goal is to implement real UI, not a document.**

## Definition of done

At a glance a judge knows (a) customer asks for a workflow, (b) parts of prior applications really get reused or adapted, (c) new camera hardware is honestly flagged, (d) the proposal becomes a visually comprehensible AMLOS design, and (e) a human engineer must approve it. The transformation is beautiful, but comprehension never depends on motion. Do not declare ready while the main extraction, Architect, Preview and Blueprint remain old dark form layouts.
