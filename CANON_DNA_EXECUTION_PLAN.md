> **V2 OVERRIDE (Nov 21 evening):** `AGENTS.md`, `DESIGN.md`, and `RUN_OF_SHOW.md` govern collaborator workflow and brand styling. Black/red/white overrides any earlier cyan/blue suggestion. Use Apple Design + User Interface Wiki skill principles and selectively inspect Componentry, Skiper, Animmaster and ThreeUI; do not stack libraries or install paid components without rights. `main` is integration-only after the bootstrap PR.

# CANON DNA — Hackathon execution plan (FINAL)

**Event:** Brampton AI Innovator Hackathon · Canon Canada Challenge 1  
**As-of:** Saturday November 21, 2026 evening · **Deck deadline:** Sunday November 22, 2026 at 12:00 PM ET  
**Team:** Jash and Vani  
**North star:** *Every application Canon builds becomes intelligence for the next one.*

## 0. The decision

Build **Canon DNA**, a premium engineering-intelligence prototype that converts *authorized, previously built AMLOS application examples* into reusable recipes, uses those recipes to assemble a new customer-specific UI design, and shows why each part was reused, adapted, or newly needed.

This is **not** a generic chat-to-website generator. The core is **provenance, engineering reuse, and controlled change**. The defining demo is *classroom lecture (3 views) → next-day lab (4 views)* while preserving the original classroom workflow.

The official Canon November 20 full brief and technical briefing clarify:
- Target: reduce roughly 3 months of customization toward 3 weeks; **do not claim we achieved it**.
- Required this weekend: a clear pitch and **one worked example** (customer description → application design showing screens/modes/views/AMLOS mapping/human approval). A working AI agent is optional. A camera-view simulator is stretch.
- **Agent layer is the goal.** AMLOS Camera (image processing/control), Hub (media aggregation/distribution), and Edge (browser UI hosting) already exist.
- **No SDK, test environment, real private Canon source, or integration credentials are available this weekend.** Actual integration is for selected continuing teams later.
- Judging: four equally weighted dimensions: host value, feasibility, responsible AI/data, pitch clarity. Five minutes including demo, then three minutes Q&A.

**Explicitly excluded before Sunday:** Meta Quest, VR/XR, quantum, physically realistic 3D room model, production databases, auth, live streaming, hardware, actual AMLOS API calls, full source-code generation, real Canon repo ingestion.

## 1. Frozen product scope

### P0 — must actually work in the deployed prototype
1. **DNA Library:** two team-created sample projects, AMLOS Classroom and AMLOS Remote Training. Clear provenance disclaimer; each has a component manifest linked to actual sample TSX modules.
2. **DNA Extraction:** animated but truthful manifest-backed analysis; graph/table of real sample components, dependencies, and source paths. User can inspect at least two nodes.
3. **AI Architect:** editable natural-language requirements and structured fields. A genuine LLM interpreter if a key is available, with visible rule-based demo fallback and valid structured outputs either way.
4. **Reuse decisions:** REUSE, ADAPT, NEW for each matched component, with plain-language reason and provenance.
5. **Live Preview:** believable interactive **professor** and **student** views. Initial 3 sources: processed professor view and whiteboard view from **one classroom camera**, plus a **separate digital slides source**. Student can focus a view, change layout, use fullscreen; student CANNOT PTZ-control cameras.
6. **Next-day change:** user adds a second physical camera aimed at the workbench. System creates `laboratory` mode and fourth student view, preserves the lecture mode. The preview is rendered from an **updated validated configuration object**, not a swapped screenshot. Show Before/After diff.
7. **DNA X-Ray:** overlay on live preview, color-coded lineage, click a real component → source file, original sample, dependencies, status, rationale, proposed AMLOS role, verification flags.
8. **Blueprint & Approval:** readable app diagram and Camera/Hub/Edge *proposed* mappings, open assumptions, review-needed items, `Request changes` and `Approve design`. Approval writes a new **recipe** to local storage and it appears in Library after refresh.
9. **Deploy and rehearse:** live Vercel URL, test from fresh browser, 5-minute click path, PDF deck ready before deadline.

