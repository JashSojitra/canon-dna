# CANON DNA — START HERE (V2)

**Hackathon:** Canon AMLOS / November 21–22, 2026. **Official deck deadline:** Sunday 12:00 PM ET.

## First do this
1. Read `CANON_DNA_EXECUTION_PLAN.md`, `AGENTS.md`, `DESIGN.md`, and `RUN_OF_SHOW.md`.
2. Create ONE private GitHub repo (`canon-dna`), not three disconnected codebases.
3. Commit these docs to `main` first; let **remote Dilab Codex** scaffold the Next.js foundation and freeze shared TypeScript contracts.
4. After the contracts have been pushed to `main`, create separate working branches/worktrees for local Codex and Claude Code.
5. Tell each agent to read `AGENTS.md` and its role prompt. Each agent edits **only** its files. Jash is the only integrator into `main`.
6. Run the initial 3-view classroom -> 4-view laboratory demo from a clean browser, then deploy and rehearse.

## Files and owners
- `AGENTS.md` — repository instructions binding on all agents.
- `CLAUDE.md` — automatic Claude Code entrypoint pointing to the QA role and rules.
- `DESIGN.md` — exact black/red/white aesthetic, Apple design and library references.
- `RUN_OF_SHOW.md` — Windows/remote terminal steps, branch strategy, PR cadence, acceptance gates, emergency recovery.
- `CANON_DNA_EXECUTION_PLAN.md` — product/architecture/source of truth.
- `PROMPT_REMOTE_DILAB_CODEX.md` — remote engine owner, sent after repo created.
- `PROMPT_LOCAL_CODEX.md` — UI owner, sent after bootstrap contract is on main.
- `PROMPT_CLAUDE_CODE.md` — QA + pitch owner, sent after there is an integrated app, or earlier for docs only.

## Critical truthfulness
No real Canon SDK access this weekend. Sample projects are team-created, and any SDK mapping is a **proposal**. Do not say a rules fallback was an LLM result. No fake performance numbers, private Canon sources, or pretend camera integrations.
