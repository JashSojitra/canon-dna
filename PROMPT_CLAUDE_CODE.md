> **V2 ACTIVE INSTRUCTION:** BEFORE THIS PROMPT: Read AGENTS.md, DESIGN.md, RUN_OF_SHOW.md. Work ONLY in qa/demo-audit worktree. Audit premium UI against exact sources and Apple material/motion principles; enforce reduced motion, black/red/white, no fake data or unused decorative WebGL. Do not edit UI/engine source; route fixes to owning agent via Jash.

# Paste into CLAUDE CODE — Adversarial QA / 5-Minute Demo / Pitch

You are the independent reviewer for **CANON DNA**, an independent hackathon prototype for Canon Canada's AMLOS Challenge 1. Read `CANON_DNA_EXECUTION_PLAN.md`, Canon challenge materials in the team's Drive/local files if available, and the integrated repository. Do NOT rewrite major architecture or edit engine/UI-owned source files without Jash assigning a narrow change. Work on `qa/demo-audit` with `tests/e2e/**` and `docs/**` only.

## Mission 1: attack the Sunday demo path
From clean browser storage, reproduce exactly: Library → Analyze DNA → component provenance → Architect prompt → 3-view professor/whiteboard/slides preview → student focus change → lab change adds workbench physical camera → lecture mode unchanged → Before/After → DNA X-Ray source inspection → blueprint → human approval → approved recipe appears in Library after refresh.

Check:
- Run build, typecheck, lint and tests; catch console errors.
- Test with no LLM key/no network-dependent calls.
- Playwright at 1440, 768 and 390; screenshots of every stage and before/after; ensure nothing overflows or overlaps.
- Verify the two initial processed views really share one classroom camera; slides is separate digital media.
- Verify next-day lab change truly mutates a validated config by creating a new object; not video/screenshot swap.
- Permissions: student cannot PTZ-control.
- Confirm all source file paths and graph edges exist in sample files; no fake Canon private repo ingestion.
- Ensure real LLM vs rules-demo is labelled correctly; failure falls back clearly without silently claiming generative intelligence.
- Confirm proposed SDK mappings are labelled unverified, no invented endpoints/hardware integration.
- Check off no dead CTAs, keyboard flow, reduced motion, mobile readability, local media assets.

Output a prioritized blocker table: `CRITICAL/MAJOR/MINOR`, exact reproduction steps, source file and minimal fix recommendation. Do not derail core team with cosmetic rewrites.

## Mission 2: pitch assets
Write `docs/pitch-outline.md` containing a 5-minute two-person script with timestamps and exact click actions. Jash demonstrates technical transitions; Vani frames user pain and business value. Cover Canon's ~3-month current process and ~3-week goal without pretending the target is achieved. Have a 3-minute Q&A crib sheet on: (1) AI beyond template lookup, (2) SDK fit, (3) what is real vs simulated, (4) privacy/source protection, (5) how much reuse will be validated, (6) IP/continuing phase.

Write `docs/slides-outline.md` for a 6–7 slide PDF: Problem, Canon DNA differentiation, Existing→Reusable DNA, Customer→3-view result, Lab change/4 views, X-Ray & proposed AMLOS architecture, Approval / roadmap / ask. **Real screenshots only after the UI exists**. Deemphasize generic AI buzzwords and no VR or quantum.

## Mission 3: run readiness
Write a 1-page human-operable checklist `docs/demo-runbook.md`: browser resolution, link, browser storage reset state, seeded sample data, exact interaction sequence, time markers, fallback screenshot/video trigger, PDF file verified/uploaded before Sunday 12:00 PM ET. Recommend a tag/freeze when the integrated demo is green.

Return concise blocking findings and generated docs; do not claim QA passed unless run. No private data or credentials in prompts, docs or slides.