### P1 — only after P0 works end to end
- Interactive graph built with React Flow (can start with a deterministic diagram/list if behind schedule).
- Genuine server-side LLM interpretation (`/api/interpret`) with Zod output validation and visible fallback state.
- Camera-coverage limitation example: cannot synthesize the hidden opposite side of a workbench from a camera with no line of sight.
- New approved recipe participates in matching of a second project.
- Two-device / browser viewport visual QA.

### P2 — defer to after the hackathon
- AST-level code extraction, deep source dependency parsing, code exporters, multiple customer templates, granular audit histories, multiple languages, advanced graphs, elaborate 3D, backend, real SDK/hardware integration.

**Cut rule:** if any P0 step fails at the first integrated rehearsal, stop new feature work and fix it. No P1 feature may jeopardize the lecture→lab demonstration.

## 2. Five-stage user journey

**Stage A · LIBRARY** — dashboard with two clear sample apps, traceability counts and an `Analyze DNA` CTA. Sample content genuinely maps to project fixtures; do not describe samples as Canon customer code.

**Stage B · EXTRACT** — reveal component graph/table. Click nodes such as MultiViewPlayer, WhiteboardScene, SourceSelector, PresenterToolbar, ViewerPermissions, LectureWorkflow; render actual dependency edges sourced from manifests.

**Stage C · ARCHITECT** — show a structured requirement card under natural language. `Generate design` returns existing component matches with categorized reuse decisions and a short reason. Prompt: "University classroom; a camera with professor and whiteboard views; digital slides; three fixed views; university branding; professor controls and remote student viewer."

**Stage D · PREVIEW + UPDATE + X-RAY** — launch generated app in the SAME shell, switch Professor/Student; 3 working views. Submit second request: "Tomorrow is a lab. Add a workbench camera, let students choose four views, and keep Lecture mode unchanged." Visible state/config changes; Before/After compare; Lecture and Laboratory both work; X-Ray clickable.

**Stage E · BLUEPRINT** — produce structured summary of source topology, scenes, roles/permissions, component lineage, AMLOS mapping, open verification issues. `Approve design` persists the approved recipe. Return to Library and see the new recipe.

## 3. Technical contracts — establish BEFORE parallel code edits

Use **Next.js App Router + TypeScript + Tailwind + shadcn/ui + Motion + React Flow + Lucide + Zod**, deploy on Vercel. Prefer existing compatible stable versions rather than fighting dependency churn.

Architecture: a **client-driven single-page studio** with visible stages (Library, Extraction, Architect, Preview, Blueprint), persist state locally for hackathon. No database. A server route may handle optional LLM requests, but all essential flows work without it.

The application engine produces **data, not arbitrary AI-generated JavaScript**. React renders from validated configuration. The LLM never outputs code for execution.

Suggested core interfaces (final names can be agreed by agents, but freeze them early):

```ts
type ReuseKind = 'reuse' | 'adapt' | 'new';
type ModeId = 'lecture' | 'laboratory';
type VideoSource = {
  id: string;
  label: string;
  kind: 'physical-camera' | 'processed-view' | 'digital-media';
  physicalCameraId?: string; // professor and whiteboard share initial camera
  simulated: true;
};
type Lineage = {
  componentId: string;
  kind: ReuseKind;
  sampleProjectId?: string;
  sourceFile?: string;
  dependencies: string[];
  reason: string;
  proposedAmlosLayers: ('Camera'|'Hub'|'Edge')[];
  verificationRequired: string[];
};
type Scene = { id: string; label: string; visibleSourceIds: string[] };
type GeneratedApp = {
  id: string;
  title: string;
  institution: string;
  sources: VideoSource[];
  modes: Record<string, { scenes: Scene[]; studentSelectableIds: string[] }>;
  roles: { professor: string[]; student: string[] };
  lineage: Lineage[];
  assumptions: string[];
  sdkMappings: { layer: 'Camera'|'Hub'|'Edge'; proposedResponsibility: string; verified: false }[];
  approval: 'draft'|'approved';
};
```

**Single source of truth**: `GeneratedApp` lives in one studio store. The initial `GeneratedApp` must snapshot into `before`, and the lab request must produce a distinct `after` config object. Render previews, X-Ray and blueprint from these objects. Don't independently hardcode their contents.

Actual core fixtures:
- `classroom` sample manifest and existing `.tsx` components
- `remote-training` sample manifest and `.tsx` components
- initial university lecture request → three views / lecture mode
- lab change request → same three views plus physical workbench camera and fourth processed/live feed / laboratory mode
- rejection request for physically hidden view → validation warning

