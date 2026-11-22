> **V2 ACTIVE INSTRUCTION:** BEFORE THIS PROMPT: Read AGENTS.md, DESIGN.md, RUN_OF_SHOW.md and source links. Use Apple Design + User Interface Wiki as primary design rules; selectively borrow editable properly licensed Componentry/Skiper components, Animmaster/ThreeUI only as scoped inspiration. High-craft matte-black/red/white with sparing functional glass and meaningful fluid motion. Work ONLY in local feat/studio-ui worktree after merged contracts; do not modify package.json, types or engine.

# Paste into LOCAL CODEX — Premium Studio UI & Live Preview

You own the **visual product experience** for **CANON DNA**, an independent Canon AMLOS hackathon prototype. Read `CANON_DNA_EXECUTION_PLAN.md` and the remote Codex `docs/contracts.md`. Branch `feat/studio-ui` from the committed shared contracts. Do not invent incompatible types or duplicate engine data.

## Product direction — non-negotiable
Ultra-premium engineering platform, palette near-black #09090B, graphite #121215, signature red #E21C2A, ivory-white #F5F5F7; muted secondary gray. REUSE/ADAPT/NEW states may use restrained green/blue/amber ONLY as semantic accents, especially in X-Ray. No cheesy gradients, generic admin template, excessive pills or neon cyberpunk. Prefer Geist/Inter and beautiful typography, thin lines, precise spacing, strong hierarchy and fluid meaningful 180–350ms motion. Brand header: CANON DNA / INDEPENDENT HACKATHON CONCEPT. Hero: 'Build on what already exists.'

## File ownership
ONLY `src/components/**`, `src/app/page.tsx`, `src/app/globals.css`, `src/store/**`, `public/**`. Remote Codex alone owns `src/types/**`, `src/data/**`, `src/lib/**`, `src/app/api/**`, sample code, and dependencies. Communicate required package additions; do NOT edit package.json. Do not rewrite shared types.

## UX: one coherent studio with 5 connected stages
1. **DNA Library**: gorgeous editorial landing, 2 labelled team-created sample app cards (Classroom, Remote Training), real stats, click to Analyze DNA. Make clear no actual Canon source is scanned.
2. **DNA Extraction**: sophisticated graph/table view with meaningful manifest edges; click node to inspect source file, dependencies, functions, proposed AMLOS layer, reuse status. `Analyze DNA` may animate reveal, but no fake AI scans/progress.
3. **AI Architect**: prompt box preloaded with official university scenario, structured requirements, Generate button, REUSE/ADAPT/NEW matched parts with explanations; disclose whether response used real LLM or fallback rules.
4. **Live App Preview**: the most important screen. Distinct believable classroom student and professor UI, polished local mock imagery/media, three working views (professor/whiteboard/slides), scene switch, focus swap, fullscreen; no student PTZ controls. User types next-day lab requirement; click Update: show genuine updated fourth workbench view and Laboratory mode while Lecture remains usable. Include accessible Before/After toggle. **All visual states from remote engine's validated `GeneratedApp`, not screenshot swapping or local fake data.**
5. **DNA X-Ray inside Preview**: click a toolbar toggle and transform the live preview into component-inspection mode. Highlight reused/adapted/new actual components, click a component to see its source file, origin, explanation, dependencies, proposed AMLOS mapping and verification needed. This is the primary signature visual. Wire to same engine config.
6. **Blueprint & Approval**: clear media topology, roles, modes, Camera/Hub/Edge mapping marked proposed, assumptions, engineer review flags. Request Changes returns to Architect. Approve Design saves a new recipe via localStorage and it appears in Library after refresh.

## Motion and quality
- Large visual moments for Library→Extraction, initial preview launch, 3→4 view lab transformation, and X-Ray toggle; every animation aids comprehension.
- Teacher/student preview should feel like REAL software, not merely thumbnail cards. Use demo media locally or SVG posters; any static footage must be labelled simulated.
- Provide stage navigation, previous/back links, progress indicator; no dead buttons. Smooth but no theatrical delay. Keyboard accessible and reduced-motion fallback.
- 1440px projector first, then 390px mobile. Work without network/API key once loaded.
- If React Flow graph jeopardizes core flow, ship a high-quality interactive node-list / dependency diagram. 3→4 view change and X-Ray are more important.

## Shared state
Use a single store (zustand if included; otherwise React context) with project selection, requirements, current generated app, immutable `before` version, `after` update, selected mode, selected focus/view, X-Ray selected node, and approved recipes in local storage. No duplicated independent arrays across screens. Handle incognito new run cleanly.

## Acceptance checks
A presenter can do: Library→Analyze→Architect→Generate→Student chooses 3 views→Lab update→4 views→Lecture still works→Before/After→X-Ray details→Blueprint→Approve→Library shows recipe; all working on Vercel without API key. Real professional polish > feature count.

Deliver pushed `feat/studio-ui` branch, screenshots at 1440 and 390, and a precise list of remaining blockers. Never change engine-owned files.
