# CANON DNA — shared agent instructions

All agents MUST read `CANON_DNA_EXECUTION_PLAN.md`, `DESIGN.md`, `RUN_OF_SHOW.md` before writing code. Treat this file as higher priority than ad-hoc visual experimentation. Follow your assigned role prompt.

## Mission and truth
- Canon DNA = sample-project DNA extraction -> reuse matching -> customer requirements -> generated structured application recipe -> interactive classroom preview -> controlled lab update -> DNA X-Ray/provenance -> engineering approval -> reusable library recipe.
- It is an independent Canon AMLOS hackathon concept, **not an official Canon product**.
- Only team-created sample apps and approved public/supplied materials. No real Canon private code, no invented SDK endpoints, no actual hardware/API integration.
- Canon AMLOS Camera = source/image-processing/control, Hub = media aggregation/distribution, Edge = web UI hosting. Label proposed mappings as UNVERIFIED.
- Most important demo: initial three sources (Professor + Whiteboard processed views from ONE physical camera; Slides = digital source), then add Workbench from SECOND physical camera for four selectable views; existing Lecture mode still works.
- `GeneratedApp` validated configuration is the ONE source for preview, X-Ray, blueprint, and approval. No independent hardcoded stories.
- Implement optional genuine LLM only if reliable; always retain a visible truthful deterministic fallback.

## Design non-negotiables
- **Dark luxury engineering studio**: near-black, red, white, neutral grays. Glass is limited to floating chrome/inspector/sheets. NO big glowing blobs, neon rainbows, generic card dashboards, 3D room, VR or quantum.
- Use `DESIGN.md` for typography, glass, motion, component selection and installed skills. Motion must communicate state changes. Default one signature effect on the screen, not all effects simultaneously.
- All third-party component source must be checked for licensing/attribution and copied/adapted deliberately. Do not install paid-only components without access or copy premium code from previews.

## Branches and file locks
| Agent | Branch | Editable files |
|---|---|---|
| Remote Dilab Codex | `feat/dna-engine` | `src/types/**`, `src/data/**`, `src/lib/engine/**`, `src/app/api/**`, `src/sample-apps/**`, `src/tests/unit/**`, dependency manifests/config; `docs/contracts.md` |
| Local Codex | `feat/studio-ui` | `src/components/**`, `src/app/page.tsx`, `src/app/globals.css`, `src/store/**`, `public/**` |
| Claude Code | `qa/demo-audit` | `tests/e2e/**`, `docs/pitch-*`, `docs/slides-*`, `docs/qa-*`, `docs/demo-*` |

- **Only remote owns `package.json`/lockfile/tsconfig**. Local informs Jash of needed dependencies; remote installs and pushes them. Avoid component registries that unexpectedly overwrite shared config.
- No editing `AGENTS.md`, `DESIGN.md`, or other agents' files without Jash approving a coordinated change.
- `main` is integration-only. **No agent pushes directly to `main`** after bootstrap. Never force push, discard teammate changes, cherry-pick unreviewed branches or reformat unrelated files.
- Each PR must state: what changed, exact files, tests, demo relevance, known limitations, dependencies/contract changes, before/after screenshots if UI.
- At task start: `git status -sb`, `git branch --show-current`, `git fetch origin`. If wrong branch/worktree, STOP and report. Do not work on a dirty or ambiguous base without review.
- Every 30-45 minutes or completed feature: small atomic commit and push to your own branch; send PR link/commit hash and any blockers to Jash.

## Quality gates
- Typecheck, lint, tests, production build pass; no console errors. Every clickable control must work.
- 1440x900 projector view is primary; 390px iPhone + 768px tablet must be usable; reduced motion and keyboard navigation.
- No remote network or LLM dependency in the main demo; load local assets. Changes survive refresh as specified.
- QA priority: broken story > bad data claims > missing UI wiring > unreadable typography > optional effects.