Implementation boundaries:
- `src/types/**`, `src/data/**`, `src/lib/engine/**`, `src/app/api/**`, `src/sample-apps/**`, `src/tests/unit/**` owned by **remote Codex**.
- `src/components/**`, `src/app/page.tsx`, `src/app/globals.css`, `src/store/**`, `public/**` owned by **local Codex**.
- `docs/**`, `tests/e2e/**`, audit notes and pitch material owned by **Claude Code**, after a usable integrated branch exists.
- `package.json`, dependency lockfile and `tsconfig` owned by **remote Codex** alone. Agree required libraries before initial bootstrap.

No two agents edit the same files simultaneously. All agents are instructed not to overwrite work outside their assigned area.

## 4. Design system — premium, black / red / white

**Product feel:** technical luxury + editorial restraint + clear engineering traceability. **NOT** generic dashboard, floating gradient blobs or neon cyberpunk. Designed for engineers with beautiful motion that serves the narrative.

```css
--canvas: #09090B;         /* near black */
--surface: #121215;        /* card surface */
--surface-raised: #1B1B1F;
--line: #2D2D32;
--primary: #E21C2A;       /* signature red */
--primary-hover: #FF3442;
--text: #F5F5F7;
--muted: #A4A4AB;
--dim: #73737B;
--reuse: #19B78A;         /* semantic status only */
--adapt: #65A6FF;         /* semantic status only */
--new: #F4B84A;           /* semantic status only */
```

Visual rules:
- General navigation and CTAs: red/white only. Semantic green/blue/amber appear only for REUSE/ADAPT/NEW diagnostics, not the whole app.
- Strong type hierarchy: large expressive editorial heading, geometric sans (Geist/Inter). Small monospaced labels for component IDs, capability names, file paths.
- Spacious 12-column desktop layout; left nav with 5 stages; right inspection panel; thin borders, restrained depth, subtle radial red spotlight.
- App Preview is intentionally differentiated: rendered **student/professor experience** can use a neutral bright canvas inside the black DNA studio, so viewers instantly understand they are looking at a generated customer-facing UI.
- Animations: 180–350ms smooth transitions for panels; one signature transition when X-Ray activates and when the lab mode is inserted. Reduced-motion fallback; no endless spinners or fake extraction percentages.
- The `Analyze DNA` motion may progressively reveal *real manifest entries*—must have identical underlying provenance data with animation off.
- Use safe mock local video stills or tiny local clips with `SIMULATED SOURCE` labelling; never rely on external streaming during demo.
- Brand as `CANON DNA — independent hackathon concept`; do not imply it is an official existing Canon product.
- Keyboard support, sensible focus, 390px layout checks; prioritize flawless 1440px on projector.

Home/dashboard suggested copy:
- Eyebrow: `ENGINEERING INTELLIGENCE / AMLOS`
- Hero: **"Build on what already exists."**
- Subhead: "Every approved application becomes intelligence for the next."
- Primary CTA: `Explore DNA Library` · Secondary CTA: `Create Application`
- A compact system summary: `2 sample applications · X reusable components · 3 AMLOS layers` (only grounded counts).

## 5. Agents and humans — division of labour

### Remote Dilab Codex — Lead engine / source of truth
- Scaffold the repo, configure dependencies, tests, local asset fallbacks and Vercel compatibility.
- Commit first the shared types, fixtures and manifest schema. Give local agent a stable base commit.
- Implement manifest-backed analysis (source path validators), source graph metadata, deterministic requirements interpretation, matching, configuration diff/merge, constraint validation, blueprint composition and approval recipe persistence helpers.
- Implement optional REAL AI route using a server-side environment key, structured output and Zod; never silently pretend fallback is a live LLM.
- Unit tests for view topology, permissions, update preservation, source manifest validity and rejection rule.
- Own configuration / build scripts and fix integration-level import problems.

### Local Codex — UI, preview, motion, product delight
- Build the polished black/red/white studio with sidebar/topbar and coherent stages.
- Build 2 strong sample project cards, extraction/graph interface, architect input, usable student/professor preview, lab-mode transition, comparison toggle, X-Ray inspector and blueprint approval screen.
- Use the remote's types/fixtures/engine exports rather than inventing separate arrays or fabricated data.
- Ensure ALL buttons in the pitch path actually do something; no fake generation sequence or screenshot-only UI.
- Own all visuals, responsive states, accessibility, sample media and motion.

### Claude Code — Adversarial reviewer + rehearsal engineer
- After the integrated app is available, inspect code/contracts for mismatches and challenge-brief mistakes.
- Run Playwright screenshots at 1440 / 768 / 390, fix only docs/e2e files unless Jash assigns a narrowly scoped source file.
- Test a fresh session through the exact pitch path; inspect runtime console, dead links, missing assets, overly slow animations, long paragraph clipping and no-key fallback.
- Write a five-minute speaking outline, three-minute Q&A crib sheet and honest limitations slide; maintain deck checklist.
- Report **blocking issues first**, no unsolicited rewrites of working features.

### Jash — Engineering lead / integration / demo operator
- Decide repo and deployment target, hand out branch boundaries, merge in order, resolve conflicts.
- Check every claimed capability against Canon official technical briefing.
- Test projector/browser, offline fallback, and run the five-minute live click path.
- Freeze scope and deploy stable commits. Prepare rollback screenshot/video if network fails.

### Vani — Pitch lead / product storytelling / visual quality
- Build a 6–7 slide PDF deck around Canon's problem → unique reuse → live classroom demo → X-Ray proof → realistic architecture → roadmap/impact.
- Evaluate whether each screen feels obviously understandable to a non-technical Canon judge; cut complex jargon.
- Capture final screenshots and operate clicker/backup if needed; rehearse timing and handoffs with Jash.
- Double-check sample project labelling, misleading AI/performance claims, and visible approvals.

## 6. Branching and integration protocol

1. Jash chooses one repo. Remote Codex creates initial scaffold and commits contracts + dependencies on `main` (or `bootstrap` then fast-forward to main) within the first 25 minutes.
2. Local Codex branches `feat/studio-ui` from that exact commit; remote continues `feat/dna-engine`. Do not work in the same working directory or branch.
3. Agent ownership fixed by folders above; when interface/type must change, write the change in `docs/contract-changes.md` and coordinate before edits.
4. Remote pushes `feat/dna-engine` early with importable helpers. Jash merges it to `integration` once tests pass.
5. Local rebases or merges against `integration` and pushes `feat/studio-ui`. Jash merges, runs `npm run build`, `npm run lint`, tests, then fixes only blockers.
6. Claude reviews integrated `integration` branch and writes tests/documentation in `qa/demo-audit`. Changes to source require explicit narrow ownership.
7. Deploy **the integrated branch to Vercel**. Set stable demo link before pitch. Once stable, tag `demo-freeze` and no new features.
8. For urgent failures use revert to latest green commit rather than last-minute architecture redesign.

**Definition of a passing integrated build:** run `npm run build`, typecheck, tests, and a fresh-browser end-to-end click path. A smoke test must not depend on `localStorage` left from prior demo.

## 7. Time-boxed plan (ET)

| Target time | Gate | Output |
|---|---|---|
| Sat 8:00–8:25 PM | Contract freeze | Repository, dependencies, typed fixtures and ownership committed |
| 8:25–10:15 PM | Parallel implementation | Engine produces configs; UI renders complete stage flow; slides underway |
| 10:15–11:00 PM | First integration | Lecture three-view app works end-to-end from requirements |
| 11:00 PM–12:30 AM | Differentiator integration | Lab four-view update, preservation/diff, X-Ray inspector and approval |
| 12:30–1:30 AM | Honest AI + finish | Optional LLM/fallback, validations, media, basic unit tests |
| 1:30–2:00 AM | Freeze | Build green; live deployment; screenshot/video backups |
| Sun 8:00–9:15 AM | Visual QA | 1440/768/mobile; fix P0 problems only |
| 9:15–10:00 AM | Pitch rehearsal | Two full timed runs; fix confusing click path |
| 10:00–11:00 AM | Slide finalization | PDF deck, verify links/screenshots/claims |
| 11:00 AM | Submit early | Do not rely on last-minute PDF submission |

These are control gates rather than promises of completion. If running behind at 10:15 PM, **simplify the graph to a reliable list and skip optional real AI route until the base flow is solid.** Protect rest and avoid unnecessary all-night feature expansion.

## 8. Exact Sunday 5-minute demo (including slides)

- **0:00–0:35** — Canon problem (~3 months today, goal ~3 weeks). "Why build each custom AMLOS application from scratch when prior approved solutions already contain reusable engineering decisions?"
- **0:35–1:10** — Library: two *team-created sample* applications. Analyze classroom; point at real component origins and dependent AMLOS layers.
- **1:10–2:05** — Architect: paste university requirements, show REUSE/ADAPT/NEW with reasons; open student viewer, select professor, whiteboard, slides.
- **2:05–3:05** — Next-day change: add lab workbench camera, watch configuration change to 4 views, switch Lecture/Lab and toggle Before/After. This is the main dramatic moment.
- **3:05–4:05** — X-Ray: click reuse and adaptation nodes; show file origin, capability mapping and outstanding verification. Optional camera physical-coverage rejection if time permits.
- **4:05–4:45** — Blueprint: Camera / Hub / Edge, assumptions, human review; approve. Show new recipe in library.
- **4:45–5:00** — Close: "Canon has built the technology that transforms how people see. Canon DNA transforms how applications using it are built."

## 9. Four judging criteria: evidence we must show

| Criterion | On-screen proof |
|---|---|
| Value to Canon | Library reuse, original application preserved, next-day change without rebuilding, approved recipe re-enters library |
| Feasible / works | Stable 3→4 views config, student/professor interactions, honest Camera/Hub/Edge mapping, real UI behavior |
| AI + responsible data | Structured requirement interpretation, matching/explanation, Zod checks, explicit SDK verification flags, only mock/sample files, deterministic fallback disclosed |
| Pitch clarity | One university story, 5-minute path, visible comparison, simple provenance explanation, crisp approval outcome |

## 10. Demo-blocking acceptance tests

- Fresh incognito window opens successfully (no setup, no credential, no API key required).
- Library has **exactly labelled** team-created sample projects; manifest paths point to actual repo files.
- Analyze shows data grounded in manifests; no fictional "scanned Canon source" claims.
- Initial input produces two camera-derived views + one slides media source, not three physical cameras.
- Student view can select 3 content views; student CANNOT operate camera PTZ.
- A lab change adds the second physical camera and fourth selectable view.
- Switching back to Lecture still yields the original 3-view configuration.
- Before/After diffs are computed from actual configuration objects.
- X-Ray component click reveals correct origin and classification.
- Unsatisfiable hidden camera view triggers warning (P1 if cut).
- Blueprint shows **proposed**, unverified AMLOS mappings, and a human approval gate.
- Approved recipe appears in library after refresh (no shared database claim).
- No broken or dead demo CTA; keyboard navigable; no horizontal overflow at 390px.
- Vercel production deploy loads and entire demo path succeeds.
- PDF deck exists and is submitted before Sunday noon.

## 11. Honest technical/brand messaging

Use these exact concepts:
- "Team-created sample React applications" rather than "Canon customer repositories".
- "Manifest-backed component analysis" rather than full automated code archaeology unless implemented.
- "Proposed AMLOS SDK mapping; engineering verification required" rather than SDK integration.
- "Simulated media sources" rather than live camera streams.
- "Reusable recipe added to local library" rather than model retraining.
- "Rule-based fallback demo mode" if no live LLM is actually invoked.
- "Path to reducing engineering iteration" rather than claiming a proven 3-month→3-week acceleration.

Canon's technical briefing also states that hackathon ideas are treated as **open/non-confidential** and may be freely used by Canon without payment or IP claim; a separate continuing-team agreement follows later. Don't share credentials, private source, or proprietary data. Verify terms independently before any continuing-team commitment.

## 12. Build-phase roadmap after selection (not weekend work)

1. **Validate** with Canon/system integrators: interviews and task observations; quantify current customization and reuse opportunities; assess whether Canon's internal work already solves pieces of this.
2. **Authorized source extraction** from approved Canon applications, real dependency tracing, security/compliance review and curated reusable patterns.
3. **SDK prototype** against Canon Camera, Hub and Edge docs/APIs; build and test generated UIs on their permitted infrastructure.
4. **Evaluate** time-to-design, correctness, reviewer effort, provenance accuracy, reusability and new-customer change success; iterate with Canon.

**Tomorrow's job is to prove the idea. Not to secretly build the entire future company in one night.**
